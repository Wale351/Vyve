import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Generate a deterministic password from Privy user ID and a secret
async function generateDeterministicPassword(privyUserId: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(privyUserId + secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  // encode returns Uint8Array, convert to string
  const hexBytes = encodeHex(hashArray);
  return new TextDecoder().decode(hexBytes);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const { privy_user_id, wallet_address, email } = await req.json();

    // Validate input
    if (!privy_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing Privy user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize wallet address
    const normalizedWallet = wallet_address?.toLowerCase();
    
    // Build a unique email for this Privy user
    // Use their actual email if provided, otherwise generate one from Privy ID
    // Sanitize the Privy ID to create a valid email (remove colons, replace with dashes)
    const sanitizedPrivyId = privy_user_id.replace(/:/g, '-').replace(/[^a-zA-Z0-9-_.]/g, '');
    const generatedEmail = `${sanitizedPrivyId}@privy.vyve.app`;
    let userEmail = email || generatedEmail;

    console.log(`Authenticating Privy user: ${privy_user_id}, wallet: ${normalizedWallet || 'none'}`);

    let userId: string | null = null;
    let existingUserEmail: string | null = null;

    // First, check if a profile already exists for this wallet
    if (normalizedWallet) {
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("wallet_address", normalizedWallet)
        .maybeSingle();

      if (existingProfile) {
        userId = existingProfile.id;
        console.log(`Found existing profile by wallet: ${normalizedWallet}`);
        
        // Get the user's actual email from auth.users
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId as string);
        if (userData?.user?.email) {
          existingUserEmail = userData.user.email;
          console.log(`Found existing user email: ${existingUserEmail}`);
        }
      }
    }

    // If no profile found by wallet, check by Privy user metadata or email patterns
    if (!userId) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      
      // Build possible email patterns (both old format with colons and new sanitized format)
      const oldFormatEmail = `${privy_user_id}@privy.vyve.app`;
      
      if (usersData?.users) {
        // Look for user with matching Privy ID in metadata or any known email pattern
        const existingUser = usersData.users.find(u => 
          u.user_metadata?.privy_user_id === privy_user_id ||
          u.email === userEmail ||
          u.email === generatedEmail ||
          u.email === oldFormatEmail ||
          (u.email && u.email.includes(sanitizedPrivyId))
        );
        
        if (existingUser) {
          userId = existingUser.id;
          existingUserEmail = existingUser.email || null;
          console.log(`Found existing user by Privy ID or email: ${existingUserEmail}`);
        }
      }
    }

    // Use the existing email if found, otherwise use the new generated one
    if (existingUserEmail) {
      userEmail = existingUserEmail;
    }

    // If still no user, create a new one
    if (!userId) {
      console.log(`Creating new user for Privy ID: ${privy_user_id}`);

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        user_metadata: {
          privy_user_id,
          wallet_address: normalizedWallet,
        },
      });

      if (createError || !newUser?.user) {
        console.error("Create user error:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = newUser.user.id;

      // Create profile row if wallet is available
      if (normalizedWallet) {
        await supabaseAdmin
          .from("profiles")
          .upsert({ 
            id: userId, 
            wallet_address: normalizedWallet 
          }, { onConflict: "id" });
      }
    } else {
      // Update existing user's metadata and profile wallet if needed
      if (normalizedWallet) {
        // Update profile wallet address if not set
        await supabaseAdmin
          .from("profiles")
          .update({ wallet_address: normalizedWallet })
          .eq("id", userId)
          .is("wallet_address", null);
      }
    }

    console.log(`User ready: ${userId}, initial email: ${userEmail}`);

    // Ensure the auth user has a valid email that exists in Supabase Auth
    // (required for generateLink -> verifyOtp impersonation flow)
    if (userId) {
      const { data: userById, error: userByIdError } = await supabaseAdmin.auth.admin.getUserById(userId as string);

      if (userByIdError || !userById?.user) {
        console.error("Auth user lookup failed:", userByIdError);
        return new Response(
          JSON.stringify({ error: "Failed to find auth user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const currentEmail = userById.user.email;

      // If the stored email is missing/invalid (e.g. old did:privy:* format), set a deterministic valid email.
      if (!currentEmail || currentEmail.includes(":")) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId as string, {
          email: generatedEmail,
          email_confirm: true,
        });

        if (updateError) {
          console.error("Update user email error:", updateError);
          return new Response(
            JSON.stringify({ error: "Failed to update user email" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        userEmail = generatedEmail;
      } else {
        userEmail = currentEmail;
      }
    }

    console.log(`Using email for session: ${userEmail}`);

    // Generate a deterministic password based on Privy user ID + a secret
    // This allows reliable signInWithPassword without sending emails
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const deterministicPassword = await generateDeterministicPassword(privy_user_id, serviceKey);

    // Ensure the user has this password set
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(userId as string, {
      password: deterministicPassword,
    });

    if (passwordError) {
      console.error("Update password error:", passwordError);
      return new Response(
        JSON.stringify({ error: "Failed to prepare authentication" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sign in with the deterministic password
    const { data: sessionData, error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email: userEmail,
      password: deterministicPassword,
    });

    if (signInError || !sessionData?.session) {
      console.error("Sign in error:", signInError);
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Session created for Privy user: ${privy_user_id}`);

    console.log(`Session created for Privy user: ${privy_user_id}`);

    return new Response(
      JSON.stringify({
        session: sessionData.session,
        user: sessionData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

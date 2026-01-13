import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    const userEmail = email || `${sanitizedPrivyId}@privy.vyve.app`;

    console.log(`Authenticating Privy user: ${privy_user_id}, wallet: ${normalizedWallet || 'none'}`);

    let userId: string | null = null;

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
      }
    }

    // If no profile found by wallet, check by Privy user metadata
    if (!userId) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      
      if (usersData?.users) {
        // Look for user with matching Privy ID in metadata
        const existingUser = usersData.users.find(u => 
          u.user_metadata?.privy_user_id === privy_user_id ||
          u.email === userEmail
        );
        
        if (existingUser) {
          userId = existingUser.id;
          console.log(`Found existing user by Privy ID or email`);
        }
      }
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

    console.log(`User ready: ${userId}`);

    // Create session using recovery link
    let sessionData = null;
    let lastError = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: userEmail,
      });

      const emailOtp = linkData?.properties?.email_otp;

      if (linkError || !emailOtp) {
        console.error(`Generate link error (attempt ${attempt + 1}):`, linkError);
        lastError = linkError;
        continue;
      }

      const { data, error: sessionError } = await supabaseAuth.auth.verifyOtp({
        email: userEmail,
        token: emailOtp,
        type: "recovery",
      });

      if (sessionError) {
        console.error(`Verify OTP error (attempt ${attempt + 1}):`, sessionError);
        lastError = sessionError;
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        continue;
      }

      if (data?.session) {
        sessionData = data;
        break;
      }
    }

    if (!sessionData?.session) {
      console.error("Failed to create session after retries:", lastError);
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

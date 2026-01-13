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
    // IMPORTANT: listUsers is paginated; we need to scan pages to reliably find existing accounts.
    if (!userId) {
      // Build possible email patterns (both old format with colons and new sanitized format)
      const oldFormatEmail = `${privy_user_id}@privy.vyve.app`;

      for (let page = 1; page <= 10 && !userId; page++) {
        const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: 1000,
        });

        if (listError) {
          console.error("List users error:", listError);
          break;
        }

        const users = usersData?.users ?? [];
        if (users.length === 0) break;

        // Look for user with matching Privy ID in metadata or any known email pattern
        const existingUser = users.find(
          (u) =>
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
          break;
        }

        // If this page is not full, there's nothing more to scan.
        if (users.length < 1000) break;
      }
    }

    // Use the existing email if found, otherwise use the new generated one
    if (existingUserEmail) {
      userEmail = existingUserEmail;
    }

    // If still no user, create a new one
    if (!userId) {
      console.log(`Creating new user for Privy ID: ${privy_user_id}`);

      let createdUserId: string | null = null;
      let lastCreateError: any = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: userEmail,
          email_confirm: true,
          user_metadata: {
            privy_user_id,
            wallet_address: normalizedWallet,
          },
        });

        if (createError || !newUser?.user) {
          lastCreateError = createError;
          console.error(`Create user error (attempt ${attempt + 1}):`, createError);

          if (attempt < 1) {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
          continue;
        }

        createdUserId = newUser.user.id;
        break;
      }

      // If creation failed, attempt recovery: the user may already exist but we didn't find them yet.
      if (!createdUserId) {
        console.warn("Create user failed; attempting to recover existing user by email patterns");
        const oldFormatEmail = `${privy_user_id}@privy.vyve.app`;

        for (let page = 1; page <= 10 && !createdUserId; page++) {
          const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage: 1000,
          });

          if (listError) {
            console.error("List users error during recovery:", listError);
            break;
          }

          const users = usersData?.users ?? [];
          if (users.length === 0) break;

          const existingUser = users.find(
            (u) =>
              u.user_metadata?.privy_user_id === privy_user_id ||
              u.email === userEmail ||
              u.email === generatedEmail ||
              u.email === oldFormatEmail ||
              (u.email && u.email.includes(sanitizedPrivyId))
          );

          if (existingUser) {
            createdUserId = existingUser.id;
            existingUserEmail = existingUser.email || null;
            console.log(`Recovered existing user: ${existingUserEmail}`);
            break;
          }

          if (users.length < 1000) break;
        }

        if (!createdUserId) {
          // Keep the user-facing error generic; the logs have the real failure reason.
          return new Response(
            JSON.stringify({ error: "Failed to create account" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      userId = createdUserId;

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

    // Create a session using an admin-generated magic link (no email is sent)
    // This relies on the Supabase Auth "Email" provider being enabled.
    let sessionData: any = null;
    let lastError: any = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: userEmail,
      });

      if (linkError) {
        lastError = linkError;
        console.error(`Generate link error (attempt ${attempt + 1}):`, linkError);
        continue;
      }

      const hashedToken = linkData?.properties?.hashed_token;
      const emailOtp = linkData?.properties?.email_otp;

      const verifyArgs: any = hashedToken
        ? { type: "magiclink", token_hash: hashedToken }
        : { type: "magiclink", email: userEmail, token: emailOtp };

      const { data, error: verifyError } = await supabaseAuth.auth.verifyOtp(verifyArgs);

      if (verifyError) {
        lastError = verifyError;
        console.error(`Verify OTP error (attempt ${attempt + 1}):`, verifyError);

        // This is a project configuration issue: Auth -> Providers -> Email is disabled.
        if ((verifyError as any)?.code === "email_provider_disabled") {
          return new Response(
            JSON.stringify({
              error:
                "Supabase Email provider is disabled. Enable Authentication → Providers → Email in your Supabase dashboard.",
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 150));
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

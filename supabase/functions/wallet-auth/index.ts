import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyMessage } from "https://esm.sh/viem@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Cryptographically verify Ethereum signature using viem
async function verifySignature(
  message: string,
  signature: string,
  address: string
): Promise<boolean> {
  try {
    // Basic format validation
    if (!signature || signature.length !== 132 || !signature.startsWith("0x")) {
      console.error("Invalid signature format");
      return false;
    }
    
    if (!address || address.length !== 42 || !address.startsWith("0x")) {
      console.error("Invalid address format");
      return false;
    }

    // Cryptographically verify the signature and recover the address
    const isValid = await verifyMessage({
      message,
      signature: signature as `0x${string}`,
      address: address as `0x${string}`,
    });

    if (!isValid) {
      console.error("Signature verification failed - address mismatch");
      return false;
    }

    console.log("Signature verified successfully");
    return true;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    // Use service role for admin operations + anon for session creation (verifyOtp)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const { wallet_address, signature, message } = await req.json();

    // Validate input
    if (!wallet_address || !signature || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize address to lowercase
    const normalizedAddress = wallet_address.toLowerCase();

    // Verify the message contains the expected format and is recent
    if (!message.includes("Sign in to Vyve")) {
      console.error("Invalid message format");
      return new Response(
        JSON.stringify({ error: "Invalid message format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract and validate timestamp from message to prevent replay attacks
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (timestampMatch) {
      const messageTimestamp = parseInt(timestampMatch[1], 10);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (now - messageTimestamp > fiveMinutes) {
        console.error("Message expired - timestamp too old");
        return new Response(
          JSON.stringify({ error: "Signature expired, please try again" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Cryptographically verify signature
    const isValid = await verifySignature(message, signature, normalizedAddress);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Authenticating wallet: ${normalizedAddress}`);

    // Build the expected email for this wallet
    const email = `${normalizedAddress}@wallet.vyve.app`;

    // First, check if a profile already exists for this wallet
    const { data: existingProfile, error: profileLookupError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("wallet_address", normalizedAddress)
      .maybeSingle();

    if (profileLookupError) {
      console.error("Profile lookup error:", profileLookupError);
    }

    let userId: string | null = existingProfile?.id ?? null;

    // If no profile found, check if auth user exists by email
    if (!userId) {
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (!listError && usersData?.users) {
        const existingAuthUser = usersData.users.find(u => u.email === email);
        if (existingAuthUser) {
          userId = existingAuthUser.id;
          console.log(`Found existing auth user by email: ${normalizedAddress}`);
          
          // Ensure profile exists for this user
          await supabaseAdmin
            .from("profiles")
            .upsert({ id: userId, wallet_address: normalizedAddress }, { onConflict: "id" });
        }
      }
    }

    // If still no user, create a new one
    if (!userId) {
      console.log(`Creating new user for wallet: ${normalizedAddress}`);

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          wallet_address: normalizedAddress,
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

      // Create profile row
      await supabaseAdmin
        .from("profiles")
        .upsert({ id: userId, wallet_address: normalizedAddress }, { onConflict: "id" });
    }

    console.log(`User ready for wallet: ${normalizedAddress}, userId: ${userId}`);

    // Create a session using recovery link - more reliable than magiclink for programmatic auth
    // Retry logic to handle race conditions with concurrent requests
    let sessionData = null;
    let lastError = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: email!,
      });

      const emailOtp = linkData?.properties?.email_otp;

      if (linkError || !emailOtp) {
        console.error(`Generate link error (attempt ${attempt + 1}):`, linkError);
        lastError = linkError;
        continue;
      }

      const { data, error: sessionError } = await supabaseAuth.auth.verifyOtp({
        email: email!,
        token: emailOtp,
        type: "recovery",
      });

      if (sessionError) {
        console.error(`Verify OTP error (attempt ${attempt + 1}):`, sessionError);
        lastError = sessionError;
        // Small delay before retry to avoid race condition
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

    console.log(`Session created for wallet: ${normalizedAddress}`);

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

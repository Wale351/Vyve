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
    
    // Use service role to create/manage users
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Create email from wallet address for Supabase auth
    const email = `${normalizedAddress}@wallet.vyve.app`;

    // Check if user already exists using admin API
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      console.log(`Existing user found: ${normalizedAddress}`);
      userId = existingUser.id;
      
      // Update profile with wallet address if needed
      await supabase
        .from("profiles")
        .upsert({
          id: userId,
          wallet_address: normalizedAddress,
        }, { onConflict: "id" });
    } else {
      // Create new user with admin API (no password needed)
      console.log(`Creating new user for wallet: ${normalizedAddress}`);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
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
      console.log(`New user created: ${normalizedAddress}`);
    }

    // Generate a magic link to create a session (works without email provider)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError || !linkData) {
      console.error("Generate link error:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token from the link and verify it to get a session
    const token = linkData.properties?.hashed_token;
    if (!token) {
      console.error("No token in link data");
      return new Response(
        JSON.stringify({ error: "Failed to generate session token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the OTP to get a session
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      email,
      token: linkData.properties.email_otp,
      type: "magiclink",
    });

    if (sessionError || !sessionData?.session) {
      console.error("Verify OTP error:", sessionError);
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

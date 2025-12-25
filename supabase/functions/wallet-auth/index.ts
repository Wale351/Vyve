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
    const password = `wallet_${normalizedAddress}_${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.slice(-16)}`;

    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInData?.session) {
      console.log(`Existing user signed in: ${normalizedAddress}`);
      
      // Update profile with wallet address if needed
      await supabase
        .from("profiles")
        .upsert({
          id: signInData.user.id,
          wallet_address: normalizedAddress,
        }, { onConflict: "id" });

      return new Response(
        JSON.stringify({
          session: signInData.session,
          user: signInData.user,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // User doesn't exist, create new account
    console.log(`Creating new user for wallet: ${normalizedAddress}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        wallet_address: normalizedAddress,
      },
    });

    if (signUpError) {
      console.error("Sign up error:", signUpError);
      return new Response(
        JSON.stringify({ error: "Failed to create account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create profile for new user
    if (signUpData?.user) {
      await supabase
        .from("profiles")
        .insert({
          id: signUpData.user.id,
          wallet_address: normalizedAddress,
        });
    }

    // Sign in the newly created user
    const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (newSignInError || !newSignIn?.session) {
      console.error("New user sign in error:", newSignInError);
      return new Response(
        JSON.stringify({ error: "Failed to sign in new user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`New user created and signed in: ${normalizedAddress}`);

    return new Response(
      JSON.stringify({
        session: newSignIn.session,
        user: newSignIn.user,
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

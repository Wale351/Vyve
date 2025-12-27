import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

// Web Push crypto utilities for Deno
async function generateVapidAuthHeader(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  subject: string
): Promise<{ authorization: string; cryptoKey: string }> {
  const urlParts = new URL(endpoint);
  const audience = `${urlParts.protocol}//${urlParts.host}`;
  
  // Create JWT header and payload
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject,
  };

  // Base64url encode
  const base64url = (data: string) => 
    btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const privateKeyBytes = Uint8Array.from(atob(vapidPrivateKey.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = base64url(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${unsignedToken}.${signatureB64}`;

  return {
    authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    cryptoKey: vapidPublicKey,
  };
}

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
    
    // For now, send unencrypted push (most browsers support this)
    // Full encryption would require implementing RFC 8291
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TTL": "86400",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 201) {
      console.log(`Push notification sent to ${subscription.endpoint.slice(0, 50)}...`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Push failed with status ${response.status}: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { streamer_id, stream_title, stream_id } = await req.json();

    if (!streamer_id) {
      return new Response(
        JSON.stringify({ error: "streamer_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get streamer info
    const { data: streamer } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", streamer_id)
      .single();

    if (!streamer) {
      return new Response(
        JSON.stringify({ error: "Streamer not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get users who have enabled notifications for this streamer
    const { data: subscribers } = await supabase
      .from("notification_preferences")
      .select("user_id")
      .eq("streamer_id", streamer_id)
      .eq("notify_on_live", true);

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers for streamer:", streamer_id);
      return new Response(
        JSON.stringify({ message: "No subscribers to notify", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userIds = subscribers.map((s) => s.user_id);

    // Get push subscriptions for these users
    const { data: pushSubscriptions } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);

    if (!pushSubscriptions || pushSubscriptions.length === 0) {
      console.log("No push subscriptions found for subscribers");
      return new Response(
        JSON.stringify({ message: "No push subscriptions found", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare notification payload
    const payload: PushPayload = {
      title: `${streamer.username} is now live!`,
      body: stream_title || "Come watch the stream!",
      url: stream_id ? `/watch/${stream_id}` : `/profile/${streamer_id}`,
    };

    // Send notifications
    let sentCount = 0;
    const failedEndpoints: string[] = [];

    for (const sub of pushSubscriptions) {
      const success = await sendPushNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
        vapidPublicKey,
        vapidPrivateKey
      );

      if (success) {
        sentCount++;
      } else {
        failedEndpoints.push(sub.endpoint);
      }
    }

    // Clean up failed subscriptions (they're likely expired)
    if (failedEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", failedEndpoints);
      
      console.log(`Cleaned up ${failedEndpoints.length} expired subscriptions`);
    }

    console.log(`Sent ${sentCount} notifications for streamer ${streamer.username}`);

    return new Response(
      JSON.stringify({ 
        message: "Notifications sent", 
        sent: sentCount,
        total_subscribers: pushSubscriptions.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-live-notifications:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playback_id, stream_id } = await req.json();

    if (!playback_id) {
      return new Response(
        JSON.stringify({ error: "playback_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const livepeerApiKey = Deno.env.get("LIVEPEER_API_KEY");
    if (!livepeerApiKey) {
      console.error("LIVEPEER_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Streaming service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Query Livepeer for stream status using playback ID
    console.log(`[check-stream-status] Checking status for playback_id: ${playback_id}`);
    
    const livepeerResponse = await fetch(
      `https://livepeer.studio/api/playback/${playback_id}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${livepeerApiKey}`,
        },
      }
    );

    if (!livepeerResponse.ok) {
      const errorText = await livepeerResponse.text();
      console.error(`[check-stream-status] Livepeer API error: ${livepeerResponse.status}`, errorText);
      
      // 404 means stream doesn't exist or isn't active yet
      if (livepeerResponse.status === 404) {
        return new Response(
          JSON.stringify({ 
            isActive: false, 
            phase: "waiting",
            message: "Stream not active yet"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to check stream status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const playbackInfo = await livepeerResponse.json();
    console.log(`[check-stream-status] Playback info:`, JSON.stringify(playbackInfo));

    // Determine if stream is active
    // Livepeer playback API uses meta.live (0/1) to indicate a currently broadcasting live stream.
    // NOTE: The "type" field can still be "live" even when the stream is NOT actively broadcasting,
    // so we must not rely on it alone.
    const liveFlag = playbackInfo?.meta?.live;
    const liveNumber = typeof liveFlag === "string" ? Number(liveFlag)
      : typeof liveFlag === "number" ? liveFlag
      : typeof liveFlag === "boolean" ? (liveFlag ? 1 : 0)
      : null;

    const isActive = liveNumber !== null ? liveNumber > 0 : false;
    const phase = isActive ? "live" : "waiting";

    // Prefer the HLS URL provided by Livepeer (if available)
    const hlsUrlFromMeta = Array.isArray(playbackInfo?.meta?.source)
      ? playbackInfo.meta.source.find((s: any) => typeof s?.url === "string" && s.url.includes("/hls/"))?.url
      : null;

    // If stream_id provided and status changed, update database
    // IMPORTANT: Do NOT update streams that have been manually ended (ended_at is set)
    if (stream_id && isActive) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

      // First check if the stream has been manually ended
      const { data: existingStream } = await serviceSupabase
        .from("streams")
        .select("ended_at, is_live")
        .eq("id", stream_id)
        .single();

      // Only update to live if stream hasn't been ended
      if (existingStream && !existingStream.ended_at && !existingStream.is_live) {
        const { error: updateError } = await serviceSupabase
          .from("streams")
          .update({ 
            is_live: true, 
            started_at: new Date().toISOString() 
          })
          .eq("id", stream_id)
          .is("ended_at", null); // Extra safety: only update if ended_at is null

        if (updateError) {
          console.error("[check-stream-status] Failed to update stream status:", updateError);
        } else {
          console.log(`[check-stream-status] Updated stream ${stream_id} to live`);
        }
      } else if (existingStream?.ended_at) {
        console.log(`[check-stream-status] Stream ${stream_id} was manually ended, not updating to live`);
      }
    }

    return new Response(
      JSON.stringify({
        isActive,
        phase,
        playbackUrl: isActive
          ? (hlsUrlFromMeta || `https://livepeercdn.studio/hls/${playback_id}/index.m3u8`)
          : null,
        meta: playbackInfo?.meta || null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[check-stream-status] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

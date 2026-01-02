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
    const { streamId } = await req.json();

    if (!streamId) {
      return new Response(
        JSON.stringify({ error: "Stream ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const livepeerApiKey = Deno.env.get("LIVEPEER_API_KEY");

    if (!livepeerApiKey) {
      console.error("LIVEPEER_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get stream from database
    const { data: stream, error: streamError } = await supabase
      .from("streams")
      .select("id, livepeer_stream_id, recording_url, recording_asset_id")
      .eq("id", streamId)
      .maybeSingle();

    if (streamError || !stream) {
      console.error("Stream not found:", streamError?.message);
      return new Response(
        JSON.stringify({ error: "Stream not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If we already have a recording URL, return it
    if (stream.recording_url) {
      console.log("Returning cached recording URL for stream:", streamId);
      return new Response(
        JSON.stringify({
          recording_url: stream.recording_url,
          asset_id: stream.recording_asset_id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!stream.livepeer_stream_id) {
      return new Response(
        JSON.stringify({ error: "No Livepeer stream ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch sessions (recordings) from Livepeer
    console.log("Fetching recordings for Livepeer stream:", stream.livepeer_stream_id);
    const sessionsResponse = await fetch(
      `https://livepeer.studio/api/stream/${stream.livepeer_stream_id}/sessions?record=1`,
      {
        headers: {
          Authorization: `Bearer ${livepeerApiKey}`,
        },
      }
    );

    if (!sessionsResponse.ok) {
      const errorText = await sessionsResponse.text();
      console.error("Livepeer sessions API error:", sessionsResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch recordings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessions = await sessionsResponse.json();
    console.log("Found sessions:", sessions.length);

    // Get the most recent completed session with a recording
    const completedSession = sessions.find((s: any) => 
      s.recordingStatus === "ready" && s.assetId
    );

    if (!completedSession) {
      console.log("No ready recordings found");
      return new Response(
        JSON.stringify({ error: "No recording available yet" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch asset details to get playback URL
    console.log("Fetching asset:", completedSession.assetId);
    const assetResponse = await fetch(
      `https://livepeer.studio/api/asset/${completedSession.assetId}`,
      {
        headers: {
          Authorization: `Bearer ${livepeerApiKey}`,
        },
      }
    );

    if (!assetResponse.ok) {
      const errorText = await assetResponse.text();
      console.error("Livepeer asset API error:", assetResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch recording asset" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const asset = await assetResponse.json();
    
    if (!asset.playbackId) {
      console.log("Asset has no playback ID yet");
      return new Response(
        JSON.stringify({ error: "Recording still processing" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recordingUrl = `https://livepeercdn.studio/hls/${asset.playbackId}/index.m3u8`;
    console.log("Recording URL:", recordingUrl);

    // Store the recording URL in database for caching
    const { error: updateError } = await supabase
      .from("streams")
      .update({
        recording_url: recordingUrl,
        recording_asset_id: asset.id,
      })
      .eq("id", streamId);

    if (updateError) {
      console.error("Error updating stream with recording URL:", updateError);
      // Don't fail the request, just log it
    }

    return new Response(
      JSON.stringify({
        recording_url: recordingUrl,
        asset_id: asset.id,
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
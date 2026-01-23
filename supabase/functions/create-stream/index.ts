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
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const livepeerApiKey = Deno.env.get("LIVEPEER_API_KEY");
    
    if (!livepeerApiKey) {
      console.error("LIVEPEER_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Streaming service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Client with user's auth context
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    // Service role client for database function calls
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating stream for user: ${user.id}`);

    // Parse request body
    const { title, description, game_category, game_id, tags, thumbnail_url } = await req.json();

    // Validate input
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (title.length > 200) {
      return new Response(
        JSON.stringify({ error: "Title cannot exceed 200 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (description && description.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Description cannot exceed 2000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create stream on Livepeer with recording enabled
    console.log("Creating Livepeer stream with recording enabled...");
    const livepeerResponse = await fetch("https://livepeer.studio/api/stream", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${livepeerApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: title.trim(),
        profiles: [
          { name: "720p", bitrate: 2000000, fps: 30, width: 1280, height: 720 },
          { name: "480p", bitrate: 1000000, fps: 30, width: 854, height: 480 },
          { name: "360p", bitrate: 500000, fps: 30, width: 640, height: 360 },
        ],
        record: true, // Enable recording for VOD
      }),
    });

    if (!livepeerResponse.ok) {
      const errorText = await livepeerResponse.text();
      console.error("Livepeer API error:", livepeerResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create stream with Livepeer" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const livepeerStream = await livepeerResponse.json();
    console.log("Livepeer stream created with recording:", livepeerStream.id, "record:", livepeerStream.record);

    // Construct the playback URL
    const playbackUrl = `https://livepeercdn.studio/hls/${livepeerStream.playbackId}/index.m3u8`;

    // Create stream in database (without stream_key - it's stored privately)
    const { data: stream, error: insertError } = await supabase
      .from("streams")
      .insert({
        streamer_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        game_category: game_category?.trim() || null,
        game_id: game_id || null,
        tags: Array.isArray(tags) ? tags.filter((t: string) => typeof t === 'string' && t.trim()) : [],
        thumbnail_url: thumbnail_url || null,
        playback_url: playbackUrl,
        playback_id: livepeerStream.playbackId,
        livepeer_stream_id: livepeerStream.id, // Store Livepeer stream ID for fetching recordings
        is_live: false,
        viewer_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create stream" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store stream key in private schema using database function
    const { error: secretError } = await serviceSupabase
      .rpc("store_stream_key", {
        p_stream_id: stream.id,
        p_stream_key: livepeerStream.streamKey,
      });

    if (secretError) {
      console.error("Error storing stream key:", secretError);
      // Clean up the stream if we can't store the key
      await supabase.from("streams").delete().eq("id", stream.id);
      return new Response(
        JSON.stringify({ error: "Failed to configure stream" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Stream created successfully: ${stream.id}`);

    // Return stream info including stream key (only returned once to the owner)
    return new Response(
      JSON.stringify({
        id: stream.id,
        title: stream.title,
        description: stream.description,
        game_category: stream.game_category,
        game_id: stream.game_id,
        tags: stream.tags,
        thumbnail_url: stream.thumbnail_url,
        stream_key: livepeerStream.streamKey,
        rtmp_url: "rtmp://rtmp.livepeer.studio/live",
        playback_url: playbackUrl,
        playback_id: livepeerStream.playbackId,
        livepeer_stream_id: livepeerStream.id,
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
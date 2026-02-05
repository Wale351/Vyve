import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Phase detection thresholds
const SIGNAL_RECENCY_THRESHOLD_MS = 20000; // 20 seconds
const HLS_PROBE_TIMEOUT_MS = 4000; // 4 seconds

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // We prefer Livepeer's /stream/{id} endpoint for activity checks (isActive).
    // It's significantly more reliable than the playback meta.live flag in real-world broadcasts.
    let livepeerStreamId: string | null = null;
    let endedAt: string | null = null;
    let dbIsLive: boolean | null = null;

    if (stream_id) {
      const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: s, error: streamFetchError } = await serviceSupabase
        .from("streams")
        .select("livepeer_stream_id, ended_at, is_live")
        .eq("id", stream_id)
        .maybeSingle();

      if (streamFetchError) {
        console.error("[check-stream-status] Failed to fetch stream row:", streamFetchError);
      } else {
        livepeerStreamId = (s?.livepeer_stream_id as string | null) ?? null;
        endedAt = (s?.ended_at as string | null) ?? null;
        dbIsLive = (s?.is_live as boolean | null) ?? null;
      }
    }

    console.log(
      `[check-stream-status] Checking status for playback_id=${playback_id}` +
        (stream_id ? ` stream_id=${stream_id}` : "") +
        (livepeerStreamId ? ` livepeer_stream_id=${livepeerStreamId}` : "")
    );

    const toBool = (v: unknown): boolean | null => {
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v > 0;
      if (typeof v === "string") {
        const s = v.trim().toLowerCase();
        if (s === "true" || s === "1") return true;
        if (s === "false" || s === "0") return false;
        const n = Number(s);
        if (!Number.isNaN(n)) return n > 0;
      }
      return null;
    };

    let isActive = false;
    let lastSeen: number | null = null;
    let hasRecentSignal = false;
    let meta: any = null;

    // 1) Primary: /stream/{id} activity check
    if (livepeerStreamId) {
      const streamRes = await fetch(`https://livepeer.studio/api/stream/${livepeerStreamId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${livepeerApiKey}`,
        },
      });

      if (streamRes.ok) {
        const streamInfo = await streamRes.json();
        
        // Parse lastSeen timestamp
        if (streamInfo?.lastSeen) {
          lastSeen = new Date(streamInfo.lastSeen).getTime();
          hasRecentSignal = (Date.now() - lastSeen) < SIGNAL_RECENCY_THRESHOLD_MS;
        }
        
        meta = {
          source: "stream",
          isActive: streamInfo?.isActive,
          lastSeen: lastSeen,
          lastSeenAgo: lastSeen ? Math.floor((Date.now() - lastSeen) / 1000) : null,
          hasRecentSignal,
          isHealthy: streamInfo?.isHealthy ?? null,
          issues: streamInfo?.issues ?? null,
        };

        const active = toBool(streamInfo?.isActive);
        isActive = active === true;
      } else {
        const errTxt = await streamRes.text().catch(() => "");
        console.error(`[check-stream-status] Livepeer /stream error: ${streamRes.status}`, errTxt);
      }
    }

    // 2) Fallback: playback endpoint meta.live (kept for older streams missing livepeer_stream_id)
    if (!isActive && !livepeerStreamId) {
      const pbRes = await fetch(`https://livepeer.studio/api/playback/${playback_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${livepeerApiKey}`,
        },
      });

      if (pbRes.ok) {
        const playbackInfo = await pbRes.json();
        const liveFlag = playbackInfo?.meta?.live;
        const active = toBool(liveFlag);
        isActive = active === true;
        meta = playbackInfo?.meta ?? null;
      } else if (pbRes.status !== 404) {
        const errTxt = await pbRes.text().catch(() => "");
        console.error(`[check-stream-status] Livepeer /playback error: ${pbRes.status}`, errTxt);
      }
    }

    // 3) HLS manifest probe - check if playback is actually ready
    const playbackUrl = `https://livepeercdn.studio/hls/${playback_id}/index.m3u8`;
    let hlsReady = false;
    
    // Only probe HLS if we have some signal (isActive or hasRecentSignal)
    if (isActive || hasRecentSignal) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), HLS_PROBE_TIMEOUT_MS);
        
        const hlsRes = await fetch(playbackUrl, {
          method: "GET",
          signal: controller.signal,
          headers: { "Accept": "application/vnd.apple.mpegurl" },
        });
        
        clearTimeout(timeoutId);
        
        if (hlsRes.ok) {
          const manifestText = await hlsRes.text();
          // Check for valid HLS manifest (contains #EXTM3U) and no error markers
          if (manifestText.includes("#EXTM3U") && !manifestText.includes("#EXT-X-ERROR")) {
            hlsReady = true;
          }
        }
      } catch (err) {
        // HLS probe failed (timeout, network error, etc.) - not fatal
        console.log("[check-stream-status] HLS probe failed:", err);
      }
    }

    // Never report active if the stream was manually ended.
    if (endedAt) {
      isActive = false;
      hasRecentSignal = false;
      hlsReady = false;
    }

    // Determine stream phase:
    // - "waiting": no signal at all
    // - "ingesting": signal detected (via isActive or lastSeen) but HLS not ready
    // - "live": HLS manifest is ready for playback
    // - "ended": stream has been manually ended
    let phase: "waiting" | "ingesting" | "live" | "ended";
    if (endedAt) {
      phase = "ended";
    } else if (hlsReady) {
      phase = "live";
    } else if (isActive || hasRecentSignal) {
      phase = "ingesting";
    } else {
      phase = "waiting";
    }

    console.log(`[check-stream-status] Result: phase=${phase}, isActive=${isActive}, hasRecentSignal=${hasRecentSignal}, hlsReady=${hlsReady}`);

    // If stream_id provided and status changed, update database
    // IMPORTANT: Do NOT update streams that have been manually ended (ended_at is set)
    if (stream_id && hlsReady && !endedAt && dbIsLive !== true) {
      const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);
      const { error: updateError } = await serviceSupabase
        .from("streams")
        .update({
          is_live: true,
          started_at: new Date().toISOString(),
        })
        .eq("id", stream_id)
        .is("ended_at", null);

      if (updateError) {
        console.error("[check-stream-status] Failed to update stream status:", updateError);
      } else {
        console.log(`[check-stream-status] Updated stream ${stream_id} to live`);
      }
    }

    return new Response(
      JSON.stringify({
        isActive: hlsReady, // For backward compatibility, isActive now means "ready for playback"
        phase,
        playbackUrl: hlsReady ? playbackUrl : null,
        meta: {
          ...meta,
          hlsReady,
          ingestActive: isActive || hasRecentSignal,
        },
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

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type StreamPhase = 'idle' | 'waiting' | 'ingesting' | 'live' | 'ended';

interface LivepeerStatus {
  isActive: boolean;
  phase: StreamPhase;
  playbackUrl: string | null;
  ingestActive: boolean;
  hlsReady: boolean;
  lastSeenAgo: number | null;
}

interface UseLivepeerStatusOptions {
  playbackId: string | undefined;
  streamId: string | undefined;
  isLive: boolean | undefined;
  endedAt: string | null | undefined;
  pollInterval?: number;
}

export const useLivepeerStatus = ({
  playbackId,
  streamId,
  isLive,
  endedAt,
  pollInterval = 5000,
}: UseLivepeerStatusOptions) => {
  const [status, setStatus] = useState<LivepeerStatus>({
    isActive: false,
    phase: 'idle',
    playbackUrl: null,
    ingestActive: false,
    hlsReady: false,
    lastSeenAgo: null,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Determine initial phase based on database state
  const getInitialPhase = useCallback((): StreamPhase => {
    if (endedAt) return 'ended';
    if (isLive) return 'live';
    if (playbackId) return 'waiting';
    return 'idle';
  }, [endedAt, isLive, playbackId]);

  const checkStatus = useCallback(async () => {
    if (!playbackId || !mountedRef.current) return;

    setIsChecking(true);
    setError(null);

    try {
      console.log('[useLivepeerStatus] Checking stream status for:', playbackId);
      
      const { data, error: fnError } = await supabase.functions.invoke('check-stream-status', {
        body: { playback_id: playbackId, stream_id: streamId },
      });

      if (!mountedRef.current) return;

      if (fnError) {
        console.error('[useLivepeerStatus] Error:', fnError);
        setError('Failed to check stream status');
        return;
      }

      console.log('[useLivepeerStatus] Status response:', data);

      const ingestActive = data.meta?.ingestActive ?? false;
      const hlsReady = data.meta?.hlsReady ?? false;
      const lastSeenAgo = data.meta?.lastSeenAgo ?? null;
      const phase = data.phase as StreamPhase;

      // Update status with new phase information
      if (phase === 'live') {
        setStatus({
          isActive: true,
          phase: 'live',
          playbackUrl: data.playbackUrl || `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`,
          ingestActive: true,
          hlsReady: true,
          lastSeenAgo,
        });
        // Stop polling once live and HLS is ready
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } else if (phase === 'ingesting') {
        // Signal detected but HLS not ready - keep polling
        setStatus({
          isActive: false,
          phase: 'ingesting',
          playbackUrl: null,
          ingestActive: true,
          hlsReady: false,
          lastSeenAgo,
        });
      } else if (phase === 'ended') {
        setStatus({
          isActive: false,
          phase: 'ended',
          playbackUrl: null,
          ingestActive: false,
          hlsReady: false,
          lastSeenAgo: null,
        });
        // Stop polling on ended
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } else {
        // Waiting state
        setStatus({
          isActive: false,
          phase: 'waiting',
          playbackUrl: null,
          ingestActive: false,
          hlsReady: false,
          lastSeenAgo: null,
        });
      }
    } catch (err) {
      console.error('[useLivepeerStatus] Unexpected error:', err);
      if (mountedRef.current) {
        setError('Failed to check stream status');
      }
    } finally {
      if (mountedRef.current) {
        setIsChecking(false);
      }
    }
  }, [playbackId, streamId]);

  // Start polling when we have a playback ID and stream isn't ended
  useEffect(() => {
    mountedRef.current = true;
    
    // Set initial phase
    const initialPhase = getInitialPhase();
    setStatus(prev => ({ ...prev, phase: initialPhase }));

    // If ended or no playback ID, don't poll - stream is definitively over
    if (endedAt || !playbackId) {
      // Ensure we show ended state correctly
      if (endedAt) {
        setStatus({
          isActive: false,
          phase: 'ended',
          playbackUrl: null,
          ingestActive: false,
          hlsReady: false,
          lastSeenAgo: null,
        });
      }
      return;
    }

    // Always verify with Livepeer API, even if database says is_live
    // This ensures we only show "live" when Livepeer actually has active stream
    checkStatus();

    // Start polling until we confirm stream is live
    pollRef.current = setInterval(checkStatus, pollInterval);

    return () => {
      mountedRef.current = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [playbackId, endedAt, pollInterval, checkStatus, getInitialPhase]);

  const retry = useCallback(() => {
    console.log('[useLivepeerStatus] Manual retry triggered');
    setError(null);
    setStatus(prev => ({ ...prev, isActive: false, phase: 'waiting' })); // Reset to waiting
    
    // Re-check status immediately
    checkStatus();
    
    // Also restart polling if it was stopped
    if (!pollRef.current && playbackId && !endedAt) {
      pollRef.current = setInterval(checkStatus, pollInterval);
    }
  }, [checkStatus, playbackId, endedAt, pollInterval]);

  return {
    ...status,
    isChecking,
    error,
    retry,
  };
};

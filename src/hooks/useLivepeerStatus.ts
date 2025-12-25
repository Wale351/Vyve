import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type StreamPhase = 'idle' | 'waiting' | 'live' | 'ended';

interface LivepeerStatus {
  isActive: boolean;
  phase: StreamPhase;
  playbackUrl: string | null;
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

      if (data.isActive) {
        setStatus({
          isActive: true,
          phase: 'live',
          playbackUrl: data.playbackUrl || `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`,
        });
        // Stop polling once live
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } else {
        setStatus(prev => ({
          ...prev,
          isActive: false,
          phase: endedAt ? 'ended' : 'waiting',
        }));
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
  }, [playbackId, streamId, endedAt]);

  // Start polling when we have a playback ID and stream isn't ended
  useEffect(() => {
    mountedRef.current = true;
    
    // Set initial phase
    const initialPhase = getInitialPhase();
    setStatus(prev => ({ ...prev, phase: initialPhase }));

    // If already live or ended, no need to poll
    if (isLive || endedAt || !playbackId) {
      if (isLive && playbackId) {
        setStatus({
          isActive: true,
          phase: 'live',
          playbackUrl: `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`,
        });
      }
      return;
    }

    // Initial check
    checkStatus();

    // Start polling
    pollRef.current = setInterval(checkStatus, pollInterval);

    return () => {
      mountedRef.current = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [playbackId, isLive, endedAt, pollInterval, checkStatus, getInitialPhase]);

  const retry = useCallback(() => {
    setError(null);
    checkStatus();
  }, [checkStatus]);

  return {
    ...status,
    isChecking,
    error,
    retry,
  };
};

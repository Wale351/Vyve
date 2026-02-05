import { useState, useEffect, useRef, forwardRef, useCallback } from 'react';
import { Monitor, Loader2, AlertCircle, RefreshCw, Check, X, Radio, Wifi, WifiOff, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Hls from 'hls.js';
import { supabase } from '@/integrations/supabase/client';

interface TestStreamPreviewProps {
  playbackUrl: string;
  playbackId?: string;
  streamId: string;
  onConfirmLive: () => void;
  onCancel: () => void;
  isGoingLive: boolean;
}

type StreamStatus = 'connecting' | 'waiting' | 'ingesting' | 'live' | 'error' | 'reconnecting';

interface StreamDebugInfo {
  lastSeenAgo: number | null;
  hlsReady: boolean;
  ingestActive: boolean;
}

const TestStreamPreview = forwardRef<HTMLDivElement, TestStreamPreviewProps>(({
  playbackUrl,
  playbackId,
  streamId,
  onConfirmLive,
  onCancel,
  isGoingLive
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<StreamStatus>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [lastSignalTime, setLastSignalTime] = useState<number | null>(null);
  const [isLivepeerActive, setIsLivepeerActive] = useState(false);
  const [debugInfo, setDebugInfo] = useState<StreamDebugInfo>({
    lastSeenAgo: null,
    hlsReady: false,
    ingestActive: false,
  });

  // Extract playbackId from URL if not provided directly
  const effectivePlaybackId = playbackId || playbackUrl.match(/\/hls\/([^/]+)\//)?.[1];

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (statusPollRef.current) {
      clearInterval(statusPollRef.current);
      statusPollRef.current = null;
    }
  }, []);

  // Poll Livepeer status via edge function
  const checkLivepeerStatus = useCallback(async () => {
    if (!effectivePlaybackId) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-stream-status', {
        body: { playback_id: effectivePlaybackId, stream_id: streamId },
      });

      if (error) {
        console.log('[TestStreamPreview] Status check error:', error);
        return;
      }

      console.log('[TestStreamPreview] Livepeer status:', data);

      // Update debug info
      setDebugInfo({
        lastSeenAgo: data.meta?.lastSeenAgo ?? null,
        hlsReady: data.meta?.hlsReady ?? false,
        ingestActive: data.meta?.ingestActive ?? false,
      });

      // Handle different phases
      if (data.phase === 'live' && data.isActive) {
        setIsLivepeerActive(true);
        setStatus('live');
        // Stop polling once live
        if (statusPollRef.current) {
          clearInterval(statusPollRef.current);
          statusPollRef.current = null;
        }
      } else if (data.phase === 'ingesting' || data.meta?.ingestActive) {
        // Signal detected but HLS not ready yet
        setStatus('ingesting');
        // Keep polling until live
      } else {
        // No signal yet
        if (status !== 'live' && status !== 'ingesting') {
          setStatus('waiting');
        }
      }
    } catch (err) {
      console.log('[TestStreamPreview] Status check failed:', err);
    }
  }, [effectivePlaybackId, streamId, status]);

  const initializePlayback = () => {
    const video = videoRef.current;
    if (!video || !playbackUrl) return;

    destroyHls();
    setStatus('connecting');
    setErrorMessage('');

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 5,
        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 5,
        levelLoadingTimeOut: 15000,
        fragLoadingTimeOut: 20000,
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[TestStreamPreview] Manifest parsed, attempting playback');
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setStatus('live');
        setLastSignalTime(Date.now());
        setRetryCount(0);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.log('[TestStreamPreview] HLS error:', data.type, data.details, 'fatal:', data.fatal);
        
        if (data.fatal) {
          if (retryCount < 10) {
            // Show reconnecting state for subsequent retries, but keep ingesting if we have signal
            if (debugInfo.ingestActive) {
              setStatus('ingesting');
            } else {
              setStatus(retryCount > 0 ? 'reconnecting' : 'waiting');
            }
            retryTimeoutRef.current = setTimeout(() => {
              setRetryCount(prev => prev + 1);
              initializePlayback();
            }, 3000);
          } else {
            setStatus('error');
            setErrorMessage('Could not connect to your stream. Make sure OBS is streaming to the RTMP URL.');
          }
        }
      });

      hls.loadSource(playbackUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playbackUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
        setStatus('live');
      });
      video.addEventListener('error', () => {
        setStatus('error');
        setErrorMessage('Failed to load stream');
      });
    }
  };

  // Monitor for OBS disconnect (no new fragments for 15+ seconds)
  useEffect(() => {
    if (status !== 'live') return;
    
    const checkInterval = setInterval(() => {
      if (lastSignalTime && Date.now() - lastSignalTime > 15000) {
        console.log('[TestStreamPreview] No signal for 15s, showing reconnecting state');
        setStatus('reconnecting');
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [status, lastSignalTime]);

  // Start Livepeer status polling
  useEffect(() => {
    if (!effectivePlaybackId) return;

    // Initial check
    checkLivepeerStatus();

    // Poll every 3 seconds for faster detection
    statusPollRef.current = setInterval(checkLivepeerStatus, 3000);

    return () => {
      if (statusPollRef.current) {
        clearInterval(statusPollRef.current);
        statusPollRef.current = null;
      }
    };
  }, [effectivePlaybackId, checkLivepeerStatus]);

  // Initialize HLS playback when Livepeer confirms stream is active
  useEffect(() => {
    if (isLivepeerActive) {
      console.log('[TestStreamPreview] Livepeer confirmed active, initializing HLS');
      initializePlayback();
    }
  }, [isLivepeerActive]);

  // Also try HLS directly on mount (for cases where Livepeer status is delayed)
  useEffect(() => {
    initializePlayback();

    return () => {
      destroyHls();
    };
  }, [playbackUrl]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setIsLivepeerActive(false);
    checkLivepeerStatus();
    initializePlayback();
  }, [checkLivepeerStatus]);

  const StatusBadge = () => {
    const statusConfig = {
      connecting: { color: 'bg-muted text-muted-foreground border-border', icon: Loader2, label: 'Connecting...', animate: true },
      waiting: { color: 'bg-warning/20 text-warning border-warning/30', icon: Wifi, label: 'Waiting for OBS', animate: false },
      ingesting: { color: 'bg-primary/20 text-primary border-primary/30', icon: Zap, label: 'Signal Detected', animate: false },
      live: { color: 'bg-success/20 text-success border-success/30', icon: Radio, label: 'Preview Active', animate: false },
      reconnecting: { color: 'bg-warning/20 text-warning border-warning/30', icon: WifiOff, label: 'Reconnecting...', animate: true },
      error: { color: 'bg-destructive/20 text-destructive border-destructive/30', icon: AlertCircle, label: 'Error', animate: false },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium', config.color)}>
        <Icon className={cn('h-3 w-3', config.animate && 'animate-spin')} />
        {config.label}
      </div>
    );
  };

  return (
    <div className="space-y-4" ref={ref}>
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold">Stream Preview</h3>
        </div>
        <StatusBadge />
      </div>

      {/* Video Preview */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/90 border border-border/30">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          muted
          autoPlay
        />
        
        {(status === 'connecting' || status === 'waiting') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="relative mb-4">
              <Radio className="h-12 w-12 text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Waiting for OBS signal...</p>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Start streaming in OBS to see your preview here. The stream will appear automatically.
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Attempt {retryCount + 1} of 10
              </p>
            )}
          </div>
        )}

        {status === 'ingesting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="relative mb-4">
              <Zap className="h-12 w-12 text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Signal detected! Starting playback...</p>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              OBS is connected. Waiting for video stream to be ready (~10-30 seconds).
            </p>
            <Loader2 className="h-4 w-4 animate-spin text-primary mt-3" />
          </div>
        )}

        {status === 'reconnecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <Loader2 className="h-10 w-10 animate-spin text-warning mb-3" />
            <p className="text-sm text-warning mb-1">Connection interrupted</p>
            <p className="text-xs text-muted-foreground">Attempting to reconnect...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-sm text-foreground mb-1">Connection Failed</p>
            <p className="text-xs text-muted-foreground mb-4 text-center max-w-xs">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Dev-only debug info */}
      {import.meta.env.DEV && (
        <div className="text-[10px] text-muted-foreground font-mono p-2 rounded bg-muted/30 border border-border/20">
          Signal: {debugInfo.ingestActive ? '✓ detected' : '✗ none'} | 
          Last seen: {debugInfo.lastSeenAgo !== null ? `${debugInfo.lastSeenAgo}s ago` : 'n/a'} | 
          HLS: {debugInfo.hlsReady ? '✓ ready' : '✗ not ready'}
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Testing your stream:</span> Only you can see this preview. 
          When you're happy with how it looks, click "Go Live" to make your stream visible to viewers.
        </p>
      </div>

      {/* Latency Notice */}
      {status === 'live' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Radio className="h-4 w-4 text-primary" />
          <p className="text-xs text-primary">
            <strong>Note:</strong> There's a ~15-20 second delay between OBS and this preview. This is normal for live streaming.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="subtle"
          className="flex-1 gap-2"
          onClick={onCancel}
          disabled={isGoingLive}
        >
          <X className="h-4 w-4" />
          Back
        </Button>
        <Button
          variant="premium"
          className="flex-1 gap-2"
          onClick={onConfirmLive}
          disabled={(status !== 'live' && status !== 'ingesting') || isGoingLive}
        >
          {isGoingLive ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {isGoingLive ? 'Going Live...' : 'Go Live'}
        </Button>
      </div>
    </div>
  );
});

TestStreamPreview.displayName = 'TestStreamPreview';

export default TestStreamPreview;
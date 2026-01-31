import { useState, useEffect, useRef, forwardRef } from 'react';
import { Monitor, Loader2, AlertCircle, RefreshCw, Check, X, Radio, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Hls from 'hls.js';

interface TestStreamPreviewProps {
  playbackUrl: string;
  streamId: string;
  onConfirmLive: () => void;
  onCancel: () => void;
  isGoingLive: boolean;
}

type StreamStatus = 'connecting' | 'waiting' | 'live' | 'error' | 'reconnecting';

const TestStreamPreview = forwardRef<HTMLDivElement, TestStreamPreviewProps>(({
  playbackUrl,
  streamId,
  onConfirmLive,
  onCancel,
  isGoingLive
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<StreamStatus>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [lastSignalTime, setLastSignalTime] = useState<number | null>(null);

  const destroyHls = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

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
            // Show reconnecting state for subsequent retries
            setStatus(retryCount > 0 ? 'reconnecting' : 'waiting');
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

  useEffect(() => {
    initializePlayback();

    return () => {
      destroyHls();
    };
  }, [playbackUrl]);

  const handleRetry = () => {
    setRetryCount(0);
    initializePlayback();
  };

  const StatusBadge = () => {
    const statusConfig = {
      connecting: { color: 'bg-muted text-muted-foreground', icon: Loader2, label: 'Connecting...', animate: true },
      waiting: { color: 'bg-warning/20 text-warning border-warning/30', icon: Wifi, label: 'Waiting for OBS', animate: false },
      live: { color: 'bg-success/20 text-success border-success/30', icon: Radio, label: 'Preview Active', animate: true },
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
          disabled={status !== 'live' || isGoingLive}
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
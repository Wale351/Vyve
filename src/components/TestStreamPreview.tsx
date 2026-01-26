import { useState, useEffect, useRef } from 'react';
import { Monitor, Loader2, AlertCircle, RefreshCw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Hls from 'hls.js';

interface TestStreamPreviewProps {
  playbackUrl: string;
  streamId: string;
  onConfirmLive: () => void;
  onCancel: () => void;
  isGoingLive: boolean;
}

export default function TestStreamPreview({
  playbackUrl,
  streamId,
  onConfirmLive,
  onCancel,
  isGoingLive
}: TestStreamPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<'connecting' | 'live' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const initializePlayback = () => {
    const video = videoRef.current;
    if (!video || !playbackUrl) return;

    setStatus('connecting');
    setErrorMessage('');

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

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
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setStatus('live');
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (retryCount < 5) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              initializePlayback();
            }, 3000);
          } else {
            setStatus('error');
            setErrorMessage('Could not connect to your stream. Make sure OBS is streaming.');
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

  useEffect(() => {
    initializePlayback();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playbackUrl]);

  const handleRetry = () => {
    setRetryCount(0);
    initializePlayback();
  };

  return (
    <div className="space-y-4">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold">Stream Preview</h3>
        </div>
        <Badge 
          variant={status === 'live' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}
          className="gap-1.5"
        >
          {status === 'connecting' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Connecting...
            </>
          )}
          {status === 'live' && (
            <>
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              Preview Active
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="h-3 w-3" />
              Error
            </>
          )}
        </Badge>
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
        
        {status === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Waiting for stream signal...</p>
            <p className="text-xs text-muted-foreground mt-1">Make sure OBS is streaming to the RTMP URL</p>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-sm text-muted-foreground mb-3">{errorMessage}</p>
            <Button variant="subtle" size="sm" onClick={handleRetry} className="gap-2">
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

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="subtle"
          className="flex-1 gap-2"
          onClick={onCancel}
          disabled={isGoingLive}
        >
          <X className="h-4 w-4" />
          Cancel
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
}

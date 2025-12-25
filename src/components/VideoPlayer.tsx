import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, RefreshCw, Radio, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import Hls from 'hls.js';
import { StreamPhase } from '@/hooks/useLivepeerStatus';

interface VideoPlayerProps {
  playbackUrl?: string;
  playbackId?: string;
  title: string;
  isLive?: boolean;
  thumbnailUrl?: string;
  streamPhase?: StreamPhase;
  onRetry?: () => void;
}

const VideoPlayer = ({ 
  playbackUrl, 
  playbackId, 
  title, 
  isLive = false, 
  thumbnailUrl,
  streamPhase = 'idle',
  onRetry,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Construct the playback URL from playbackId if not provided
  const effectivePlaybackUrl = playbackUrl || (playbackId ? `https://livepeercdn.studio/hls/${playbackId}/index.m3u8` : undefined);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const initializePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || !effectivePlaybackUrl) {
      setIsLoading(false);
      return;
    }

    destroyHls();
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    console.log('[VideoPlayer] Initializing playback:', effectivePlaybackUrl);

    // Check if the browser supports HLS natively (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = effectivePlaybackUrl;
      
      const handleLoadedMetadata = () => {
        console.log('[VideoPlayer] Native HLS: Loaded metadata');
        setIsLoading(false);
        setRetryCount(0);
        video.play().then(() => setIsPlaying(true)).catch((e) => {
          console.log('[VideoPlayer] Autoplay prevented:', e.message);
        });
      };
      
      const handleError = () => {
        console.error('[VideoPlayer] Native HLS error');
        handlePlaybackError('Stream unavailable');
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      video.addEventListener('error', handleError, { once: true });
      
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 3,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 3,
      });
      
      hlsRef.current = hls;
      hls.loadSource(effectivePlaybackUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[VideoPlayer] HLS.js: Manifest parsed successfully');
        setIsLoading(false);
        setRetryCount(0);
        video.play().then(() => setIsPlaying(true)).catch((e) => {
          console.log('[VideoPlayer] Autoplay prevented:', e.message);
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('[VideoPlayer] HLS.js error:', {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          response: data.response,
        });
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (data.response?.code === 404 || data.details === 'manifestLoadError') {
                handlePlaybackError('Stream not available');
              } else {
                handlePlaybackError('Network error - retrying...');
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('[VideoPlayer] Attempting to recover from media error');
              hls.recoverMediaError();
              break;
            default:
              handlePlaybackError('Playback error occurred');
              break;
          }
        }
      });
    } else {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('HLS playback not supported in this browser');
    }
  }, [effectivePlaybackUrl, destroyHls]);

  const handlePlaybackError = useCallback((message: string) => {
    console.log('[VideoPlayer] Playback error:', message, 'Retry count:', retryCount);
    setIsLoading(false);
    setErrorMessage(message);
    
    // Auto-retry for live streams
    if (isLive && retryCount < 10) {
      const delay = Math.min(3000 + retryCount * 1000, 8000);
      console.log(`[VideoPlayer] Retrying in ${delay}ms...`);
      
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        initializePlayback();
      }, delay);
    } else {
      setHasError(true);
    }
  }, [isLive, retryCount, initializePlayback]);

  // Only initialize playback when stream is actually live
  useEffect(() => {
    if (streamPhase === 'live' && effectivePlaybackUrl) {
      initializePlayback();
    }
    return destroyHls;
  }, [streamPhase, effectivePlaybackUrl, initializePlayback, destroyHls]);

  // Sync volume with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume[0] / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (v: number[]) => {
    setVolume(v);
    if (v[0] > 0) setIsMuted(false);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.parentElement?.requestFullscreen();
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setHasError(false);
    if (onRetry) {
      onRetry();
    } else {
      initializePlayback();
    }
  };

  // IDLE state - no stream configured
  if (streamPhase === 'idle' || !effectivePlaybackUrl) {
    return (
      <div className="relative aspect-video bg-background rounded-xl overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-background" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50 flex items-center justify-center mb-4 mx-auto">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              Stream not configured
            </p>
          </div>
        </div>
      </div>
    );
  }

  // WAITING state - stream created but not broadcasting yet
  if (streamPhase === 'waiting') {
    return (
      <div className="relative aspect-video bg-background rounded-xl overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover opacity-30" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 max-w-sm">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 mx-auto relative">
              <Radio className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">
              Waiting for streamer...
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              The stream will start automatically when the streamer begins broadcasting
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Checking every 5 seconds
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ENDED state
  if (streamPhase === 'ended') {
    return (
      <div className="relative aspect-video bg-background rounded-xl overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover opacity-30" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-background" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50 flex items-center justify-center mb-4 mx-auto">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">
              Stream Ended
            </h3>
            <p className="text-sm text-muted-foreground">
              This stream has finished
            </p>
          </div>
        </div>
      </div>
    );
  }

  // LIVE state - actual video playback
  return (
    <div 
      className="relative aspect-video bg-background rounded-xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        playsInline
        muted={isMuted}
        poster={thumbnailUrl}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center px-4">
            <p className="text-muted-foreground mb-2">Unable to load stream</p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              {errorMessage || 'The stream may be offline or unavailable'}
            </p>
            <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Live indicator */}
      {isLive && !hasError && !isLoading && (
        <div className="absolute top-4 left-4 live-badge flex items-center gap-1.5">
          <span className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse" />
          LIVE
        </div>
      )}

      {/* Controls overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/20 transition-opacity duration-300",
          showControls && !isLoading && !hasError ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Center play button */}
        <button 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center transition-transform hover:scale-110">
            {isPlaying ? (
              <Pause className="h-8 w-8 text-primary" />
            ) : (
              <Play className="h-8 w-8 text-primary ml-1" />
            )}
          </div>
        </button>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <div className="flex items-center gap-2 group/volume">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={toggleMute}
                >
                  {isMuted || volume[0] === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                  <Slider 
                    value={isMuted ? [0] : volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-24"
                  />
                </div>
              </div>

              {isLive && (
                <span className="text-xs font-medium text-destructive ml-2">
                  ● LIVE
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

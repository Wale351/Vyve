import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  playbackId?: string;
  title: string;
  isLive?: boolean;
  thumbnailUrl?: string;
}

const VideoPlayer = ({ playbackId, title, isLive = false, thumbnailUrl }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [showControls, setShowControls] = useState(false);

  // For demo, we'll show a thumbnail with simulated controls
  // In production, this would use Livepeer's Player primitives
  
  return (
    <div 
      className="relative aspect-video bg-background rounded-xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video/Thumbnail */}
      {thumbnailUrl ? (
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
          <p className="text-muted-foreground">Stream starting soon...</p>
        </div>
      )}

      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-4 left-4 live-badge flex items-center gap-1.5">
          <span className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse" />
          LIVE
        </div>
      )}

      {/* Controls overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/20 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Center play button */}
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
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
          {/* Progress bar (for VOD, not shown for live) */}
          {!isLive && (
            <div className="mb-3">
              <Slider 
                defaultValue={[0]} 
                max={100} 
                step={1}
                className="w-full"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
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
                  onClick={() => setIsMuted(!isMuted)}
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
                    onValueChange={(v) => {
                      setVolume(v);
                      if (v[0] > 0) setIsMuted(false);
                    }}
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
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
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

import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer';
import LiveChat from '@/components/LiveChat';
import TipButton from '@/components/TipButton';
import { Button } from '@/components/ui/button';
import { useStream } from '@/hooks/useStreams';
import { formatViewerCount, formatDuration } from '@/lib/mockData';
import { Users, Clock, Share2, Heart, ExternalLink, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const Watch = () => {
  const { streamId } = useParams();
  const { data: stream, isLoading } = useStream(streamId);
  const [isLiked, setIsLiked] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <div className="glass-card p-12 max-w-md mx-auto">
            <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-display font-bold mb-2">Stream Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This stream may have ended or doesn't exist.
            </p>
            <Link to="/">
              <Button variant="premium">
                Browse Streams
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const streamerName = stream.profiles?.username || 'Anonymous';
  const streamerId = stream.profiles?.id || '';

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Main content */}
          <div className="space-y-5">
            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <VideoPlayer
                playbackUrl={stream.playback_url || undefined}
                title={stream.title}
                isLive={stream.is_live || false}
              />
            </div>

            {/* Stream Info Card */}
            <div className="glass-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {stream.is_live && (
                      <div className="live-badge flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse-subtle" />
                        LIVE
                      </div>
                    )}
                    <h1 className="font-display text-xl font-bold">{stream.title}</h1>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Streamer info */}
                    <Link 
                      to={`/profile/${streamerId}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
                        {streamerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-display font-semibold group-hover:text-primary transition-colors">
                          {streamerName}
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatViewerCount(stream.viewer_count || 0)} watching</span>
                    </div>
                    
                    {stream.started_at && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDuration(new Date(stream.started_at))}</span>
                      </div>
                    )}
                    
                    {stream.game_category && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-sm text-primary font-medium">
                        {stream.game_category}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <TipButton 
                    streamerId={streamerId}
                    streamerName={streamerName}
                  />
                  
                  <Button 
                    variant="subtle" 
                    size="icon" 
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant={isLiked ? "default" : "subtle"}
                    size="icon"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  </Button>
                  
                  <Link to={`/profile/${streamerId}`}>
                    <Button variant="subtle" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Chat */}
          <div className="h-[calc(100vh-120px)] min-h-[500px]">
            <LiveChat streamId={stream.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;

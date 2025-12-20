import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer';
import LiveChat from '@/components/LiveChat';
import TipButton from '@/components/TipButton';
import { Button } from '@/components/ui/button';
import { mockStreams, mockChatMessages, formatViewerCount, formatDuration, formatAddress } from '@/lib/mockData';
import { Users, Clock, Share2, Heart, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const Watch = () => {
  const { streamId } = useParams();
  const stream = mockStreams.find(s => s.id === streamId);

  if (!stream) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Stream Not Found</h1>
          <p className="text-muted-foreground mb-6">This stream doesn't exist or has ended.</p>
          <Link to="/">
            <Button variant="glow">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Main content */}
          <div className="space-y-4">
            {/* Video Player */}
            <VideoPlayer 
              playbackId={stream.playbackId}
              title={stream.title}
              isLive={stream.isLive}
              thumbnailUrl={stream.thumbnailUrl}
            />

            {/* Stream Info */}
            <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold">
                    {stream.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <Link 
                      to={`/profile/${stream.streamerAddress}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                        {stream.streamerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {stream.streamerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatAddress(stream.streamerAddress)}
                        </p>
                      </div>
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-primary" />
                      {formatViewerCount(stream.viewerCount)} watching
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {formatDuration(stream.startedAt)}
                    </div>
                    <div className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-primary text-xs">
                      {stream.game}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <TipButton 
                    streamerAddress={stream.streamerAddress}
                    streamerName={stream.streamerName}
                  />
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Link to={`/profile/${stream.streamerAddress}`}>
                    <Button variant="glass" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="h-[calc(100vh-180px)] sticky top-24">
            <LiveChat 
              streamId={stream.id}
              initialMessages={mockChatMessages}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer';
import LiveChat from '@/components/LiveChat';
import TipButton from '@/components/TipButton';
import FollowButton from '@/components/FollowButton';
import ClipButton from '@/components/ClipButton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useStream } from '@/hooks/useStreams';
import { useEndStream } from '@/hooks/useStreamControls';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useViewerPresence, useStreamRealtime } from '@/hooks/useViewerPresence';
import { useLivepeerStatus, StreamPhase } from '@/hooks/useLivepeerStatus';
import { formatViewerCount, formatDuration } from '@/lib/formatters';
import { Users, Clock, Share2, Heart, ExternalLink, Loader2, Play, StopCircle, MessageCircle, ChevronUp, Radio } from 'lucide-react';
import { toast } from 'sonner';

const Watch = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const { data: stream, isLoading } = useStream(streamId);
  const { user } = useWalletAuth();
  const endStreamMutation = useEndStream();
  const [isLiked, setIsLiked] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  
  // Real-time viewer presence tracking
  const { viewerCount: liveViewerCount, isConnected } = useViewerPresence(streamId);
  const realtimeStream = useStreamRealtime(streamId);
  
  // Livepeer status polling - polls every 5s until stream is live
  const livepeerStatus = useLivepeerStatus({
    playbackId: stream?.playback_id || undefined,
    streamId: stream?.id,
    isLive: stream?.is_live || false,
    endedAt: stream?.ended_at,
    pollInterval: 5000,
  });
  
  // Use real-time viewer count if available, otherwise fall back to database value
  const displayViewerCount = liveViewerCount > 0 ? liveViewerCount : (realtimeStream?.viewer_count ?? stream?.viewer_count ?? 0);
  
  const isStreamOwner = user?.id && stream?.streamer_id === user.id;
  const canEndStream = Boolean(
    isStreamOwner && stream && !stream.ended_at && (stream.is_live || livepeerStatus.isActive)
  );

  // Determine the effective stream phase
  const getStreamPhase = (): StreamPhase => {
    if (!stream) return 'idle';
    if (stream.ended_at) return 'ended';
    if (livepeerStatus.isActive) return 'live';
    if (stream.is_live && !livepeerStatus.isActive) return 'waiting'; // DB says live but Livepeer not ready
    if (stream.playback_id) return 'waiting';
    return 'idle';
  };
  
  const streamPhase = getStreamPhase();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
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
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12 md:py-16 text-center">
          <div className="glass-card p-8 md:p-12 max-w-md mx-auto">
            <Play className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-muted-foreground" />
            <h1 className="text-xl md:text-2xl font-display font-bold mb-2">Stream Not Found</h1>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
              This stream may have ended or doesn't exist.
            </p>
            <Link to="/">
              <Button variant="premium">Browse Streams</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const streamerName = stream.profiles?.username || 'Streamer';
  const streamerUsername = stream.profiles?.username;
  const streamerId = stream.profiles?.id || '';

  // Stream phase indicator component
  const StreamPhaseIndicator = () => {
    switch (streamPhase) {
      case 'live':
        return (
          <div className="live-badge flex items-center gap-1 text-[10px] px-2 py-0.5">
            <span className="w-1 h-1 rounded-full bg-destructive-foreground animate-pulse-subtle" />
            LIVE
          </div>
        );
      case 'waiting':
        return (
          <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30">
            <Loader2 className="w-2 h-2 animate-spin" />
            STARTING
          </div>
        );
      case 'ended':
        return (
          <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            ENDED
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />
      
      {/* Mobile: Full-width video with collapsible chat */}
      {/* Desktop: Side-by-side layout */}
      <div className="md:container md:py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] lg:gap-6">
          {/* Main content */}
          <div className="flex flex-col">
            {/* Video Player - Full width on mobile */}
            <div className="w-full lg:rounded-2xl lg:overflow-hidden lg:shadow-xl">
              <VideoPlayer
                playbackUrl={livepeerStatus.playbackUrl || stream.playback_url || undefined}
                playbackId={stream.playback_id || undefined}
                title={stream.title}
                isLive={streamPhase === 'live'}
                streamPhase={streamPhase}
                onRetry={livepeerStatus.retry}
              />
            </div>

            {/* Stream Info Card */}
            <div className="px-4 py-4 md:py-5 lg:px-0 lg:pt-5">
              <div className="lg:glass-card lg:p-6">
                <div className="flex flex-col gap-4">
                  {/* Title and badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <StreamPhaseIndicator />
                      </div>
                      <h1 className="font-display text-lg md:text-xl font-bold line-clamp-2">{stream.title}</h1>
                    </div>
                    
                    {/* Mobile actions - condensed */}
                    <div className="flex items-center gap-1.5 lg:hidden">
                      <Button 
                        variant={isLiked ? "default" : "subtle"}
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setIsLiked(!isLiked)}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                      </Button>
                      <Button 
                        variant="subtle" 
                        size="icon"
                        className="h-9 w-9" 
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Streamer info */}
                  <div className="flex items-center justify-between gap-3">
                    <Link 
                      to={streamerUsername ? `/profile/${streamerUsername}` : '#'}
                      className="flex items-center gap-2.5 group"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm md:text-lg shadow-md">
                        {streamerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm md:text-base group-hover:text-primary transition-colors">
                          {streamerName}
                        </p>
                        <p className="text-xs text-muted-foreground">Streamer</p>
                      </div>
                    </Link>
                    
                    <div className="flex items-center gap-2">
                      {/* Follow button for non-owners */}
                      {!isStreamOwner && streamerId && (
                        <FollowButton profileId={streamerId} />
                      )}
                      
                      {/* Owner end stream button - inline on mobile */}
                      {canEndStream && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={endStreamMutation.isPending}
                              className="gap-1.5"
                            >
                              {endStreamMutation.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <StopCircle className="h-3.5 w-3.5" />
                              )}
                              <span className="hidden sm:inline">End Stream</span>
                              <span className="sm:hidden">End</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>End stream?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will stop your live stream and end it for all viewers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => {
                                  endStreamMutation.mutate(stream.id, {
                                    onSuccess: () => navigate('/'),
                                  });
                                }}
                                disabled={endStreamMutation.isPending}
                              >
                                {endStreamMutation.isPending ? 'Ending…' : 'End stream'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs md:text-sm">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{formatViewerCount(displayViewerCount)}</span>
                      {isConnected && streamPhase === 'live' && (
                        <Radio className="h-2.5 w-2.5 text-success animate-pulse" />
                      )}
                    </div>
                    
                    {stream.started_at && streamPhase === 'live' && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs md:text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formatDuration(new Date(stream.started_at))}</span>
                      </div>
                    )}
                    
                    {stream.game_category && (
                      <div className="px-2.5 py-1 rounded-lg bg-primary/10 text-xs md:text-sm text-primary font-medium">
                        {stream.game_category}
                      </div>
                    )}
                    
                    {livepeerStatus.isChecking && streamPhase === 'waiting' && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Checking...
                      </div>
                    )}
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden lg:flex items-center gap-2 pt-2 border-t border-border/30">
                    <TipButton 
                      streamerId={streamerId}
                      streamerName={streamerName}
                      streamId={stream.id}
                    />
                    
                    <ClipButton
                      streamId={stream.id}
                      playbackId={stream.playback_id || undefined}
                      currentTime={currentPlaybackTime}
                      isLive={streamPhase === 'live'}
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
                    
                    <Link to={streamerUsername ? `/profile/${streamerUsername}` : '#'}>
                      <Button variant="subtle" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Tip Button - Fixed at bottom with chat toggle */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-lg border-t border-border/30 flex items-center gap-2 lg:hidden z-40">
              <TipButton 
                streamerId={streamerId}
                streamerName={streamerName}
                streamId={stream.id}
              />
              
              <Sheet open={chatOpen} onOpenChange={setChatOpen}>
                <SheetTrigger asChild>
                  <Button variant="subtle" className="flex-1 gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Chat
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[70vh] p-0 rounded-t-2xl">
                  <LiveChat streamId={stream.id} />
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Spacer for fixed bottom bar on mobile */}
            <div className="h-16 lg:hidden" />
          </div>

          {/* Desktop Chat Sidebar */}
          <div className="hidden lg:block h-[calc(100vh-120px)] min-h-[500px]">
            <LiveChat streamId={stream.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;

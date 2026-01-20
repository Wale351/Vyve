import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer';
import LiveChat from '@/components/LiveChat';
import TipButton from '@/components/TipButton';
import FollowButton from '@/components/FollowButton';
import ClipButton from '@/components/ClipButton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { Users, Clock, Share2, Loader2, Play, StopCircle, MessageCircle, ChevronUp, Radio, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const Watch = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const { data: stream, isLoading } = useStream(streamId);
  const { user } = useWalletAuth();
  const endStreamMutation = useEndStream();
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
    if (stream.is_live && !livepeerStatus.isActive) return 'waiting';
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
        <div className="container px-4 py-16 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card/80 rounded-3xl border border-border/30 p-10 max-w-md text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
              <Play className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Stream Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This stream may have ended or doesn't exist.
            </p>
            <Link to="/">
              <Button variant="premium">Browse Streams</Button>
            </Link>
          </motion.div>
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
  const streamerAvatar = stream.profiles?.avatar_url;
  const streamerId = stream.profiles?.id || '';
  const isVerified = stream.profiles?.verified_creator;

  // Stream phase indicator component
  const StreamPhaseIndicator = () => {
    switch (streamPhase) {
      case 'live':
        return (
          <div className="live-badge flex items-center gap-1.5 text-xs px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
            LIVE
          </div>
        );
      case 'waiting':
        return (
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-warning/20 text-warning border border-warning/30">
            <Loader2 className="w-3 h-3 animate-spin" />
            STARTING
          </div>
        );
      case 'ended':
        return (
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">
            ENDED
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />
      
      <div className="md:container md:py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] lg:gap-6">
          {/* Main content */}
          <div className="flex flex-col">
            {/* Video Player */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full lg:rounded-2xl lg:overflow-hidden"
            >
              <VideoPlayer
                playbackUrl={livepeerStatus.playbackUrl || stream.playback_url || undefined}
                playbackId={stream.playback_id || undefined}
                title={stream.title}
                isLive={streamPhase === 'live'}
                streamPhase={streamPhase}
                onRetry={livepeerStatus.retry}
              />
            </motion.div>

            {/* Stream Info Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="px-4 py-5 lg:px-0 lg:pt-6"
            >
              <div className="lg:bg-card/50 lg:rounded-2xl lg:p-6 lg:border lg:border-border/30">
                {/* Title and Phase */}
                <div className="flex items-start gap-3 mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <StreamPhaseIndicator />
                      {stream.game_category && (
                        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-xs text-primary font-medium">
                          {stream.game_category}
                        </span>
                      )}
                    </div>
                    <h1 className="font-display text-xl md:text-2xl font-bold leading-tight">{stream.title}</h1>
                  </div>
                  
                  {/* Mobile share button */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="lg:hidden h-10 w-10"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Streamer info */}
                <div className="flex items-center justify-between gap-4 pb-5 border-b border-border/30">
                  <Link 
                    to={streamerUsername ? `/profile/${streamerUsername}` : '#'}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar className="w-12 h-12 border-2 border-border">
                      {streamerAvatar ? (
                        <AvatarImage src={streamerAvatar} alt={streamerName} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                          {streamerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-display font-semibold group-hover:text-primary transition-colors">
                          {streamerName}
                        </p>
                        {isVerified && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Streamer</p>
                    </div>
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    {!isStreamOwner && streamerId && (
                      <FollowButton profileId={streamerId} />
                    )}
                    
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
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <StopCircle className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">End Stream</span>
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
                            >
                              End stream
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 pt-5">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatViewerCount(displayViewerCount)}</span>
                    {isConnected && streamPhase === 'live' && (
                      <Radio className="h-3 w-3 text-success animate-pulse" />
                    )}
                  </div>
                  
                  {stream.started_at && streamPhase === 'live' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDuration(new Date(stream.started_at))}</span>
                    </div>
                  )}

                  {/* Desktop Actions */}
                  <div className="hidden lg:flex items-center gap-2 ml-auto">
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
                      variant="ghost" 
                      size="icon" 
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
            
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
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block h-[calc(100vh-120px)] min-h-[500px]"
          >
            <LiveChat streamId={stream.id} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
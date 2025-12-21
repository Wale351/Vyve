import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer';
import LiveChat from '@/components/LiveChat';
import TipButton from '@/components/TipButton';
import { Button } from '@/components/ui/button';
import { useStream } from '@/hooks/useStreams';
import { formatViewerCount, formatDuration, formatAddress } from '@/lib/mockData';
import { Users, Clock, Share2, Heart, ExternalLink, Loader2, Zap, Trophy, Star, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

// XP Progress component
const XPProgress = ({ current = 750, max = 1000, level = 5 }: { current?: number; max?: number; level?: number }) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Trophy className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Viewer Level</p>
            <p className="font-display font-bold text-lg gradient-text">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">XP Progress</p>
          <p className="font-mono text-sm">{current}/{max}</p>
        </div>
      </div>
      <div className="xp-bar">
        <div className="xp-bar-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

// Streamer badge component
const StreamerBadge = ({ type }: { type: 'verified' | 'partner' | 'rising' }) => {
  const badges = {
    verified: { icon: Shield, color: 'text-primary', bg: 'bg-primary/20', label: 'Verified' },
    partner: { icon: Star, color: 'text-secondary', bg: 'bg-secondary/20', label: 'Partner' },
    rising: { icon: Zap, color: 'text-neon-green', bg: 'bg-neon-green/20', label: 'Rising Star' },
  };
  
  const badge = badges[type];
  const Icon = badge.icon;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${badge.bg} ${badge.color} text-xs font-medium`}>
      <Icon className="h-3 w-3" />
      {badge.label}
    </div>
  );
};

const Watch = () => {
  const { streamId } = useParams();
  const { data: stream, isLoading } = useStream(streamId);
  const [isLiked, setIsLiked] = useState(false);
  const [showTipFlash, setShowTipFlash] = useState(false);

  // Tip feedback animation
  const triggerTipFlash = () => {
    setShowTipFlash(true);
    setTimeout(() => setShowTipFlash(false), 600);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse" />
          </div>
          <p className="mt-4 text-muted-foreground">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <div className="glass-card max-w-md mx-auto p-10">
            <div className="relative inline-block mb-6">
              <Zap className="h-16 w-16 text-muted-foreground" />
              <div className="absolute inset-0 blur-xl bg-primary/20" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-3">Stream Not Found</h1>
            <p className="text-muted-foreground mb-8">This stream doesn't exist or has ended.</p>
            <Link to="/">
              <Button variant="neon" size="lg">Back to Home</Button>
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

  const streamerName = stream.profiles?.username || formatAddress(stream.profiles?.wallet_address || '');
  const streamerAddress = stream.profiles?.wallet_address || '';

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="container relative py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Main content */}
          <div className="space-y-4">
            {/* Video Player with tip flash effect */}
            <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${showTipFlash ? 'animate-tip-flash' : ''}`}>
              <VideoPlayer 
                playbackId={stream.playback_url || undefined}
                title={stream.title}
                isLive={stream.is_live || false}
              />
              
              {/* Neon border on hover */}
              <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-transparent hover:border-primary/30 transition-colors" />
            </div>

            {/* Stream Info */}
            <div className="glass-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="font-display text-2xl md:text-3xl font-bold mb-4">
                    {stream.title}
                  </h1>
                  
                  <div className="flex items-center gap-4">
                    {/* Streamer info with glowing avatar */}
                    <Link 
                      to={`/profile/${streamerAddress}`}
                      className="flex items-center gap-4 group"
                    >
                      <div className="glow-avatar connected">
                        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-xl">
                          {streamerName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                            {streamerName}
                          </p>
                          <StreamerBadge type="verified" />
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {formatAddress(streamerAddress)}
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{formatViewerCount(stream.viewer_count || 0)} watching</span>
                    </div>
                    
                    {stream.started_at && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDuration(new Date(stream.started_at))}</span>
                      </div>
                    )}
                    
                    {stream.game_category && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/20">
                        <Zap className="h-4 w-4 text-secondary" />
                        <span className="text-sm font-medium text-secondary">{stream.game_category}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div onClick={triggerTipFlash}>
                    <TipButton 
                      streamerAddress={streamerAddress}
                      streamerName={streamerName}
                    />
                  </div>
                  
                  <Button 
                    variant="glass" 
                    size="icon" 
                    onClick={handleShare}
                    className="hover:border-primary/50"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant={isLiked ? "default" : "glass"}
                    size="icon"
                    onClick={() => setIsLiked(!isLiked)}
                    className={isLiked ? "bg-secondary hover:bg-secondary/90" : "hover:border-secondary/50"}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  </Button>
                  
                  <Link to={`/profile/${streamerAddress}`}>
                    <Button variant="glass" size="icon" className="hover:border-primary/50">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* XP Progress */}
            <XPProgress />
            
            {/* Chat */}
            <div className="h-[calc(100vh-340px)] min-h-[400px]">
              <LiveChat streamId={stream.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
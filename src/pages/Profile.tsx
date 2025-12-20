import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import { Button } from '@/components/ui/button';
import { useProfile, useProfileTipsReceived } from '@/hooks/useProfile';
import { useStreamerStreams } from '@/hooks/useStreams';
import { formatAddress } from '@/lib/mockData';
import { useAccount } from 'wagmi';
import { 
  Users, 
  Coins, 
  Radio, 
  ExternalLink, 
  Copy, 
  Check,
  Calendar,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const Profile = () => {
  const { address: profileAddress } = useParams();
  const { address: connectedAddress, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  const { data: profile, isLoading: profileLoading } = useProfile(profileAddress);
  const { data: totalTips = 0 } = useProfileTipsReceived(profile?.id);
  const { data: streams = [], isLoading: streamsLoading } = useStreamerStreams(profile?.id);
  
  const isOwnProfile = isConnected && connectedAddress?.toLowerCase() === profileAddress?.toLowerCase();

  const copyAddress = async () => {
    if (profileAddress) {
      await navigator.clipboard.writeText(profileAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied!');
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const displayName = profile?.username || formatAddress(profileAddress || '');
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400&q=80';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Profile Header */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
        
        <div className="container relative py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
                <img 
                  src={avatarUrl} 
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              {profile?.is_streamer && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  Streamer
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display text-3xl font-bold">{displayName}</h1>
              
              <button
                onClick={copyAddress}
                className="inline-flex items-center gap-2 mt-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-mono text-sm">
                  {formatAddress(profileAddress || '')}
                </span>
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>

              {profile?.bio && (
                <p className="mt-4 text-muted-foreground max-w-xl">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-6">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-xl font-display font-bold text-primary">
                    <Users className="h-5 w-5" />
                    0
                  </div>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-xl font-display font-bold text-secondary">
                    <Coins className="h-5 w-5" />
                    {totalTips.toFixed(4)} ETH
                  </div>
                  <p className="text-xs text-muted-foreground">Tips Received</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-xl font-display font-bold text-accent">
                    <Radio className="h-5 w-5" />
                    {streams.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Streams</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                {isOwnProfile ? (
                  <Link to="/go-live">
                    <Button variant="neon" className="gap-2">
                      <Radio className="h-4 w-4" />
                      Go Live
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button variant="neon">Follow</Button>
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View on Base
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Past Streams */}
      <section className="container py-12">
        <div className="flex items-center gap-2 mb-8">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-display text-2xl font-bold">Past Streams</h2>
        </div>

        {streamsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : streams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((stream, index) => (
              <div 
                key={stream.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StreamCard stream={stream} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-card">
            <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No Streams Yet</h3>
            <p className="text-muted-foreground">
              {isOwnProfile 
                ? "You haven't streamed yet. Start your first stream!"
                : "This creator hasn't streamed yet."
              }
            </p>
            {isOwnProfile && (
              <Link to="/go-live" className="inline-block mt-4">
                <Button variant="glow">Start Streaming</Button>
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;

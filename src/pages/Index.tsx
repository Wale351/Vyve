import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import { useLiveStreams } from '@/hooks/useStreams';
import { Gamepad2, TrendingUp, Users, Loader2, Sparkles, Radio, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';

const Index = () => {
  const { data: liveStreams = [], isLoading } = useLiveStreams();
  const totalViewers = liveStreams.reduce((acc, s) => acc + (s.viewer_count || 0), 0);
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      {/* Hero Section with grid pattern */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        {/* Animated glow orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-float" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
        
        <div className="container relative pt-20 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm mb-8 animate-fade-in"
              style={{ animationDelay: '0ms' }}
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Base-Native Gaming Platform</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            
            {/* Main heading */}
            <h1 
              className="font-display text-5xl md:text-7xl font-bold mb-6 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              Stream. Watch.{' '}
              <span className="gradient-text neon-text">Earn.</span>
            </h1>
            
            <p 
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              The next-gen decentralized livestream platform on Base. 
              Connect your wallet, go live, and earn tips in ETH instantly.
            </p>
            
            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in"
              style={{ animationDelay: '300ms' }}
            >
              {isConnected ? (
                <Link to="/go-live">
                  <Button variant="neon" size="xl" className="gap-2">
                    <Radio className="h-5 w-5" />
                    Start Streaming
                  </Button>
                </Link>
              ) : (
                <Button variant="neon" size="xl" className="gap-2" disabled>
                  <Radio className="h-5 w-5" />
                  Connect Wallet to Stream
                </Button>
              )}
              <Button variant="glass" size="xl" className="gap-2">
                <Zap className="h-5 w-5" />
                Explore Streams
              </Button>
            </div>
            
            {/* Live Stats */}
            <div 
              className="inline-flex items-center gap-8 px-8 py-4 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/30 animate-fade-in"
              style={{ animationDelay: '400ms' }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-3xl font-display font-bold">
                  <div className="relative">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <div className="absolute inset-0 blur-md bg-primary/50" />
                  </div>
                  <span className="gradient-text">{liveStreams.length}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Live Now</p>
              </div>
              
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-3xl font-display font-bold">
                  <div className="relative">
                    <Users className="h-6 w-6 text-secondary" />
                    <div className="absolute inset-0 blur-md bg-secondary/50" />
                  </div>
                  <span className="text-foreground">{totalViewers.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Watching</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Streams Grid */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/30">
                <Gamepad2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">Live Streams</h2>
                <p className="text-muted-foreground">Watch your favorite gamers live</p>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              All
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Gaming
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              IRL
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse" />
            </div>
            <p className="mt-4 text-muted-foreground">Loading streams...</p>
          </div>
        ) : liveStreams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {liveStreams.map((stream, index) => (
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
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <Gamepad2 className="h-20 w-20 text-muted-foreground" />
              <div className="absolute inset-0 blur-2xl bg-primary/20" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-3">No Live Streams</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Be the first to go live and start streaming to the Base Haven community!
            </p>
            {isConnected && (
              <Link to="/go-live">
                <Button variant="neon" size="lg" className="gap-2">
                  <Radio className="h-5 w-5" />
                  Start Streaming
                </Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/20 backdrop-blur-xl">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Gamepad2 className="h-8 w-8 text-primary" />
                <div className="absolute inset-0 blur-lg bg-primary/30" />
              </div>
              <span className="font-display text-xl font-bold gradient-text">Base Haven</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Built on <span className="text-primary">Base</span> • Powered by <span className="text-secondary">Livepeer</span>
            </p>
            
            <div className="flex items-center gap-4">
              <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Terms
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Privacy
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Discord
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
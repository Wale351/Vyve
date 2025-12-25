import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import { useLiveStreams } from '@/hooks/useStreams';
import { Play, TrendingUp, Users, Loader2, Radio } from 'lucide-react';
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
      
      {/* Hero Section - Compact on mobile */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container relative px-4 pt-8 pb-10 md:pt-16 md:pb-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm mb-4 md:mb-8 animate-fade-in"
            >
              <Play className="h-3 w-3 md:h-4 md:w-4" />
              <span className="font-medium">Decentralized Streaming on Base</span>
            </div>
            
            {/* Main heading */}
            <h1 
              className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 animate-fade-in tracking-tight"
              style={{ animationDelay: '100ms' }}
            >
              Where creators{' '}
              <span className="gradient-text">thrive</span>
            </h1>
            
            <p 
              className="text-base md:text-lg text-muted-foreground mb-6 md:mb-10 max-w-xl mx-auto animate-fade-in leading-relaxed px-4"
              style={{ animationDelay: '200ms' }}
            >
              Stream to your audience, earn tips in ETH, and build your community.
            </p>
            
            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 md:mb-14 animate-fade-in px-4"
              style={{ animationDelay: '300ms' }}
            >
              {isConnected ? (
                <Link to="/go-live" className="w-full sm:w-auto">
                  <Button variant="premium" size="lg" className="gap-2 w-full sm:w-auto">
                    <Radio className="h-4 w-4 md:h-5 md:w-5" />
                    Start Streaming
                  </Button>
                </Link>
              ) : (
                <Button variant="premium" size="lg" className="gap-2 w-full sm:w-auto" disabled>
                  <Radio className="h-4 w-4 md:h-5 md:w-5" />
                  Connect to Stream
                </Button>
              )}
              <Button variant="subtle" size="lg" className="gap-2 w-full sm:w-auto">
                Explore Streams
              </Button>
            </div>
            
            {/* Live Stats - Horizontal scroll on mobile */}
            <div 
              className="inline-flex items-center gap-4 md:gap-8 px-4 md:px-8 py-3 md:py-5 rounded-xl md:rounded-2xl bg-card border border-border/50 shadow-lg animate-fade-in"
              style={{ animationDelay: '400ms' }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 md:gap-2 text-xl md:text-2xl font-display font-bold">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  <span className="text-foreground">{liveStreams.length}</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">Live Now</p>
              </div>
              
              <div className="w-px h-8 md:h-12 bg-border" />
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 md:gap-2 text-xl md:text-2xl font-display font-bold">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-secondary" />
                  <span className="text-foreground">{totalViewers.toLocaleString()}</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">Watching</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Streams - Vertical feed on mobile, grid on desktop */}
      <section className="container px-4 py-8 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-10">
          <div>
            <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold">Live Streams</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-0.5 md:mt-1">Discover live content from creators</p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            <Button variant="soft" size="sm" className="flex-shrink-0">All</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground flex-shrink-0">Gaming</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground flex-shrink-0">IRL</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-20">
            <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-primary" />
            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground">Loading streams...</p>
          </div>
        ) : liveStreams.length > 0 ? (
          /* Mobile: Single column, Desktop: Grid */
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
            {liveStreams.map((stream, index) => (
              <div 
                key={stream.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <StreamCard stream={stream} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-20 glass-card mx-auto max-w-md">
            <Play className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4 md:mb-6" />
            <h3 className="font-display text-xl md:text-2xl font-bold mb-2 md:mb-3">No Live Streams</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 px-4">
              Be the first to go live!
            </p>
            {isConnected && (
              <Link to="/go-live">
                <Button variant="premium" size="lg" className="gap-2">
                  <Radio className="h-5 w-5" />
                  Start Streaming
                </Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/50">
        <div className="container px-4 py-6 md:py-10">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Play className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-display text-lg md:text-xl font-bold">Vyve</span>
            </div>
            
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              Built on Base • Powered by Livepeer
            </p>
            
            <div className="flex items-center gap-4 md:gap-6">
              <button className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                Terms
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
                Privacy
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm">
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

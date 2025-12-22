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
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container relative pt-16 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8 animate-fade-in"
            >
              <Play className="h-4 w-4" />
              <span className="font-medium">Decentralized Streaming on Base</span>
            </div>
            
            {/* Main heading */}
            <h1 
              className="font-display text-4xl md:text-6xl font-bold mb-6 animate-fade-in tracking-tight"
              style={{ animationDelay: '100ms' }}
            >
              Where creators{' '}
              <span className="gradient-text">thrive</span>
            </h1>
            
            <p 
              className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto animate-fade-in leading-relaxed"
              style={{ animationDelay: '200ms' }}
            >
              Stream to your audience, earn tips in ETH, and build your community 
              on the next-generation livestream platform.
            </p>
            
            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-in"
              style={{ animationDelay: '300ms' }}
            >
              {isConnected ? (
                <Link to="/go-live">
                  <Button variant="premium" size="xl" className="gap-2">
                    <Radio className="h-5 w-5" />
                    Start Streaming
                  </Button>
                </Link>
              ) : (
                <Button variant="premium" size="xl" className="gap-2" disabled>
                  <Radio className="h-5 w-5" />
                  Connect Wallet to Stream
                </Button>
              )}
              <Button variant="subtle" size="xl" className="gap-2">
                Explore Streams
              </Button>
            </div>
            
            {/* Live Stats */}
            <div 
              className="inline-flex items-center gap-8 px-8 py-5 rounded-2xl bg-card border border-border/50 shadow-lg animate-fade-in"
              style={{ animationDelay: '400ms' }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-display font-bold">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-foreground">{liveStreams.length}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Live Now</p>
              </div>
              
              <div className="w-px h-12 bg-border" />
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-display font-bold">
                  <Users className="h-5 w-5 text-secondary" />
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
            <h2 className="font-display text-2xl md:text-3xl font-bold">Live Streams</h2>
            <p className="text-muted-foreground mt-1">Discover live content from creators</p>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="soft" size="sm">All</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">Gaming</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">IRL</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading streams...</p>
          </div>
        ) : liveStreams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="text-center py-20 glass-card">
            <Play className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="font-display text-2xl font-bold mb-3">No Live Streams</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Be the first to go live and start streaming to the Base Haven community!
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
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Play className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-display text-xl font-bold">Base Haven</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Built on Base • Powered by Livepeer
            </p>
            
            <div className="flex items-center gap-6">
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

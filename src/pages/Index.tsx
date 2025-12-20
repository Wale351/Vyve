import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import { mockStreams } from '@/lib/mockData';
import { Gamepad2, TrendingUp, Users } from 'lucide-react';

const Index = () => {
  const liveStreams = mockStreams.filter(s => s.isLive);
  const totalViewers = liveStreams.reduce((acc, s) => acc + s.viewerCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2" />
        
        <div className="container relative pt-16 pb-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6 animate-fade-in">
              <Gamepad2 className="h-4 w-4" />
              Base-Native Gaming Streams
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Stream. Watch.{' '}
              <span className="gradient-text neon-text">Earn.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              The decentralized gaming livestream platform on Base. 
              Connect your wallet, go live, and earn tips in ETH.
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="text-center">
                <div className="flex items-center gap-2 text-2xl font-display font-bold text-primary">
                  <TrendingUp className="h-5 w-5" />
                  {liveStreams.length}
                </div>
                <p className="text-sm text-muted-foreground">Live Now</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="flex items-center gap-2 text-2xl font-display font-bold text-secondary">
                  <Users className="h-5 w-5" />
                  {totalViewers.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Watching</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Streams Grid */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold">Live Streams</h2>
            <p className="text-muted-foreground mt-1">Watch your favorite gamers live</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {liveStreams.length === 0 && (
          <div className="text-center py-16">
            <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No Live Streams</h3>
            <p className="text-muted-foreground">
              Be the first to go live and start streaming!
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="font-display font-bold gradient-text">Base Haven</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built on Base • Powered by Livepeer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

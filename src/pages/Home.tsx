import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import GameCard from '@/components/GameCard';
import { useLiveStreams } from '@/hooks/useStreams';
import { useGames, useLiveStreamCountByGame } from '@/hooks/useGames';
import { Play, TrendingUp, Users, Loader2, Radio, Gamepad2, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Home = () => {
  const { data: liveStreams = [], isLoading } = useLiveStreams();
  const { data: games = [] } = useGames();
  const { data: liveCountByGame = {} } = useLiveStreamCountByGame();
  
  const totalViewers = liveStreams.reduce((acc, s) => acc + (s.viewer_count || 0), 0);

  // Get trending games (games with live streams, sorted by viewer count)
  const trendingGames = games
    .filter(g => liveCountByGame[g.id] > 0)
    .sort((a, b) => (liveCountByGame[b.id] || 0) - (liveCountByGame[a.id] || 0))
    .slice(0, 6);

  // Get popular streamers from live streams (sorted by viewer count)
  const popularStreams = [...liveStreams]
    .sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />
      
      {/* Stats Banner */}
      <section className="border-b border-border/30 bg-card/30">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-medium">{liveStreams.length} Live</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{totalViewers.toLocaleString()} watching</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Popular Streams */}
      {popularStreams.length > 0 && (
        <section className="container px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="font-varsity text-xl md:text-2xl tracking-wide">POPULAR NOW</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {popularStreams.map((stream, index) => (
              <div 
                key={stream.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <StreamCard stream={stream} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Games */}
      {trendingGames.length > 0 && (
        <section className="container px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-varsity text-xl md:text-2xl tracking-wide">TRENDING GAMES</h2>
            </div>
            <Link to="/games">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {trendingGames.map((game) => (
              <div key={game.id} className="flex-shrink-0 w-[160px] md:w-[200px]">
                <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Live Streams */}
      <section className="container px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
          <div>
            <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold">Live Streams</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-0.5">Discover live content from creators</p>
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
            <Link to="/go-live">
              <Button variant="premium" size="lg" className="gap-2">
                <Radio className="h-5 w-5" />
                Start Streaming
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Browse by Category */}
      {games.length > 0 && !trendingGames.length && (
        <section className="container px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <h2 className="font-varsity text-xl md:text-2xl tracking-wide">BROWSE GAMES</h2>
            </div>
            <Link to="/games">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {games.slice(0, 8).map((game) => (
              <div key={game.id} className="flex-shrink-0 w-[160px] md:w-[200px]">
                <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/50 mt-auto">
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

export default Home;

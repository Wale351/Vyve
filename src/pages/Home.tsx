import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import GameCard from '@/components/GameCard';
import TrendingGamesWidget from '@/components/TrendingGamesWidget';
import RecentlyPlayedGames from '@/components/RecentlyPlayedGames';
import UpcomingStreamsWidget from '@/components/UpcomingStreamsWidget';
import { useLiveStreams } from '@/hooks/useStreams';
import { useGames, useLiveStreamCountByGame } from '@/hooks/useGames';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { Play, TrendingUp, Users, Loader2, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Home = () => {
  const { data: liveStreams = [], isLoading } = useLiveStreams();
  const { data: games = [] } = useGames();
  const { data: liveCountByGame = {} } = useLiveStreamCountByGame();
  const { authenticated } = useWalletAuth();
  
  const totalViewers = liveStreams.reduce((acc, s) => acc + (s.viewer_count || 0), 0);

  const trendingGames = games
    .filter(g => liveCountByGame[g.id] > 0)
    .sort((a, b) => (liveCountByGame[b.id] || 0) - (liveCountByGame[a.id] || 0))
    .slice(0, 8);

  const popularStreams = [...liveStreams]
    .sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-14 md:h-16" />
      
      {/* Stats Bar */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="font-medium">{liveStreams.length}</span>
              <span className="text-muted-foreground">Live</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="font-medium text-foreground">{totalViewers.toLocaleString()}</span>
              <span>watching</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6">
        {/* Popular Streams */}
        {popularStreams.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold text-lg">Popular Now</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {popularStreams.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Games */}
        {trendingGames.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-lg">Trending</h2>
              </div>
              <Link to="/games">
                <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                  View All
                </Button>
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {trendingGames.map((game) => (
                <div key={game.id} className="flex-shrink-0 w-[140px]">
                  <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Grid with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold text-lg">All Live Streams</h2>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : liveStreams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {liveStreams.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card/50 rounded-xl border border-border/50">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Play className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No Live Streams</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to go live!
                </p>
                <Link to="/go-live">
                  <Button size="sm" className="gap-2">
                    <Radio className="h-3 w-3" />
                    Start Streaming
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
            <TrendingGamesWidget />
            {authenticated && <RecentlyPlayedGames />}
            <UpcomingStreamsWidget />
          </aside>
        </div>

        {/* Browse Games */}
        {games.length > 0 && !trendingGames.length && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Browse Games</h2>
              <Link to="/games">
                <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                  View All
                </Button>
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {games.slice(0, 10).map((game) => (
                <div key={game.id} className="flex-shrink-0 w-[140px]">
                  <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-8">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Play className="h-2.5 w-2.5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-medium text-foreground">Vyve</span>
            </div>
            <span>Built on Base</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

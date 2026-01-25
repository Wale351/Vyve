import { motion } from 'framer-motion';
import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import GameCard from '@/components/GameCard';
import TrendingGamesWidget from '@/components/TrendingGamesWidget';
import RecentlyPlayedGames from '@/components/RecentlyPlayedGames';
import UpcomingStreamsWidget from '@/components/UpcomingStreamsWidget';
import { useLiveStreams } from '@/hooks/useStreams';
import { useGames, useLiveStreamCountByGame } from '@/hooks/useGames';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { Play, Loader2, Radio, Flame, Sparkles, Gamepad2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Home = () => {
  const { data: liveStreams = [], isLoading } = useLiveStreams();
  const { data: games = [] } = useGames();
  const { data: liveCountByGame = {} } = useLiveStreamCountByGame();
  const { authenticated } = useWalletAuth();
  
  // Get trending games (games with live streams)
  const trendingGames = games
    .filter(g => liveCountByGame[g.id] > 0)
    .sort((a, b) => (liveCountByGame[b.id] || 0) - (liveCountByGame[a.id] || 0))
    .slice(0, 8);

  // Get all games for browse section (top 12)
  const browseGames = games.slice(0, 12);

  // Popular streams sorted by viewers
  const popularStreams = [...liveStreams]
    .sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-14 md:h-16" />
      
      {/* Hero Stats */}
      {liveStreams.length > 0 && (
        <div className="border-b border-border/30 bg-card/30">
          <div className="container px-4 py-4">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
                </span>
                <span className="font-semibold">{liveStreams.length}</span>
                <span className="text-muted-foreground">live now</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Streams */}
      {popularStreams.length > 0 && (
        <section className="container px-4 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">Popular Now</h2>
              <p className="text-sm text-muted-foreground">Most watched streams right now</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularStreams.map((stream, i) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <StreamCard stream={stream} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Games - Horizontal Scroll */}
      {trendingGames.length > 0 && (
        <section className="container px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold">Trending Activities</h2>
            </div>
            <Link to="/games">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {trendingGames.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex-shrink-0 w-[140px]"
              >
                <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} compact />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Browse Activities Section */}
      {browseGames.length > 0 && (
        <section className="container px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10">
                <Gamepad2 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">Browse Activities</h2>
                <p className="text-sm text-muted-foreground">Explore games and categories</p>
              </div>
            </div>
            <Link to="/games">
              <Button variant="outline" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {browseGames.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Main Grid */}
      <div className="container px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Stream Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold">Live Streams</h2>
              <p className="text-sm text-muted-foreground mt-1">Discover creators going live</p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">Loading streams...</p>
              </div>
            ) : liveStreams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {liveStreams.map((stream, i) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <StreamCard stream={stream} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-card/50 rounded-2xl border border-border/30"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Play className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">No Live Streams</h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  Be the first to go live!
                </p>
                <Link to="/go-live">
                  <Button variant="premium" className="gap-2">
                    <Radio className="h-4 w-4" />
                    Start Streaming
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-20 space-y-5">
              <UpcomingStreamsWidget />
              <TrendingGamesWidget />
              {authenticated && <RecentlyPlayedGames />}
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 mt-12">
        <div className="container px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Play className="h-3 w-3 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-display font-semibold text-foreground">Vyve</span>
            </div>
            <span>Built on Base • Powered by Livepeer</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
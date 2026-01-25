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
import { Play, Users, Loader2, Radio } from 'lucide-react';
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
      
      {/* Minimal Stats Bar */}
      <div className="border-b border-border/40">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
              <span className="text-foreground font-medium">{liveStreams.length}</span>
              <span>live</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{totalViewers.toLocaleString()}</span>
              <span>watching</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4">
        {/* Popular Streams */}
        {popularStreams.length > 0 && (
          <section className="pt-8 pb-6">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Popular Now</h2>
              <span className="text-xs text-muted-foreground">{popularStreams.length} streams</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularStreams.map((stream, i) => (
                <motion.div 
                  key={stream.id} 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <StreamCard stream={stream} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Trending Games */}
        {trendingGames.length > 0 && (
          <section className="py-6 border-t border-border/40">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Trending</h2>
              <Link to="/games" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View all
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {trendingGames.map((game, i) => (
                <motion.div 
                  key={game.id} 
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="flex-shrink-0 w-[140px] md:w-[160px]"
                >
                  <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Main Content */}
        <div className="py-8 border-t border-border/40">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Streams Grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Live Streams</h2>
                <span className="text-xs text-muted-foreground">{liveStreams.length} streaming</span>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : liveStreams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {liveStreams.map((stream, i) => (
                    <motion.div 
                      key={stream.id} 
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                    >
                      <StreamCard stream={stream} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-border/40 rounded-xl bg-card/30">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Play className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">No streams yet</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Be the first to go live
                  </p>
                  <Link to="/go-live">
                    <Button size="sm" className="gap-2">
                      <Radio className="h-3.5 w-3.5" />
                      Start Streaming
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-20 space-y-5">
                <TrendingGamesWidget />
                {authenticated && <RecentlyPlayedGames />}
                <UpcomingStreamsWidget />
              </div>
            </aside>
          </div>
        </div>

        {/* Browse Games - Only when no trending */}
        {games.length > 0 && !trendingGames.length && (
          <section className="py-8 border-t border-border/40">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Browse Activities</h2>
              <Link to="/games" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View all
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {games.slice(0, 10).map((game, i) => (
                <motion.div 
                  key={game.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="flex-shrink-0 w-[140px] md:w-[160px]"
                >
                  <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Clean Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="container px-4 py-5">
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                <Play className="h-2.5 w-2.5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-semibold text-foreground">Vyve</span>
            </div>
            <span>Built on Base • Powered by Livepeer</span>
            <div className="flex items-center gap-4">
              <button className="hover:text-foreground transition-colors">Terms</button>
              <button className="hover:text-foreground transition-colors">Privacy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

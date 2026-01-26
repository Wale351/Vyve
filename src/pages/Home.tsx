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
import { Play, TrendingUp, Users, Loader2, Radio, Flame, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 }
  }
};

const Home = () => {
  const { data: liveStreams = [], isLoading } = useLiveStreams();
  const { data: games = [] } = useGames();
  const { data: liveCountByGame = {} } = useLiveStreamCountByGame();
  const { authenticated } = useWalletAuth();
  
  const totalViewers = liveStreams.reduce((acc, s) => acc + (s.viewer_count || 0), 0);

  // Get trending games (games with live streams, sorted by viewer count)
  const trendingGames = games
    .filter(g => liveCountByGame[g.id] > 0)
    .sort((a, b) => (liveCountByGame[b.id] || 0) - (liveCountByGame[a.id] || 0))
    .slice(0, 8);

  // Get popular streamers from live streams (sorted by viewer count)
  const popularStreams = [...liveStreams]
    .sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-14 md:h-16" />
      
      {/* Hero Stats Banner */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-b border-border/10 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"
      >
        <div className="container px-4 py-4">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
              </span>
              <span className="font-semibold text-foreground">{liveStreams.length}</span>
              <span className="text-muted-foreground">Live Now</span>
            </div>
            <div className="h-5 w-px bg-border/50" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="font-medium text-foreground">{totalViewers.toLocaleString()}</span>
              <span>watching</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container px-4">
        {/* Featured / Popular Streams */}
        {popularStreams.length > 0 && (
          <section className="py-8">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 mb-5"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-destructive/20 to-warning/20 border border-destructive/20">
                <Flame className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">Popular Now</h2>
                <p className="text-xs text-muted-foreground">Most watched streams</p>
              </div>
            </motion.div>
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {popularStreams.map((stream) => (
                <motion.div key={stream.id} variants={fadeInUp}>
                  <StreamCard stream={stream} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Trending Games */}
        {trendingGames.length > 0 && (
          <section className="py-6 border-t border-border/10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="flex items-center justify-between mb-5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Trending</h2>
                  <p className="text-xs text-muted-foreground">Popular games right now</p>
                </div>
              </div>
              <Link to="/games">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
                  View All
                </Button>
              </Link>
            </motion.div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {trendingGames.map((game, index) => (
                <motion.div 
                  key={game.id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex-shrink-0 w-[140px] md:w-[160px]"
                >
                  <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Main Content with Sidebar */}
        <div className="py-8 border-t border-border/10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="flex items-center gap-3 mb-6"
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 border border-secondary/20">
                  <Zap className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Live Streams</h2>
                  <p className="text-sm text-muted-foreground">Discover content from creators</p>
                </div>
              </motion.div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Loading streams...</p>
                </div>
              ) : liveStreams.length > 0 ? (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                  {liveStreams.map((stream) => (
                    <motion.div key={stream.id} variants={fadeInUp}>
                      <StreamCard stream={stream} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-gradient-to-b from-card/80 to-card/40 rounded-2xl border border-border/30 mx-auto max-w-md"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
                    <Play className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">No Live Streams</h3>
                  <p className="text-sm text-muted-foreground mb-6 px-4">
                    Be the first to go live and start streaming!
                  </p>
                  <Link to="/go-live">
                    <Button variant="premium" size="lg" className="gap-2">
                      <Radio className="h-4 w-4" />
                      Start Streaming
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-20 space-y-5">
                <TrendingGamesWidget />
                {authenticated && <RecentlyPlayedGames />}
                <UpcomingStreamsWidget />
              </div>
            </aside>
          </div>
          
          {/* Mobile Widgets Section */}
          <div className="lg:hidden py-6 border-t border-border/10 space-y-4">
            <UpcomingStreamsWidget />
            <TrendingGamesWidget />
            {authenticated && <RecentlyPlayedGames />}
          </div>
        </div>

        {/* Browse by Category - Only show if no trending */}
        {games.length > 0 && !trendingGames.length && (
          <section className="py-8 border-t border-border/10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="flex items-center justify-between mb-5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Browse Activities</h2>
                  <p className="text-xs text-muted-foreground">Find something to watch</p>
                </div>
              </div>
              <Link to="/games">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View All
                </Button>
              </Link>
            </motion.div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {games.slice(0, 10).map((game, index) => (
                <motion.div 
                  key={game.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex-shrink-0 w-[140px] md:w-[160px]"
                >
                  <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-border/10 mt-8">
        <div className="container px-4 py-6">
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Play className="h-3 w-3 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-display text-sm font-bold">Vyve</span>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Built on Base • Powered by Livepeer
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
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

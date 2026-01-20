import { motion } from 'framer-motion';
import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import GameCard from '@/components/GameCard';
import { useLiveStreams } from '@/hooks/useStreams';
import { useGames, useLiveStreamCountByGame } from '@/hooks/useGames';
import { Play, TrendingUp, Users, Loader2, Radio, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />
      
      {/* Stats Banner - Minimal */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="border-b border-border/20"
      >
        <div className="container px-4 py-3">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
              <span className="font-medium text-foreground">{liveStreams.length} Live</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{totalViewers.toLocaleString()} watching</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Featured / Popular Streams */}
      {popularStreams.length > 0 && (
        <section className="container px-4 py-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex items-center gap-2.5 mb-6"
          >
            <div className="p-2 rounded-xl bg-orange-500/10">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <h2 className="font-display text-xl md:text-2xl font-semibold">Popular Now</h2>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
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
        <section className="container px-4 py-6">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl md:text-2xl font-semibold">Trending</h2>
            </div>
            <Link to="/games">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View All
              </Button>
            </Link>
          </motion.div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {trendingGames.map((game, index) => (
              <motion.div 
                key={game.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-[160px] md:w-[180px]"
              >
                <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* All Live Streams */}
      <section className="container px-4 py-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Live Streams</h2>
            <p className="text-muted-foreground mt-1">Discover live content from creators</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading streams...</p>
          </div>
        ) : liveStreams.length > 0 ? (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {liveStreams.map((stream) => (
              <motion.div key={stream.id} variants={fadeInUp}>
                <StreamCard stream={stream} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-card/50 rounded-3xl border border-border/30 mx-auto max-w-lg"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">No Live Streams</h3>
            <p className="text-muted-foreground mb-8 px-4">
              Be the first to go live and start streaming!
            </p>
            <Link to="/go-live">
              <Button variant="premium" size="lg" className="gap-2">
                <Radio className="h-5 w-5" />
                Start Streaming
              </Button>
            </Link>
          </motion.div>
        )}
      </section>

      {/* Browse by Category - Only show if no trending */}
      {games.length > 0 && !trendingGames.length && (
        <section className="container px-4 py-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl md:text-2xl font-semibold">Browse Activities</h2>
            </div>
            <Link to="/games">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View All
              </Button>
            </Link>
          </motion.div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {games.slice(0, 8).map((game, index) => (
              <motion.div 
                key={game.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-[160px] md:w-[180px]"
              >
                <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Footer - Minimal */}
      <footer className="border-t border-border/20 mt-10">
        <div className="container px-4 py-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Play className="h-3.5 w-3.5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-display text-lg font-bold">Vyve</span>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Built on Base • Powered by Livepeer
            </p>
            
            <div className="flex items-center gap-6">
              <button className="text-muted-foreground hover:text-foreground transition-colors text-xs">
                Terms
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors text-xs">
                Privacy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
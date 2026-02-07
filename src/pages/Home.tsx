import { motion } from 'framer-motion';
import Header from '@/components/Header';
import TrendingGamesWidget from '@/components/TrendingGamesWidget';
import RecentlyPlayedGames from '@/components/RecentlyPlayedGames';
import UpcomingStreamsWidget from '@/components/UpcomingStreamsWidget';
import HeroStatsBanner from '@/components/home/HeroStatsBanner';
import PopularStreamsSection from '@/components/home/PopularStreamsSection';
import TrendingGamesSection from '@/components/home/TrendingGamesSection';
import LiveStreamsGrid from '@/components/home/LiveStreamsGrid';
import MobileWidgetsSection from '@/components/home/MobileWidgetsSection';
import HomeFooter from '@/components/home/HomeFooter';
import FloatingNotifications from '@/components/FloatingNotifications';
import { useLiveStreams } from '@/hooks/useStreams';
import { useGames, useLiveStreamCountByGame } from '@/hooks/useGames';
import { useWalletAuth } from '@/hooks/useWalletAuth';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }
  },
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
    <motion.div 
      className="min-h-screen bg-background"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      <Header />
      <div className="h-14 md:h-16" />
      
      <HeroStatsBanner liveCount={liveStreams.length} viewerCount={totalViewers} />

      <div className="container px-4">
        <PopularStreamsSection streams={popularStreams} />
        <TrendingGamesSection games={trendingGames} liveCountByGame={liveCountByGame} />

        {/* Main Content with Sidebar */}
        <div className="py-5 md:py-8 border-t border-border/10">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <LiveStreamsGrid streams={liveStreams} isLoading={isLoading} />

            {/* Sidebar - Desktop Only */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <motion.div 
                className="sticky top-20 space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <TrendingGamesWidget />
                {authenticated && <RecentlyPlayedGames />}
                <UpcomingStreamsWidget />
              </motion.div>
            </aside>
          </div>
          
          <MobileWidgetsSection authenticated={authenticated} />
        </div>

        {/* Browse by Category - Only show if no trending */}
        {games.length > 0 && !trendingGames.length && (
          <TrendingGamesSection 
            games={games.slice(0, 10)} 
            liveCountByGame={liveCountByGame} 
          />
        )}
      </div>

      <HomeFooter />
      
      {/* Floating Notifications */}
      {authenticated && <FloatingNotifications />}
    </motion.div>
  );
};

export default Home;

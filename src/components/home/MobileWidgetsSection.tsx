import { motion } from 'framer-motion';
import TrendingGamesWidget from '@/components/TrendingGamesWidget';
import RecentlyPlayedGames from '@/components/RecentlyPlayedGames';
import UpcomingStreamsWidget from '@/components/UpcomingStreamsWidget';

interface MobileWidgetsSectionProps {
  authenticated: boolean;
}

export default function MobileWidgetsSection({ authenticated }: MobileWidgetsSectionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="lg:hidden py-4 border-t border-border/10 space-y-3"
    >
      <UpcomingStreamsWidget />
      <TrendingGamesWidget />
      {authenticated && <RecentlyPlayedGames />}
    </motion.div>
  );
}

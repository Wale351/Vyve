import TrendingGamesWidget from '@/components/TrendingGamesWidget';
import RecentlyPlayedGames from '@/components/RecentlyPlayedGames';
import UpcomingStreamsWidget from '@/components/UpcomingStreamsWidget';

interface MobileWidgetsSectionProps {
  authenticated: boolean;
}

export default function MobileWidgetsSection({ authenticated }: MobileWidgetsSectionProps) {
  return (
    <div className="lg:hidden py-4 border-t border-border/10 space-y-3">
      <UpcomingStreamsWidget />
      <TrendingGamesWidget />
      {authenticated && <RecentlyPlayedGames />}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Gamepad2 } from 'lucide-react';
import { useGames, useLiveStreamCountByGame } from '@/hooks/useGames';

const TrendingGamesWidget = () => {
  const { data: games = [] } = useGames();
  const { data: liveCountByGame = {} } = useLiveStreamCountByGame();

  // Get top 5 games by live stream count
  const trendingGames = games
    .map(game => ({
      ...game,
      liveCount: liveCountByGame[game.id] || 0
    }))
    .sort((a, b) => b.liveCount - a.liveCount)
    .slice(0, 5);

  if (trendingGames.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 rounded-2xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-sm">Trending Games</h3>
      </div>

      <div className="space-y-2">
        {trendingGames.map((game, index) => (
          <Link
            key={game.id}
            to={`/games/${game.slug}`}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            {/* Rank */}
            <span className="w-5 text-center text-xs font-bold text-muted-foreground">
              {index + 1}
            </span>

            {/* Thumbnail */}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0">
              {game.thumbnail_url ? (
                <img
                  src={game.thumbnail_url}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {game.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {game.liveCount > 0 ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    {game.liveCount} live
                  </span>
                ) : (
                  game.category
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        to="/games"
        className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-3 pt-3 border-t border-border/30"
      >
        View all games →
      </Link>
    </motion.div>
  );
};

export default TrendingGamesWidget;

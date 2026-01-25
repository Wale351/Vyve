import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useRecentlyPlayedGames } from '@/hooks/useViewingHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function RecentlyPlayedGames() {
  const { data: games, isLoading } = useRecentlyPlayedGames(5);
  
  if (isLoading) {
    return (
      <div className="bg-card/50 rounded-2xl border border-border/30 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Recently Watched</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-12 h-16 rounded-lg" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!games?.length) {
    return null;
  }
  
  return (
    <div className="bg-card/50 rounded-2xl border border-border/30 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Recently Watched</h3>
      </div>
      
      <div className="space-y-2">
        {games.map(game => (
          <Link
            key={game.game_id}
            to={`/games/${game.game_slug}`}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="w-10 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {game.game_thumbnail ? (
                <img
                  src={game.game_thumbnail}
                  alt={game.game_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                  {game.game_name.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {game.game_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(game.last_watched), { addSuffix: true })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

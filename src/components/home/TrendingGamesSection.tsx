import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import GameCard from '@/components/GameCard';
import type { Game } from '@/hooks/useGames';

interface TrendingGamesSectionProps {
  games: Game[];
  liveCountByGame: Record<string, number>;
}

export default function TrendingGamesSection({ games, liveCountByGame }: TrendingGamesSectionProps) {
  if (games.length === 0) return null;

  return (
    <section className="py-4 md:py-6 border-t border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Trending</h2>
        </div>
        <Link to="/games">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            View All
          </Button>
        </Link>
      </div>
      
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
        {games.map((game) => (
          <div key={game.id} className="flex-shrink-0 w-[120px] md:w-[140px] snap-start">
            <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
          </div>
        ))}
      </div>
    </section>
  );
}

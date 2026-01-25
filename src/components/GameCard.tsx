import { Link } from 'react-router-dom';
import { Game } from '@/hooks/useGames';
import { Radio } from 'lucide-react';

interface GameCardProps {
  game: Game;
  liveCount?: number;
  compact?: boolean;
}

const GameCard = ({ game, liveCount = 0, compact = false }: GameCardProps) => {
  const isLive = liveCount > 0;

  if (compact) {
    return (
      <Link to={`/games/${game.slug}`} className="block group">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
          {game.thumbnail_url ? (
            <img 
              src={game.thumbnail_url} 
              alt={game.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
          
          {isLive && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground text-[10px] font-medium">
              <Radio className="h-2.5 w-2.5" />
              {liveCount}
            </div>
          )}
        </div>
        <p className="font-medium text-xs mt-2 truncate group-hover:text-primary transition-colors">
          {game.name}
        </p>
      </Link>
    );
  }

  return (
    <Link to={`/games/${game.slug}`} className="block group">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border/30">
        {game.thumbnail_url ? (
          <img 
            src={game.thumbnail_url} 
            alt={game.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary/30">{game.name.charAt(0)}</span>
          </div>
        )}
        
        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm border border-border/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
            </span>
            <span className="text-xs font-medium">{liveCount} live</span>
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute bottom-2 left-2 right-2">
          <span className="inline-block px-2 py-0.5 rounded bg-background/80 backdrop-blur-sm text-[10px] text-muted-foreground">
            {game.category}
          </span>
        </div>
      </div>
      
      <div className="mt-3">
        <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
          {game.name}
        </h3>
      </div>
    </Link>
  );
};

export default GameCard;
import { Link } from 'react-router-dom';
import { Game } from '@/hooks/useGames';
import { Gamepad2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GameCardProps {
  game: Game;
  liveCount?: number;
}

const GameCard = ({ game, liveCount = 0 }: GameCardProps) => {
  return (
    <Link 
      to={`/games/${game.slug}`}
      className="group block"
    >
      <div className="glass-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/30">
        {/* Thumbnail */}
        <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 relative overflow-hidden">
          {game.thumbnail_url ? (
            <img 
              src={game.thumbnail_url} 
              alt={game.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Gamepad2 className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Live count overlay */}
          {liveCount > 0 && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-destructive/90 text-destructive-foreground text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {liveCount} Live
              </div>
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {game.category}
            </Badge>
          </div>
        </div>
        
        {/* Info */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
            {game.name}
          </h3>
          {game.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {game.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GameCard;

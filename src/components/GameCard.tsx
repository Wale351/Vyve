import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Game } from '@/hooks/useGames';
import { Gamepad2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GameCardProps {
  game: Game;
  liveCount?: number;
}

const GameCard = ({ game, liveCount = 0 }: GameCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Link 
        to={`/games/${game.slug}`}
        className="group block"
      >
        <div className="rounded-lg overflow-hidden border border-border/30 bg-card hover:border-border transition-colors">
          <div className="aspect-[3/4] bg-muted relative overflow-hidden">
            {game.thumbnail_url ? (
              <img 
                src={game.thumbnail_url} 
                alt={game.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Gamepad2 className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            
            {liveCount > 0 && (
              <div className="absolute top-2 left-2">
                <div className="live-badge flex items-center gap-1 text-[10px]">
                  <span className="w-1 h-1 rounded-full bg-current animate-pulse-subtle" />
                  {liveCount} Live
                </div>
              </div>
            )}
            
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-[10px] bg-card/80 backdrop-blur-sm border border-border/30">
                {game.category}
              </Badge>
            </div>
          </div>
          
          <div className="p-3">
            <h3 className="font-medium text-sm group-hover:text-foreground/80 transition-colors line-clamp-1">
              {game.name}
            </h3>
            {game.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {game.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default GameCard;

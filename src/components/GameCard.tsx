import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Game } from '@/hooks/useGames';
import { Gamepad2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';

interface GameCardProps {
  game: Game;
  liveCount?: number;
}

const GameCard = ({ game, liveCount = 0 }: GameCardProps) => {
  const isTouch = useIsTouchDevice();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={isTouch ? undefined : { y: -6, scale: 1.02 }}
    >
      <Link 
        to={`/games/${game.slug}`}
        className="group block"
      >
        <div className="card-premium overflow-hidden">
          {/* Thumbnail */}
          <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden">
            {game.thumbnail_url ? (
              isTouch ? (
                <img 
                  src={game.thumbnail_url} 
                  alt={game.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <motion.img 
                  src={game.thumbnail_url} 
                  alt={game.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Gamepad2 className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Live count overlay */}
            {liveCount > 0 && (
              <div className="absolute top-3 left-3">
                <div className="live-badge flex items-center gap-1.5 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-subtle" />
                  {liveCount} Live
                </div>
              </div>
            )}
            
            {/* Category badge */}
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="glass-subtle">
                {game.category}
              </Badge>
            </div>
          </div>
          
          {/* Info */}
          <div className="p-3 md:p-4">
            <h3 className="font-display font-semibold text-sm md:text-lg group-hover:text-primary transition-colors line-clamp-1">
              {game.name}
            </h3>
            {game.description && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
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

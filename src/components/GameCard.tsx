import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Game } from '@/hooks/useGames';
import { Gamepad2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GameCardProps {
  game: Game;
  liveCount?: number;
}

const GameCard = ({ game, liveCount = 0 }: GameCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      <Link 
        to={`/games/${game.slug}`}
        className="group block"
      >
        <div className="card-premium overflow-hidden hover:border-primary/30">
          {/* Thumbnail */}
          <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden">
            {game.thumbnail_url ? (
              <motion.img 
                src={game.thumbnail_url} 
                alt={game.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Gamepad2 className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Live count overlay with glow */}
            {liveCount > 0 && (
              <motion.div 
                className="absolute top-3 left-3"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="live-badge flex items-center gap-1.5 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-subtle" />
                  {liveCount} Live
                </div>
              </motion.div>
            )}
            
            {/* Category badge */}
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="glass-subtle">
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
    </motion.div>
  );
};

export default GameCard;

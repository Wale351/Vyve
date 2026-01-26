import { motion } from 'framer-motion';
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
    <section className="py-4 md:py-6 border-t border-border/10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-3 md:mb-4"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg md:text-xl font-semibold">Trending</h2>
            <p className="text-[11px] md:text-xs text-muted-foreground">Popular games right now</p>
          </div>
        </div>
        <Link to="/games">
          <Button variant="ghost" size="sm" className="text-xs md:text-sm text-muted-foreground hover:text-foreground">
            View All
          </Button>
        </Link>
      </motion.div>
      
      <div className="flex gap-2.5 md:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {games.map((game, index) => (
          <motion.div 
            key={game.id} 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex-shrink-0 w-[120px] md:w-[150px]"
          >
            <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

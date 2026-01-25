import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react';
import { useFeaturedGames } from '@/hooks/useFeaturedGames';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function FeaturedGamesCarousel() {
  const { data: games = [] } = useFeaturedGames();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    if (games.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % games.length);
  }, [games.length]);

  const goToPrev = useCallback(() => {
    if (games.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
  }, [games.length]);

  // Auto-rotate
  useEffect(() => {
    if (isPaused || games.length === 0) return;
    const interval = setInterval(goToNext, 4000);
    return () => clearInterval(interval);
  }, [goToNext, isPaused, games.length]);

  if (games.length === 0) return null;

  const currentGame = games[currentIndex];

  return (
    <section 
      className="py-24 md:py-32 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
            Top Web3 Games
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-foreground">FEATURED</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">GAMES</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Stream the biggest titles in Web3 gaming
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-md mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrev}
            className="absolute left-0 md:-left-20 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border border-border/50 bg-background/80 backdrop-blur-sm hover:bg-card"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 md:-right-20 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border border-border/50 bg-background/80 backdrop-blur-sm hover:bg-card"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Game Card */}
          <Link to={`/games/${currentGame?.slug}`}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-primary/30 bg-card group cursor-pointer"
            >
              {currentGame?.thumbnail_url ? (
                <img
                  src={currentGame.thumbnail_url}
                  alt={currentGame.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Gamepad2 className="h-20 w-20 text-muted-foreground" />
                </div>
              )}
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              {/* Game name */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <h3 className="font-display text-2xl font-bold text-primary">
                  {currentGame?.name}
                </h3>
              </div>
            </motion.div>
          </Link>

          {/* "Now Featuring" label */}
          <p className="text-center text-muted-foreground text-sm mt-4">Now Featuring</p>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {games.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-6 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

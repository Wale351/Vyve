import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeaturedGames } from '@/hooks/useFeaturedGames';

export default function FeaturedGamesSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const { data: featuredGames = [], isLoading } = useFeaturedGames();

  useEffect(() => {
    if (!featuredGames.length || isPaused) return;
    const id = setInterval(() => setActiveIndex((p) => (p + 1) % featuredGames.length), 4000);
    return () => clearInterval(id);
  }, [isPaused, featuredGames.length]);

  if (isLoading) {
    return (
      <section ref={ref} className="py-20 md:py-32">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (!featuredGames.length) return null;
  const activeGame = featuredGames[activeIndex];

  return (
    <section ref={ref} className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Games</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Featured Games</h2>
          <p className="text-muted-foreground">Stream the biggest titles in Web3 gaming</p>
        </motion.div>

        <div
          className="relative max-w-sm mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveIndex((p) => (p - 1 + featuredGames.length) % featuredGames.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card border border-border"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveIndex((p) => (p + 1) % featuredGames.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card border border-border"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeGame.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center py-6"
            >
              <Link to={`/games/${activeGame.slug}`}>
                <div className="w-[180px] h-[250px] md:w-[200px] md:h-[280px] rounded-lg overflow-hidden border border-border bg-card">
                  {imageErrors.has(activeGame.slug) || !activeGame.thumbnail_url ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-3xl font-bold text-muted-foreground">{activeGame.name.charAt(0)}</span>
                    </div>
                  ) : (
                    <img
                      src={activeGame.thumbnail_url}
                      alt={activeGame.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => setImageErrors((p) => new Set(p).add(activeGame.slug))}
                    />
                  )}
                </div>
                <p className="mt-4 font-semibold text-center">{activeGame.name}</p>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-1.5 mt-4">
          {featuredGames.map((game, index) => (
            <button
              key={game.slug}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                index === activeIndex ? 'w-6 bg-foreground' : 'w-1.5 bg-muted-foreground/30'
              }`}
              aria-label={`View ${game.name}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-center mt-8">
          <Link to="/games" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all games →
          </Link>
        </div>
      </div>
    </section>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiDiscord } from 'react-icons/si';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeaturedGames } from '@/hooks/useFeaturedGames';

// Fixed brand colors for landing page
const BRAND_PRIMARY = 'hsl(175, 85%, 45%)';
const BRAND_SECONDARY = 'hsl(15, 75%, 55%)';

export default function FeaturedGamesSection() {
  const ref = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const { data: featuredGames = [], isLoading } = useFeaturedGames();

  // Auto-rotate through games every 4 seconds
  useEffect(() => {
    if (!featuredGames.length) return;
    
    const interval = setInterval(() => {
      if (!isPaused) {
        setActiveIndex((prev) => (prev + 1) % featuredGames.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, featuredGames.length]);

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % featuredGames.length);
  };

  const handleImageError = (slug: string) => {
    setImageErrors(prev => new Set(prev).add(slug));
  };

  if (isLoading) {
    return (
      <section ref={ref} className="py-20 md:py-32 relative overflow-hidden">
        <div className="container relative mx-auto px-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_PRIMARY }} />
        </div>
      </section>
    );
  }

  if (!featuredGames.length) return null;

  const activeGame = featuredGames[activeIndex];

  return (
    <section ref={ref} className="py-20 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            opacity: [0.2, 0.35, 0.2],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${BRAND_PRIMARY.replace(')', ' / 0.1)')}` }}
        />
        <motion.div
          animate={{ 
            opacity: [0.15, 0.3, 0.15],
            scale: [1.08, 1, 1.08],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${BRAND_SECONDARY.replace(')', ' / 0.1)')}` }}
        />
      </div>

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: `${BRAND_SECONDARY.replace(')', ' / 0.2)')}`,
              border: `1px solid ${BRAND_SECONDARY.replace(')', ' / 0.3)')}`,
              color: BRAND_SECONDARY,
            }}
          >
            Top Web3 Games
          </motion.span>
          
          <h2 className="font-varsity text-4xl md:text-5xl lg:text-7xl tracking-wider mb-4">
            FEATURED
            <span 
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${BRAND_PRIMARY}, ${BRAND_SECONDARY}, ${BRAND_PRIMARY})` }}
            >
              GAMES
            </span>
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stream the biggest titles in Web3 gaming
          </p>
        </motion.div>

        {/* Centered Spotlight Carousel */}
        <div
          className="relative max-w-2xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Featured Game Spotlight */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGame.slug}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center py-8"
            >
              <Link to={`/games/${activeGame.slug}`} className="group">
                {/* Main spotlight card */}
                <div className="relative w-[200px] h-[280px] md:w-[220px] md:h-[300px] rounded-2xl overflow-hidden">
                  {/* Glow effect */}
                  <div 
                    className="absolute -inset-4 rounded-3xl blur-2xl opacity-50"
                    style={{ background: `linear-gradient(to right, ${BRAND_PRIMARY.replace(')', ' / 0.4)')}, ${BRAND_SECONDARY.replace(')', ' / 0.4)')}, ${BRAND_PRIMARY.replace(')', ' / 0.4)')})` }}
                  />
                  
                  {/* Card with game box art */}
                  <div 
                    className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                    style={{ 
                      border: `2px solid ${BRAND_PRIMARY.replace(')', ' / 0.5)')}`,
                      boxShadow: `0 25px 50px -12px ${BRAND_PRIMARY.replace(')', ' / 0.3)')}`,
                    }}
                  >
                    {imageErrors.has(activeGame.slug) || !activeGame.thumbnail_url ? (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(to bottom right, ${BRAND_PRIMARY.replace(')', ' / 0.2)')}, hsl(var(--card)), ${BRAND_SECONDARY.replace(')', ' / 0.2)')})` }}
                      >
                        <span className="text-4xl font-bold text-foreground">
                          {activeGame.name.charAt(0)}
                        </span>
                      </div>
                    ) : (
                      <motion.img
                        src={activeGame.thumbnail_url}
                        alt={activeGame.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(activeGame.slug)}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    )}
                    
                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
                      <p className="font-display font-bold text-lg md:text-xl text-center" style={{ color: BRAND_PRIMARY }}>
                        {activeGame.name}
                      </p>
                    </div>

                    {/* Hover effect */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: `${BRAND_PRIMARY.replace(')', ' / 0.1)')}` }}
                    />
                  </div>
                </div>
              </Link>

              {/* Now Featuring label */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mt-6 text-muted-foreground text-sm"
              >
                Now Featuring
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center gap-2 mt-4">
          {featuredGames.map((game, index) => (
            <button
              key={game.slug}
              onClick={() => setActiveIndex(index)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: index === activeIndex ? '32px' : '8px',
                backgroundColor: index === activeIndex ? BRAND_PRIMARY : 'hsl(var(--muted-foreground) / 0.3)',
              }}
              aria-label={`View ${game.name}`}
            />
          ))}
        </div>

        {/* View all link with Discord */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10"
        >
          <Link 
            to="/games" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
          >
            <span>View all games</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </Link>
          
          <a
            href="https://discord.gg/vyve"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2]/30 transition-colors duration-200"
          >
            <SiDiscord className="w-5 h-5" />
            <span>Join Discord</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

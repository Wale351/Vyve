import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiDiscord } from 'react-icons/si';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeaturedGames } from '@/hooks/useFeaturedGames';

const BRAND_PRIMARY = 'hsl(175, 85%, 45%)';
const BRAND_SECONDARY = 'hsl(15, 75%, 55%)';

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
      <div className="container relative mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <span
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: `${BRAND_SECONDARY.replace(')', ' / 0.2)')}`,
              border: `1px solid ${BRAND_SECONDARY.replace(')', ' / 0.3)')}`,
              color: BRAND_SECONDARY,
            }}
          >
            Top Web3 Games
          </span>
          <h2 className="font-varsity text-4xl md:text-5xl lg:text-7xl tracking-wider mb-4">
            FEATURED
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${BRAND_PRIMARY}, ${BRAND_SECONDARY}, ${BRAND_PRIMARY})` }}
            >
              GAMES
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Stream the biggest titles in Web3 gaming</p>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative max-w-2xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveIndex((p) => (p - 1 + featuredGames.length) % featuredGames.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveIndex((p) => (p + 1) % featuredGames.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeGame.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col items-center py-8"
            >
              <Link to={`/games/${activeGame.slug}`} className="group">
                <div className="relative w-[200px] h-[280px] md:w-[220px] md:h-[300px] rounded-2xl overflow-hidden">
                  <div
                    className="absolute -inset-4 rounded-3xl blur-2xl opacity-50"
                    style={{
                      background: `linear-gradient(to right, ${BRAND_PRIMARY.replace(')', ' / 0.4)')}, ${BRAND_SECONDARY.replace(')', ' / 0.4)')}, ${BRAND_PRIMARY.replace(')', ' / 0.4)')})`,
                    }}
                  />
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
                        style={{
                          background: `linear-gradient(to bottom right, ${BRAND_PRIMARY.replace(')', ' / 0.2)')}, hsl(var(--card)), ${BRAND_SECONDARY.replace(')', ' / 0.2)')})`,
                        }}
                      >
                        <span className="text-4xl font-bold text-foreground">{activeGame.name.charAt(0)}</span>
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
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
                      <p className="font-display font-bold text-lg md:text-xl text-center" style={{ color: BRAND_PRIMARY }}>
                        {activeGame.name}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
              <p className="mt-6 text-muted-foreground text-sm">Now Featuring</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
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

        {/* Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
          <Link to="/games" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <span>View all games</span>
            <span>→</span>
          </Link>
          <a
            href="https://discord.gg/vyve"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2]/30 transition-colors"
          >
            <SiDiscord className="w-5 h-5" />
            <span>Join Discord</span>
          </a>
        </div>
      </div>
    </section>
  );
}

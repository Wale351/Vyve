import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiDiscord } from 'react-icons/si';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const featuredGames = [
  { 
    name: 'Off The Grid', 
    image: 'https://pbs.twimg.com/profile_images/1879581706081808384/bKWtDa8c_400x400.jpg',
    slug: 'off-the-grid' 
  },
  { 
    name: 'Nyan Heroes', 
    image: 'https://pbs.twimg.com/profile_images/1871953009287692288/IB3q7bOB_400x400.jpg',
    slug: 'nyan-heroes' 
  },
  { 
    name: 'Pixels', 
    image: 'https://pbs.twimg.com/profile_images/1875991406251913216/jYBjqjpM_400x400.jpg',
    slug: 'pixels' 
  },
  { 
    name: 'Super Champs', 
    image: 'https://pbs.twimg.com/profile_images/1879499377829347328/mIujJY97_400x400.jpg',
    slug: 'super-champs' 
  },
  { 
    name: 'Illuvium', 
    image: 'https://pbs.twimg.com/profile_images/1815339498290765824/0Hn4DUYM_400x400.jpg',
    slug: 'illuvium' 
  },
  { 
    name: 'Shrapnel', 
    image: 'https://pbs.twimg.com/profile_images/1842982149071675392/cMYK2vnN_400x400.jpg',
    slug: 'shrapnel' 
  },
  { 
    name: 'MapleStory Universe', 
    image: 'https://pbs.twimg.com/profile_images/1775102908817162240/OLKxpLmj_400x400.jpg',
    slug: 'maplestory-universe' 
  },
  { 
    name: 'Star Atlas', 
    image: 'https://pbs.twimg.com/profile_images/1850222768160608256/e-OMlGOe_400x400.jpg',
    slug: 'star-atlas' 
  },
  { 
    name: 'Deadrop', 
    image: 'https://pbs.twimg.com/profile_images/1739051295128145920/A1DUxzTp_400x400.jpg',
    slug: 'deadrop' 
  },
  { 
    name: 'Alien Worlds', 
    image: 'https://pbs.twimg.com/profile_images/1645015820651130880/xqh93e0d_400x400.jpg',
    slug: 'alien-worlds' 
  },
];

export default function FeaturedGamesSection() {
  const ref = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Auto-rotate through games every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setActiveIndex((prev) => (prev + 1) % featuredGames.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % featuredGames.length);
  };

  const handleImageError = (slug: string) => {
    setImageErrors(prev => new Set(prev).add(slug));
  };

  const activeGame = featuredGames[activeIndex];

  return (
    <section ref={ref} className="py-20 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-sm font-medium mb-6"
          >
            Top Web3 Games
          </motion.span>
          
          <h2 className="font-varsity text-4xl md:text-5xl lg:text-7xl tracking-wider mb-4">
            FEATURED
            <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
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
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-primary/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-primary/20"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Featured Game Spotlight */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGame.slug}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center py-8"
            >
              <Link to={`/games/${activeGame.slug}`} className="group">
                {/* Main spotlight card */}
                <div className="relative w-[200px] h-[250px] md:w-[280px] md:h-[350px] rounded-3xl overflow-hidden">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-3xl blur-2xl opacity-60" />
                  
                  {/* Card background */}
                  <div className="relative w-full h-full bg-gradient-to-br from-primary/20 via-card to-secondary/20 border-2 border-primary/50 rounded-3xl overflow-hidden shadow-2xl shadow-primary/30">
                    {/* Game logo */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      {imageErrors.has(activeGame.slug) ? (
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-primary/30 flex items-center justify-center text-4xl md:text-5xl font-bold text-foreground backdrop-blur-sm">
                          {activeGame.name.charAt(0)}
                        </div>
                      ) : (
                        <motion.img
                          src={activeGame.image}
                          alt={activeGame.name}
                          className="w-28 h-28 md:w-36 md:h-36 object-cover rounded-3xl shadow-2xl ring-2 ring-primary/50"
                          onError={() => handleImageError(activeGame.slug)}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </div>
                    
                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent">
                      <p className="font-display font-bold text-xl md:text-2xl text-center text-primary">
                        {activeGame.name}
                      </p>
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </Link>

              {/* Now Featuring label */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-primary w-8' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`View ${game.name}`}
            />
          ))}
        </div>

        {/* View all link with Discord */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10"
        >
          <Link 
            to="/games" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>View all games</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
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
        </motion.div>
      </div>
    </section>
  );
}
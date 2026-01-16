import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiDiscord } from 'react-icons/si';

const featuredGames = [
  { 
    name: 'Super Champs', 
    image: 'https://pbs.twimg.com/profile_images/1793295428961320960/h2-fANHd_400x400.jpg',
    slug: 'super-champs' 
  },
  { 
    name: 'Medieval Empires', 
    image: 'https://pbs.twimg.com/profile_images/1754167049775755264/xKx0hLLb_400x400.jpg',
    slug: 'medieval-empires' 
  },
  { 
    name: 'Pixels', 
    image: 'https://pbs.twimg.com/profile_images/1753118455371038720/Wv2VqBaL_400x400.jpg',
    slug: 'pixels' 
  },
  { 
    name: 'DeFi Kingdoms', 
    image: 'https://pbs.twimg.com/profile_images/1621648377694441475/v1HgKKzL_400x400.jpg',
    slug: 'defi-kingdoms' 
  },
  { 
    name: 'Decimated', 
    image: 'https://pbs.twimg.com/profile_images/1733119188011180032/nkJvwi_K_400x400.jpg',
    slug: 'decimated' 
  },
  { 
    name: 'Nyan Heroes', 
    image: 'https://pbs.twimg.com/profile_images/1822992447804104705/xOgVVzqB_400x400.jpg',
    slug: 'nyan-heroes' 
  },
  { 
    name: 'OFF THE GRID', 
    image: 'https://pbs.twimg.com/profile_images/1842597054251085824/0z_LRUiG_400x400.jpg',
    slug: 'off-the-grid' 
  },
  { 
    name: 'Call Of The Voyd', 
    image: 'https://pbs.twimg.com/profile_images/1866486212950437888/i0nPlHSV_400x400.jpg',
    slug: 'call-of-the-voyd' 
  },
  { 
    name: 'Wilder World', 
    image: 'https://pbs.twimg.com/profile_images/1800555777989414913/9WaQHLpq_400x400.jpg',
    slug: 'wilder-world' 
  },
  { 
    name: 'Cornucopias', 
    image: 'https://pbs.twimg.com/profile_images/1793284046534709248/H0BXSuxK_400x400.jpg',
    slug: 'cornucopias' 
  },
];

const GameCard = ({ game, isActive }: { game: typeof featuredGames[0]; isActive: boolean }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      animate={{ 
        scale: isActive ? 1.1 : 0.85,
        opacity: isActive ? 1 : 0.4,
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="flex-shrink-0"
    >
      <Link to={`/games/${game.slug}`}>
        <div className={`group relative w-[160px] h-[200px] md:w-[180px] md:h-[220px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${isActive ? 'ring-2 ring-primary shadow-2xl shadow-primary/30' : ''}`}>
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border border-border/50 transition-colors duration-300 ${isActive ? 'border-primary/70' : ''}`} />
          
          {/* Glow effect for active */}
          {isActive && (
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
              <div className="absolute -inset-2 bg-primary/20 blur-xl -z-10" />
            </motion.div>
          )}
          
          {/* Game logo */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {imageError ? (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-bold text-foreground backdrop-blur-sm">
                {game.name.charAt(0)}
              </div>
            ) : (
              <motion.img
                src={game.image}
                alt={game.name}
                className={`w-16 h-16 md:w-20 md:h-20 object-cover rounded-2xl shadow-2xl transition-all duration-500 ${isActive ? 'shadow-primary/40' : ''}`}
                onError={() => setImageError(true)}
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
          
          {/* Name */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/95 via-background/80 to-transparent">
            <p className={`font-display font-bold text-xs md:text-sm text-center truncate transition-colors ${isActive ? 'text-primary' : 'text-foreground'}`}>
              {game.name}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function FeaturedGamesSection() {
  const ref = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate through games every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setActiveIndex((prev) => (prev + 1) % featuredGames.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Scroll to active game
  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = 180; // Approximate card width + gap
      const containerWidth = scrollRef.current.clientWidth;
      const scrollPosition = (activeIndex * cardWidth) - (containerWidth / 2) + (cardWidth / 2);
      scrollRef.current.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
    }
  }, [activeIndex]);

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

        {/* Current game spotlight */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <span className="text-primary font-medium text-lg">
              Now Featuring: {featuredGames[activeIndex].name}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide py-8 px-12 -mx-4 items-center justify-start"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
          >
            {featuredGames.map((game, index) => (
              <GameCard 
                key={game.slug} 
                game={game} 
                isActive={index === activeIndex}
              />
            ))}
          </div>
        </motion.div>

        {/* Indicator dots */}
        <div className="flex justify-center gap-2 mt-6">
          {featuredGames.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
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

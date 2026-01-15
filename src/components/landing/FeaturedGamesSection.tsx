import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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

const GameCard = ({ game, index }: { game: typeof featuredGames[0]; index: number }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex-shrink-0"
    >
      <Link to={`/games/${game.slug}`}>
        <div className="group relative w-[180px] h-[220px] md:w-[200px] md:h-[240px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border border-border/50 group-hover:border-primary/50 transition-colors duration-300" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
            <div className="absolute -inset-1 bg-primary/20 blur-xl -z-10" />
          </div>
          
          {/* Game logo */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {imageError ? (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl font-bold text-foreground backdrop-blur-sm">
                {game.name.charAt(0)}
              </div>
            ) : (
              <motion.img
                src={game.image}
                alt={game.name}
                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl shadow-2xl group-hover:shadow-primary/30 transition-all duration-500"
                onError={() => setImageError(true)}
                whileHover={{ scale: 1.1, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            )}
          </div>
          
          {/* Name */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 via-background/80 to-transparent">
            <p className="font-display font-bold text-sm text-center text-foreground truncate">
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
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll with 3 second intervals
  useEffect(() => {
    if (!isInView) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current && !isPaused) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // Reset when reaching end
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isInView, isPaused]);

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
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
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

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide py-4 px-8 -mx-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
          >
            {/* Duplicate games for infinite scroll effect */}
            {[...featuredGames, ...featuredGames].map((game, index) => (
              <GameCard 
                key={`${game.slug}-${index}`} 
                game={game} 
                index={index % featuredGames.length} 
              />
            ))}
          </div>
        </motion.div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-10"
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
        </motion.div>
      </div>
    </section>
  );
}

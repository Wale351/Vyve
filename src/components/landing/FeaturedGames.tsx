import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

const games = [
  { name: 'Super Champs', slug: 'super-champs', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop' },
  { name: 'Medieval Empires', slug: 'medieval-empires', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop' },
  { name: 'Pixels', slug: 'pixels', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop' },
  { name: 'DeFi Kingdoms', slug: 'defi-kingdoms', image: 'https://images.unsplash.com/photo-1614850715649-1d0106293bd1?w=400&h=300&fit=crop' },
  { name: 'Decimated', slug: 'decimated', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=400&h=300&fit=crop' },
  { name: 'Nyan Heroes', slug: 'nyan-heroes', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop' },
  { name: 'OFF THE GRID', slug: 'off-the-grid', image: 'https://images.unsplash.com/photo-1493711662062-fa541f7f897a?w=400&h=300&fit=crop' },
  { name: 'Call Of The Voyd', slug: 'call-of-the-voyd', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&h=300&fit=crop' },
  { name: 'Wilder World', slug: 'wilder-world', image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=400&h=300&fit=crop' },
  { name: 'Cornucopias', slug: 'cornucopias', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop' },
];

export default function FeaturedGames() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-transparent to-transparent" />
      
      <div className="container relative mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="text-primary font-medium text-sm tracking-widest uppercase mb-2"
            >
              Featured
            </motion.p>
            <h2 className="font-varsity text-4xl md:text-5xl lg:text-6xl tracking-wider text-foreground">
              GAMES & CATEGORIES
            </h2>
          </div>
          
          <Link 
            to="/games"
            className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium group"
          >
            View all
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="group-hover:translate-x-1 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </motion.svg>
          </Link>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {games.map((game, i) => (
            <motion.div
              key={game.slug}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ 
                delay: 0.05 * i + 0.2, 
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <Link 
                to={`/games/${game.slug}`}
                className="group block relative aspect-[4/5] rounded-2xl overflow-hidden"
              >
                {/* Image */}
                <div className="absolute inset-0 bg-muted">
                  <img 
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Hover Border Effect */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/50 transition-colors duration-300"
                />
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display font-semibold text-foreground text-sm md:text-base leading-tight group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                  
                  {/* Live indicator (decorative) */}
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    <span className="text-xs text-muted-foreground">Live streams</span>
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="md:hidden mt-8 text-center"
        >
          <Link 
            to="/games"
            className="inline-flex items-center gap-2 text-primary font-medium"
          >
            View all games
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

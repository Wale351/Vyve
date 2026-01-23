import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState, forwardRef } from 'react';

const featuredGames = [
  { name: 'Off The Grid', image: 'https://pbs.twimg.com/profile_images/1879581706081808384/bKWtDa8c_400x400.jpg', slug: 'off-the-grid' },
  { name: 'Nyan Heroes', image: 'https://pbs.twimg.com/profile_images/1871953009287692288/IB3q7bOB_400x400.jpg', slug: 'nyan-heroes' },
  { name: 'Pixels', image: 'https://pbs.twimg.com/profile_images/1875991406251913216/jYBjqjpM_400x400.jpg', slug: 'pixels' },
  { name: 'Super Champs', image: 'https://pbs.twimg.com/profile_images/1879499377829347328/mIujJY97_400x400.jpg', slug: 'super-champs' },
  { name: 'Illuvium', image: 'https://pbs.twimg.com/profile_images/1815339498290765824/0Hn4DUYM_400x400.jpg', slug: 'illuvium' },
  { name: 'Shrapnel', image: 'https://pbs.twimg.com/profile_images/1842982149071675392/cMYK2vnN_400x400.jpg', slug: 'shrapnel' },
  { name: 'Star Atlas', image: 'https://pbs.twimg.com/profile_images/1850222768160608256/e-OMlGOe_400x400.jpg', slug: 'star-atlas' },
  { name: 'Deadrop', image: 'https://pbs.twimg.com/profile_images/1739051295128145920/A1DUxzTp_400x400.jpg', slug: 'deadrop' },
  { name: 'Alien Worlds', image: 'https://pbs.twimg.com/profile_images/1645015820651130880/xqh93e0d_400x400.jpg', slug: 'alien-worlds' },
  { name: 'MapleStory Universe', image: 'https://pbs.twimg.com/profile_images/1775102908817162240/OLKxpLmj_400x400.jpg', slug: 'maplestory-universe' },
  { name: 'Gods Unchained', image: 'https://pbs.twimg.com/profile_images/1805609124434288640/LThq0YHw_400x400.jpg', slug: 'gods-unchained' },
  { name: 'Axie Infinity', image: 'https://pbs.twimg.com/profile_images/1848653795229253632/L4S-RVB4_400x400.jpg', slug: 'axie-infinity' },
  { name: 'The Sandbox', image: 'https://pbs.twimg.com/profile_images/1636003858910834689/3xP9GMnq_400x400.jpg', slug: 'the-sandbox' },
  { name: 'Big Time', image: 'https://pbs.twimg.com/profile_images/1721225665399873536/8b-s1kJh_400x400.jpg', slug: 'big-time' },
  { name: 'Parallel', image: 'https://pbs.twimg.com/profile_images/1836053251578916867/6ZUYbU15_400x400.jpg', slug: 'parallel' },
];

type GameCardProps = {
  game: { name: string; image: string; slug: string };
  index: number;
};

const GameCard = ({ game, index }: GameCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      className="game-card group flex-shrink-0 w-[200px] md:w-[240px] aspect-square rounded-2xl overflow-hidden relative cursor-pointer snap-start" 
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Gradient background for Web3 gaming aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
      
      {/* Logo centered */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        {imageError ? (
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary/30 flex items-center justify-center text-4xl font-bold text-foreground">
            {game.name.charAt(0)}
          </div>
        ) : (
          <img 
            src={game.image} 
            alt={game.name} 
            className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" 
            onError={() => setImageError(true)}
          />
        )}
      </div>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
      
      {/* Name overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 to-transparent">
        <h3 className="font-display font-bold text-sm md:text-base text-foreground drop-shadow-lg text-center">
          {game.name}
        </h3>
      </div>
    </div>
  );
};

const FeaturedGamesCarousel = forwardRef<HTMLElement, Record<string, never>>(function FeaturedGamesCarousel(_props, ref) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll functionality
  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        if (scrollRef.current && !isPaused) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

          // Reset to start when reaching the end
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
          }
        }
      }, 3000);
    };
    startAutoScroll();
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isPaused]);

  return (
    <section ref={ref} className="py-16 md:py-24 overflow-hidden">
      <div className="container px-4">
        <div className="flex flex-col items-center mb-8">
          <h2 className="font-varsity text-3xl md:text-4xl lg:text-6xl tracking-wide text-center mb-6">
            FEATURED GAMES
          </h2>
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-full h-10 w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-full h-10 w-10">
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </Button>
          </div>
        </div>

        <div 
          ref={scrollRef} 
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsPaused(true)} 
          onMouseLeave={() => setIsPaused(false)} 
          onTouchStart={() => setIsPaused(true)} 
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
        >
          {featuredGames.map((game, index) => (
            <GameCard key={game.slug} game={game} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default FeaturedGamesCarousel;

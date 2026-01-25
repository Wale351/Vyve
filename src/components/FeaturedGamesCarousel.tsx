import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedGames } from '@/hooks/useFeaturedGames';
import type { Game } from '@/hooks/useGames';

type GameCardProps = {
  game: Game;
  index: number;
};

const GameCard = ({ game, index }: GameCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      to={`/games/${game.slug}`}
      className="game-card group flex-shrink-0 w-[160px] md:w-[180px] aspect-[3/4] rounded-xl overflow-hidden relative cursor-pointer snap-start" 
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Game box art or fallback */}
      {imageError || !game.thumbnail_url ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/30 flex items-center justify-center text-2xl font-bold text-foreground">
              {game.name.charAt(0)}
            </div>
          </div>
        </>
      ) : (
        <img 
          src={game.thumbnail_url} 
          alt={game.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          onError={() => setImageError(true)}
        />
      )}
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
      
      {/* Name overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/95 to-transparent">
        <h3 className="font-display font-bold text-xs md:text-sm text-foreground drop-shadow-lg text-center line-clamp-2">
          {game.name}
        </h3>
      </div>
    </Link>
  );
};

const FeaturedGamesCarousel = forwardRef<HTMLElement, Record<string, never>>(function FeaturedGamesCarousel(_props, ref) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: featuredGames = [], isLoading } = useFeaturedGames();
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!featuredGames.length) return;
    
    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        if (scrollRef.current && !isPaused) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

          // Reset to start when reaching the end
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
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
  }, [isPaused, featuredGames.length]);

  if (isLoading) {
    return (
      <section ref={ref} className="py-16 md:py-24 overflow-hidden">
        <div className="container px-4 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!featuredGames.length) return null;

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

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

const featuredGames = [
  { name: 'DeFi Kingdoms', image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop', slug: 'defi-kingdoms' },
  { name: 'Medieval Empires', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', slug: 'medieval-empires' },
  { name: 'Nyan Heroes', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop', slug: 'nyan-heroes' },
  { name: 'Off The Grid', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop', slug: 'off-the-grid' },
  { name: 'Pixels', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop', slug: 'pixels' },
  { name: 'Super Champs', image: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400&h=400&fit=crop', slug: 'super-champs' },
  { name: 'Wilder Worlds', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop', slug: 'wilder-worlds' },
  { name: 'Call Of The Voyd', image: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400&h=400&fit=crop', slug: 'call-of-the-voyd' },
  { name: 'Cornucopias', image: 'https://images.unsplash.com/photo-1605979257913-1704eb7b6246?w=400&h=400&fit=crop', slug: 'cornucopias' },
  { name: 'Decimated', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=400&h=400&fit=crop', slug: 'decimated' },
];

const FeaturedGamesCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-varsity text-3xl md:text-4xl lg:text-5xl tracking-wide">
            FEATURED GAMES
          </h2>
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full h-10 w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featuredGames.map((game, index) => (
            <div
              key={game.slug}
              className="game-card group flex-shrink-0 w-[200px] md:w-[240px] aspect-square rounded-2xl overflow-hidden relative cursor-pointer snap-start"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={game.image}
                alt={game.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-display font-bold text-sm md:text-base text-foreground drop-shadow-lg">
                  {game.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGamesCarousel;

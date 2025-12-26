import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState } from 'react';
const featuredGames = [{
  name: 'Axie Infinity',
  image: 'https://cryptologos.cc/logos/axie-infinity-axs-logo.png?v=035',
  slug: 'axie-infinity'
}, {
  name: 'The Sandbox',
  image: 'https://cryptologos.cc/logos/the-sandbox-sand-logo.png?v=035',
  slug: 'the-sandbox'
}, {
  name: 'Illuvium',
  image: 'https://cryptologos.cc/logos/illuvium-ilv-logo.png?v=035',
  slug: 'illuvium'
}, {
  name: 'Decentraland',
  image: 'https://cryptologos.cc/logos/decentraland-mana-logo.png?v=035',
  slug: 'decentraland'
}, {
  name: 'Gods Unchained',
  image: 'https://assets.coingecko.com/coins/images/17139/large/10631.png?1696516702',
  slug: 'gods-unchained'
}, {
  name: 'Star Atlas',
  image: 'https://cryptologos.cc/logos/star-atlas-atlas-logo.png?v=035',
  slug: 'star-atlas'
}, {
  name: 'Gala Games',
  image: 'https://cryptologos.cc/logos/gala-gala-logo.png?v=035',
  slug: 'gala-games'
}, {
  name: 'Enjin',
  image: 'https://cryptologos.cc/logos/enjin-coin-enj-logo.png?v=035',
  slug: 'enjin'
}, {
  name: 'Immutable X',
  image: 'https://cryptologos.cc/logos/immutable-x-imx-logo.png?v=035',
  slug: 'immutable-x'
}, {
  name: 'Ultra',
  image: 'https://cryptologos.cc/logos/ultra-uos-logo.png?v=035',
  slug: 'ultra'
}, {
  name: 'Yield Guild Games',
  image: 'https://cryptologos.cc/logos/yield-guild-games-ygg-logo.png?v=035',
  slug: 'yield-guild-games'
}, {
  name: 'Vulcan Forged',
  image: 'https://assets.coingecko.com/coins/images/14476/large/vulcan-forged-logo.png',
  slug: 'vulcan-forged'
}, {
  name: 'Merit Circle',
  image: 'https://cryptologos.cc/logos/merit-circle-mc-logo.png?v=035',
  slug: 'merit-circle'
}, {
  name: 'Parallel',
  image: 'https://assets.coingecko.com/coins/images/28527/large/PRIME.png',
  slug: 'parallel'
}, {
  name: 'Big Time',
  image: 'https://assets.coingecko.com/coins/images/32400/large/bigtime.jpeg',
  slug: 'big-time'
}, {
  name: 'Pixels',
  image: 'https://assets.coingecko.com/coins/images/35218/large/pixel-icon.png',
  slug: 'pixels'
}, {
  name: 'Shrapnel',
  image: 'https://assets.coingecko.com/coins/images/35716/large/Shrapnel.png',
  slug: 'shrapnel'
}, {
  name: 'Off The Grid',
  image: 'https://assets.coingecko.com/coins/images/36125/large/otg.png',
  slug: 'off-the-grid'
}];
const FeaturedGamesCarousel = () => {
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
          const {
            scrollLeft,
            scrollWidth,
            clientWidth
          } = scrollRef.current;

          // Reset to start when reaching the end
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({
              left: 0,
              behavior: 'smooth'
            });
          } else {
            scrollRef.current.scrollBy({
              left: 260,
              behavior: 'smooth'
            });
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
  return <section className="py-16 md:py-24 overflow-hidden">
      <div className="container px-4">
        <div className="items-center justify-between mb-8 flex flex-col">
          <h2 className="font-varsity text-3xl md:text-4xl tracking-wide mx-[495px] lg:text-8xl text-center">
            FEATURED GAMES
          </h2>
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-full h-10 w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-full h-10 w-10">
              
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory" style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}>
          {featuredGames.map((game, index) => <div key={game.slug} className="game-card group flex-shrink-0 w-[200px] md:w-[240px] aspect-square rounded-2xl overflow-hidden relative cursor-pointer snap-start" style={{
          animationDelay: `${index * 50}ms`
        }}>
              {/* Gradient background for Web3 gaming aesthetic */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
              
              {/* Logo centered */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <img src={game.image} alt={game.name} className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" onError={e => {
              // Fallback to first letter if image fails
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<div class="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary/30 flex items-center justify-center text-4xl font-bold text-foreground">${game.name.charAt(0)}</div>`;
            }} />
              </div>
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
              
              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 to-transparent">
                <h3 className="font-display font-bold text-sm md:text-base text-foreground drop-shadow-lg text-center">
                  {game.name}
                </h3>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default FeaturedGamesCarousel;
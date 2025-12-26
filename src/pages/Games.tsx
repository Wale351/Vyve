import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import GameCard from '@/components/GameCard';
import { useGames, useGameCategories } from '@/hooks/useGames';
import { useLiveStreams } from '@/hooks/useStreams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gamepad2, Search, Loader2, Filter } from 'lucide-react';

const Games = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';
  const [search, setSearch] = useState('');
  
  const { data: games = [], isLoading } = useGames();
  const { data: categories = [] } = useGameCategories();
  const { data: liveStreams = [] } = useLiveStreams();
  
  // Count live streams per game
  const liveCountByGame = liveStreams.reduce((acc, stream) => {
    if (stream.game_id) {
      acc[stream.game_id] = (acc[stream.game_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Filter games
  const filteredGames = games.filter(game => {
    const matchesSearch = !search || 
      game.name.toLowerCase().includes(search.toLowerCase()) ||
      game.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || game.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Sort by live count, then alphabetically
  const sortedGames = [...filteredGames].sort((a, b) => {
    const aLive = liveCountByGame[a.id] || 0;
    const bLive = liveCountByGame[b.id] || 0;
    if (bLive !== aLive) return bLive - aLive;
    return a.name.localeCompare(b.name);
  });

  const handleCategoryClick = (category: string) => {
    if (category === categoryFilter) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // Featured games for carousel
  const featuredGameNames = [
    'DeFi Kingdoms', 'Medieval Empires', 'Nyan Heroes', 'Off The Grid', 'Pixels',
    'Super Champs', 'Wilder Worlds', 'Call Of The Voyd', 'Cornucopias', 'Decimated'
  ];
  const featuredGames = games.filter(g => featuredGameNames.includes(g.name));

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">Browse Games</h1>
          </div>
          <p className="text-muted-foreground">
            Discover games and find live streams
          </p>
        </div>

        {/* Featured Games Horizontal Scroll */}
        {featuredGames.length > 0 && !search && !categoryFilter && (
          <div className="mb-10">
            <h2 className="font-varsity text-2xl md:text-3xl mb-4 tracking-wide">FEATURED</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {featuredGames.map((game) => (
                <div key={game.id} className="flex-shrink-0 w-[160px] md:w-[200px]">
                  <GameCard game={game} liveCount={liveCountByGame[game.id] || 0} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games..."
              className="pl-10 bg-muted/30 border-border/50"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button 
              variant={!categoryFilter ? "soft" : "ghost"} 
              size="sm"
              onClick={() => handleCategoryClick('')}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={categoryFilter === category ? "soft" : "ghost"}
                size="sm"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Games grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading games...</p>
          </div>
        ) : sortedGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedGames.map((game, index) => (
              <div 
                key={game.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <GameCard 
                  game={game} 
                  liveCount={liveCountByGame[game.id] || 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card">
            <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="font-display text-2xl font-bold mb-3">No Games Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {search ? `No games match "${search}"` : 'No games available yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;

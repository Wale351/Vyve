import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import GameCard from '@/components/GameCard';
import { useGames, useGameCategories } from '@/hooks/useGames';
import { useLiveStreams } from '@/hooks/useStreams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Gamepad2, Radio } from 'lucide-react';

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
  
  // Filter and sort
  const filteredGames = games
    .filter(game => {
      const matchesSearch = !search || 
        game.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || game.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
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

  const liveGamesCount = Object.keys(liveCountByGame).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-14 md:h-16" />
      
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Activities</h1>
              <p className="text-sm text-muted-foreground">Browse games and content categories</p>
            </div>
          </div>
          
          {liveGamesCount > 0 && (
            <div className="flex items-center gap-2 mt-4 text-sm">
              <Radio className="h-4 w-4 text-destructive" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{liveGamesCount}</span> activities with live streams
              </span>
            </div>
          )}
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="pl-10 h-10 bg-card border-border/50"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button 
              variant={!categoryFilter ? "default" : "ghost"} 
              size="sm"
              onClick={() => handleCategoryClick('')}
              className="rounded-full"
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "ghost"}
                size="sm"
                onClick={() => handleCategoryClick(category)}
                className="rounded-full whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Games Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading activities...</p>
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredGames.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <GameCard 
                  game={game} 
                  liveCount={liveCountByGame[game.id] || 0}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card/50 rounded-2xl border border-border/30">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">No Activities Found</h3>
            <p className="text-muted-foreground text-sm">
              {search ? `No results for "${search}"` : 'Check back soon'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import GameCard from '@/components/GameCard';
import { useGames, useGameCategories } from '@/hooks/useGames';
import { useLiveStreams } from '@/hooks/useStreams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Gamepad2 } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.02, delayChildren: 0.02 }
  }
};

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />
      
      <div className="container px-4 py-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold">Browse Activities</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Discover activities and find live streams
          </p>
        </motion.div>
        
        {/* Search and filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-10"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="pl-11 h-11 bg-card border-border/40 rounded-xl"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button 
              variant={!categoryFilter ? "default" : "ghost"} 
              size="sm"
              onClick={() => handleCategoryClick('')}
              className="rounded-lg"
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "ghost"}
                size="sm"
                onClick={() => handleCategoryClick(category)}
                className="rounded-lg whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>
        
        {/* Games grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading activities...</p>
          </div>
        ) : sortedGames.length > 0 ? (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {sortedGames.map((game) => (
              <motion.div key={game.id} variants={fadeInUp}>
                <GameCard 
                  game={game} 
                  liveCount={liveCountByGame[game.id] || 0}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-card/50 rounded-3xl border border-border/30"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Gamepad2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">No Activities Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {search ? `No activities match "${search}"` : 'No activities available yet'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Games;
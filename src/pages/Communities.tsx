import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, Users, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import CommunityCard from '@/components/communities/CommunityCard';
import { useCommunities } from '@/hooks/useCommunities';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Communities = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useWalletAuth();
  const { data: communities, isLoading } = useCommunities(searchQuery);

  // Check if user is a streamer
  const { data: isStreamer } = useQuery({
    queryKey: ['is-streamer', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase.rpc('is_streamer', { p_user_id: user.id });
      return data || false;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-24 px-4 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Communities</h1>
          </div>
          <p className="text-muted-foreground">
            Join streamer communities, participate in polls, and connect with fellow viewers
          </p>
        </motion.div>

        {/* Search and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities by name, streamer, or ENS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>
          
          {isAuthenticated && isStreamer && (
            <Button asChild className="gap-2">
              <Link to="/communities/create">
                <Plus className="h-4 w-4" />
                Create Community
              </Link>
            </Button>
          )}
        </motion.div>

        {/* Communities Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-24 w-full rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : communities && communities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((community, index) => (
              <CommunityCard key={community.id} community={community} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No communities yet</h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery
                ? `No communities found matching "${searchQuery}"`
                : 'Be the first to create a community and build your audience!'}
            </p>
            {isStreamer && !searchQuery && (
              <Button asChild className="mt-4 gap-2">
                <Link to="/communities/create">
                  <Plus className="h-4 w-4" />
                  Create Community
                </Link>
              </Button>
            )}
          </motion.div>
        )}
      </main>

      {/* Mobile FAB for streamers */}
      {isAuthenticated && isStreamer && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="fixed bottom-20 right-4 sm:hidden"
        >
          <Button asChild size="lg" className="h-14 w-14 rounded-full shadow-lg">
            <Link to="/communities/create">
              <Plus className="h-6 w-6" />
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Communities;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from './useWalletAuth';

export interface RecentGame {
  game_id: string;
  game_name: string;
  game_slug: string;
  game_thumbnail: string | null;
  last_watched: string;
}

export const useRecentlyPlayedGames = (limit = 5) => {
  const { user } = useWalletAuth();
  
  return useQuery({
    queryKey: ['recently-played', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get distinct recent games from viewing history
      const { data, error } = await supabase
        .from('viewing_history')
        .select(`
          game_id,
          watched_at,
          games (
            id,
            name,
            slug,
            thumbnail_url
          )
        `)
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false })
        .limit(50); // Fetch more to dedupe

      if (error) throw error;
      
      // Deduplicate by game_id, keeping most recent
      const seenGames = new Set<string>();
      const recentGames: RecentGame[] = [];
      
      for (const item of data || []) {
        if (item.games && !seenGames.has(item.game_id)) {
          seenGames.add(item.game_id);
          recentGames.push({
            game_id: item.game_id,
            game_name: item.games.name,
            game_slug: item.games.slug,
            game_thumbnail: item.games.thumbnail_url,
            last_watched: item.watched_at,
          });
          
          if (recentGames.length >= limit) break;
        }
      }
      
      return recentGames;
    },
    enabled: !!user?.id,
  });
};

export const useRecordView = () => {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();
  
  return useMutation({
    mutationFn: async ({ gameId, streamId }: { gameId: string; streamId?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('viewing_history')
        .insert({
          user_id: user.id,
          game_id: gameId,
          stream_id: streamId || null,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recently-played'] });
    },
  });
};


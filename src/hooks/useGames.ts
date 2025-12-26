import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Game {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export const useGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Game[];
    },
  });
};

export const useGame = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['game', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as Game | null;
    },
    enabled: !!slug,
  });
};

export const useGameById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['game-by-id', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Game | null;
    },
    enabled: !!id,
  });
};

export const useGameCategories = () => {
  return useQuery({
    queryKey: ['game-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('category');

      if (error) throw error;
      
      const categories = [...new Set(data.map(g => g.category))];
      return categories.sort();
    },
  });
};

export const useLiveStreamCountByGame = () => {
  return useQuery({
    queryKey: ['live-stream-count-by-game'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('streams')
        .select('game_id')
        .eq('is_live', true);

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(stream => {
        if (stream.game_id) {
          counts[stream.game_id] = (counts[stream.game_id] || 0) + 1;
        }
      });
      return counts;
    },
  });
};

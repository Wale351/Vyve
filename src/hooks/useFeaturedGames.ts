import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Game } from './useGames';

// Featured Web3 game slugs - these will be pulled from database
const FEATURED_SLUGS = [
  'off-the-grid',
  'nyan-heroes',
  'pixels',
  'super-champs',
  'illuvium',
  'shrapnel',
  'star-atlas',
  'deadrop',
  'alien-worlds',
  'maplestory-universe',
  'gods-unchained',
  'axie-infinity',
  'the-sandbox',
  'big-time',
  'parallel',
];

export const useFeaturedGames = () => {
  return useQuery({
    queryKey: ['featured-games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .in('slug', FEATURED_SLUGS);

      if (error) throw error;
      
      // Sort by the order in FEATURED_SLUGS
      const sortedData = FEATURED_SLUGS
        .map(slug => data?.find(g => g.slug === slug))
        .filter((g): g is Game => g !== undefined);
      
      return sortedData;
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
};

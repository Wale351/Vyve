import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StreamWithProfile {
  id: string;
  title: string;
  description: string | null;
  game_category: string | null;
  is_live: boolean | null;
  viewer_count: number | null;
  playback_url: string | null;
  stream_key: string | null;
  started_at: string | null;
  ended_at: string | null;
  streamer_id: string;
  profiles: {
    id: string;
    username: string | null;
    wallet_address: string;
    avatar_url: string | null;
  } | null;
}

export const useLiveStreams = () => {
  return useQuery({
    queryKey: ['streams', 'live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('streams')
        .select(`
          *,
          profiles!streams_streamer_id_fkey (
            id,
            username,
            wallet_address,
            avatar_url
          )
        `)
        .eq('is_live', true)
        .order('viewer_count', { ascending: false });

      if (error) throw error;
      return data as StreamWithProfile[];
    },
  });
};

export const useStream = (streamId: string | undefined) => {
  return useQuery({
    queryKey: ['streams', streamId],
    queryFn: async () => {
      if (!streamId) return null;
      
      const { data, error } = await supabase
        .from('streams')
        .select(`
          *,
          profiles!streams_streamer_id_fkey (
            id,
            username,
            wallet_address,
            avatar_url,
            bio
          )
        `)
        .eq('id', streamId)
        .maybeSingle();

      if (error) throw error;
      return data as StreamWithProfile | null;
    },
    enabled: !!streamId,
  });
};

export const useStreamerStreams = (streamerId: string | undefined) => {
  return useQuery({
    queryKey: ['streams', 'streamer', streamerId],
    queryFn: async () => {
      if (!streamerId) return [];
      
      const { data, error } = await supabase
        .from('streams')
        .select(`
          *,
          profiles!streams_streamer_id_fkey (
            id,
            username,
            wallet_address,
            avatar_url
          )
        `)
        .eq('streamer_id', streamerId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data as StreamWithProfile[];
    },
    enabled: !!streamerId,
  });
};

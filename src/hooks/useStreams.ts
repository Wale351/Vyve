import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StreamWithProfile {
  id: string;
  title: string;
  description: string | null;
  game_category: string | null;
  game_id: string | null;
  tags: string[] | null;
  is_live: boolean | null;
  viewer_count: number | null;
  playback_url: string | null;
  playback_id: string | null;
  recording_url: string | null;
  recording_asset_id: string | null;
  livepeer_stream_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  streamer_id: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    bio?: string | null;
    verified_creator?: boolean | null;
  } | null;
  games?: {
    id: string;
    name: string;
    slug: string;
    category: string;
  } | null;
}

export const useLiveStreams = (filters?: { gameId?: string; category?: string }) => {
  return useQuery({
    queryKey: ['streams', 'live', filters],
    queryFn: async () => {
      let query = supabase
        .from('streams')
        .select(`
          id,
          title,
          description,
          game_category,
          game_id,
          tags,
          is_live,
          viewer_count,
          playback_url,
          playback_id,
          recording_url,
          recording_asset_id,
          livepeer_stream_id,
          started_at,
          ended_at,
          streamer_id,
          profiles:public_profiles!streams_streamer_id_fkey (
            id,
            username,
            avatar_url,
            verified_creator
          ),
          games (
            id,
            name,
            slug,
            category
          )
        `)
        .eq('is_live', true);

      if (filters?.gameId) {
        query = query.eq('game_id', filters.gameId);
      }

      const { data, error } = await query.order('viewer_count', { ascending: false });

      if (error) throw error;
      
      let results = data as unknown as StreamWithProfile[];
      
      // Filter by category client-side (games.category)
      if (filters?.category) {
        results = results.filter(s => s.games?.category === filters.category);
      }
      
      return results;
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
          id,
          title,
          description,
          game_category,
          game_id,
          tags,
          is_live,
          viewer_count,
          playback_url,
          playback_id,
          recording_url,
          recording_asset_id,
          livepeer_stream_id,
          started_at,
          ended_at,
          streamer_id,
          profiles:public_profiles!streams_streamer_id_fkey (
            id,
            username,
            avatar_url,
            bio,
            verified_creator
          ),
          games (
            id,
            name,
            slug,
            category
          )
        `)
        .eq('id', streamId)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as StreamWithProfile | null;
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
          id,
          title,
          description,
          game_category,
          game_id,
          tags,
          is_live,
          viewer_count,
          playback_url,
          playback_id,
          recording_url,
          recording_asset_id,
          livepeer_stream_id,
          started_at,
          ended_at,
          streamer_id,
          profiles:public_profiles!streams_streamer_id_fkey (
            id,
            username,
            avatar_url,
            verified_creator
          ),
          games (
            id,
            name,
            slug,
            category
          )
        `)
        .eq('streamer_id', streamerId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data as unknown as StreamWithProfile[];
    },
    enabled: !!streamerId,
  });
};

// Fetch only streams with recordings for profile VOD section
export const useStreamerRecordings = (streamerId: string | undefined) => {
  return useQuery({
    queryKey: ['streams', 'recordings', streamerId],
    queryFn: async () => {
      if (!streamerId) return [];
      
      const { data, error } = await supabase
        .from('streams')
        .select(`
          id,
          title,
          description,
          game_category,
          game_id,
          tags,
          is_live,
          viewer_count,
          playback_url,
          playback_id,
          recording_url,
          recording_asset_id,
          livepeer_stream_id,
          started_at,
          ended_at,
          streamer_id,
          profiles:public_profiles!streams_streamer_id_fkey (
            id,
            username,
            avatar_url,
            verified_creator
          ),
          games (
            id,
            name,
            slug,
            category
          )
        `)
        .eq('streamer_id', streamerId)
        .eq('is_live', false)
        .not('recording_url', 'is', null)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data as unknown as StreamWithProfile[];
    },
    enabled: !!streamerId,
  });
};

export const useStreamsByGame = (gameId: string | undefined) => {
  return useQuery({
    queryKey: ['streams', 'game', gameId],
    queryFn: async () => {
      if (!gameId) return [];
      
      const { data, error } = await supabase
        .from('streams')
        .select(`
          id,
          title,
          description,
          game_category,
          game_id,
          tags,
          is_live,
          viewer_count,
          playback_url,
          playback_id,
          recording_url,
          recording_asset_id,
          livepeer_stream_id,
          started_at,
          ended_at,
          streamer_id,
          profiles:public_profiles!streams_streamer_id_fkey (
            id,
            username,
            avatar_url,
            verified_creator
          ),
          games (
            id,
            name,
            slug,
            category
          )
        `)
        .eq('game_id', gameId)
        .eq('is_live', true)
        .order('viewer_count', { ascending: false });

      if (error) throw error;
      return data as unknown as StreamWithProfile[];
    },
    enabled: !!gameId,
  });
};
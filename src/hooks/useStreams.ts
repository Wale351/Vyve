import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchStreamProfiles } from '@/lib/profileHelpers';

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
  thumbnail_url: string | null;
  started_at: string | null;
  ended_at: string | null;
  streamer_id: string;
  tip_goal_enabled?: boolean | null;
  tip_goal_title?: string | null;
  tip_goal_amount_eth?: number | null;
  tip_goal_updated_at?: string | null;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    bio?: string | null;
    verified_creator?: boolean;
  } | null;
  games?: {
    id: string;
    name: string;
    slug: string;
    category: string;
    thumbnail_url?: string | null;
  } | null;
}

// Helper to enrich streams with profile data from profiles table
async function enrichStreamsWithProfiles(streams: any[]): Promise<StreamWithProfile[]> {
  if (!streams.length) return [];
  
  const streamerIds = [...new Set(streams.map(s => s.streamer_id))];
  const profileMap = await fetchStreamProfiles(streamerIds);
  
  return streams.map(stream => ({
    ...stream,
    profiles: profileMap.get(stream.streamer_id) || null,
  }));
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
          thumbnail_url,
          started_at,
          ended_at,
          tip_goal_enabled,
          tip_goal_title,
          tip_goal_amount_eth,
          tip_goal_updated_at,
          streamer_id,
          games (
            id,
            name,
            slug,
            category,
            thumbnail_url
          )
        `)
        .eq('is_live', true);

      if (filters?.gameId) {
        query = query.eq('game_id', filters.gameId);
      }

      const { data, error } = await query.order('viewer_count', { ascending: false });

      if (error) throw error;
      
      let results = await enrichStreamsWithProfiles(data || []);
      
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
          thumbnail_url,
          started_at,
          ended_at,
          tip_goal_enabled,
          tip_goal_title,
          tip_goal_amount_eth,
          tip_goal_updated_at,
          streamer_id,
          games (
            id,
            name,
            slug,
            category,
            thumbnail_url
          )
        `)
        .eq('id', streamId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      // Fetch profile for the streamer from public_profiles view (not profiles table)
      // This ensures viewers can see streamer info without owner-only RLS blocking
      const { data: profile } = await supabase
        .from('public_profiles')
        .select('id, username, avatar_url, bio, verified_creator')
        .eq('id', data.streamer_id)
        .maybeSingle();
      
      return {
        ...data,
        profiles: profile ? {
          id: profile.id!,
          username: profile.username || 'Unknown',
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          verified_creator: profile.verified_creator || false,
        } : null,
      } as StreamWithProfile;
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
          id, title, description, game_category, game_id, tags, is_live, viewer_count,
          playback_url, playback_id, recording_url, recording_asset_id, livepeer_stream_id,
          thumbnail_url, started_at, ended_at, tip_goal_enabled, tip_goal_title,
          tip_goal_amount_eth, tip_goal_updated_at, streamer_id,
          games (id, name, slug, category, thumbnail_url)
        `)
        .eq('streamer_id', streamerId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return enrichStreamsWithProfiles(data || []);
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
          id, title, description, game_category, game_id, tags, is_live, viewer_count,
          playback_url, playback_id, recording_url, recording_asset_id, livepeer_stream_id,
          thumbnail_url, started_at, ended_at, tip_goal_enabled, tip_goal_title,
          tip_goal_amount_eth, tip_goal_updated_at, streamer_id,
          games (id, name, slug, category, thumbnail_url)
        `)
        .eq('streamer_id', streamerId)
        .eq('is_live', false)
        .not('recording_url', 'is', null)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return enrichStreamsWithProfiles(data || []);
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
          id, title, description, game_category, game_id, tags, is_live, viewer_count,
          playback_url, playback_id, recording_url, recording_asset_id, livepeer_stream_id,
          thumbnail_url, started_at, ended_at, tip_goal_enabled, tip_goal_title,
          tip_goal_amount_eth, tip_goal_updated_at, streamer_id,
          games (id, name, slug, category, thumbnail_url)
        `)
        .eq('game_id', gameId)
        .eq('is_live', true)
        .order('viewer_count', { ascending: false });

      if (error) throw error;
      return enrichStreamsWithProfiles(data || []);
    },
    enabled: !!gameId,
  });
};

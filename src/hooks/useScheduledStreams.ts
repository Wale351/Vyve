import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from './useWalletAuth';
import { fetchStreamProfiles } from '@/lib/profileHelpers';

export interface ScheduledStream {
  id: string;
  streamer_id: string;
  title: string;
  description: string | null;
  game_id: string | null;
  scheduled_for: string;
  thumbnail_url: string | null;
  created_at: string;
  is_cancelled: boolean;
  games?: {
    id: string;
    name: string;
    slug: string;
    thumbnail_url: string | null;
  } | null;
  profiles?: {
    id: string;
    username: string;
    avatar_url: string | null;
    verified_creator?: boolean;
  } | null;
}

export const useUpcomingStreams = (limit = 10) => {
  return useQuery({
    queryKey: ['scheduled-streams', 'upcoming', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_streams')
        .select(`
          *,
          games (id, name, slug, thumbnail_url)
        `)
        .eq('is_cancelled', false)
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(limit);

      if (error) throw error;
      if (!data?.length) return [];
      
      // Fetch profiles
      const streamerIds = [...new Set(data.map(s => s.streamer_id))];
      const profileMap = await fetchStreamProfiles(streamerIds);
      
      return data.map(stream => ({
        ...stream,
        profiles: profileMap.get(stream.streamer_id) || null,
      })) as ScheduledStream[];
    },
  });
};

export const useStreamerSchedule = (streamerId: string | undefined) => {
  return useQuery({
    queryKey: ['scheduled-streams', 'streamer', streamerId],
    queryFn: async () => {
      if (!streamerId) return [];
      
      const { data, error } = await supabase
        .from('scheduled_streams')
        .select(`
          *,
          games (id, name, slug, thumbnail_url)
        `)
        .eq('streamer_id', streamerId)
        .eq('is_cancelled', false)
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data as ScheduledStream[];
    },
    enabled: !!streamerId,
  });
};

export const useCreateScheduledStream = () => {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      game_id?: string;
      scheduled_for: string;
      thumbnail_url?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: created, error } = await supabase
        .from('scheduled_streams')
        .insert({
          streamer_id: user.id,
          title: data.title,
          description: data.description || null,
          game_id: data.game_id || null,
          scheduled_for: data.scheduled_for,
          thumbnail_url: data.thumbnail_url || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-streams'] });
    },
  });
};

export const useCancelScheduledStream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (streamId: string) => {
      const { error } = await supabase
        .from('scheduled_streams')
        .update({ is_cancelled: true })
        .eq('id', streamId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-streams'] });
    },
  });
};

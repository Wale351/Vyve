import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Clip {
  id: string;
  stream_id: string;
  user_id: string;
  title: string;
  start_time: number;
  duration: number;
  playback_id: string | null;
  asset_id: string | null;
  status: string;
  thumbnail_url: string | null;
  created_at: string;
}

export function useStreamClips(streamId: string | undefined) {
  return useQuery({
    queryKey: ['clips', 'stream', streamId],
    enabled: !!streamId,
    queryFn: async () => {
      if (!streamId) return [];
      
      const { data, error } = await supabase
        .from('stream_clips')
        .select('*')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Clip[];
    },
  });
}

export function useUserClips(userId: string | undefined) {
  return useQuery({
    queryKey: ['clips', 'user', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('stream_clips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Clip[];
    },
  });
}

export function useCreateClip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      streamId,
      userId,
      title,
      startTime,
      duration = 30,
      playbackId,
    }: {
      streamId: string;
      userId: string;
      title: string;
      startTime: number;
      duration?: number;
      playbackId?: string;
    }) => {
      const { data, error } = await supabase
        .from('stream_clips')
        .insert({
          stream_id: streamId,
          user_id: userId,
          title,
          start_time: startTime,
          duration,
          playback_id: playbackId,
          status: 'processing',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Clip created! Processing...');
      queryClient.invalidateQueries({ queryKey: ['clips', 'stream', data.stream_id] });
      queryClient.invalidateQueries({ queryKey: ['clips', 'user', data.user_id] });
    },
    onError: (error) => {
      console.error('Create clip error:', error);
      toast.error('Failed to create clip');
    },
  });
}

export function useDeleteClip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clipId: string) => {
      const { error } = await supabase
        .from('stream_clips')
        .delete()
        .eq('id', clipId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Clip deleted');
      queryClient.invalidateQueries({ queryKey: ['clips'] });
    },
    onError: (error) => {
      console.error('Delete clip error:', error);
      toast.error('Failed to delete clip');
    },
  });
}

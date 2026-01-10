import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ApplicationStatus {
  has_pending: boolean;
  latest_status: 'pending' | 'approved' | 'rejected' | null;
  latest_created_at: string | null;
}

export interface StreamerApplicationInput {
  username: string;
  bio: string;
  why_stream: string;
  content_type: string;
  streaming_frequency: string;
  prior_experience?: string;
  socials?: {
    twitter?: string;
    discord?: string;
    youtube?: string;
    twitch?: string;
  };
  primary_game_id?: string;
}

export const useApplicationStatus = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['application-status', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase.rpc('get_user_application_status', {
        p_user_id: userId,
      });
      if (error) throw error;
      return data as unknown as ApplicationStatus;
    },
    enabled: !!userId,
  });
};

export const useMyApplications = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['my-applications', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('streamer_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: StreamerApplicationInput }) => {
      const { error } = await supabase
        .from('streamer_applications')
        .insert({
          user_id: userId,
          username: data.username,
          bio: data.bio,
          why_stream: data.why_stream,
          content_type: data.content_type,
          streaming_frequency: data.streaming_frequency,
          prior_experience: data.prior_experience || null,
          socials: data.socials || null,
          primary_game_id: data.primary_game_id || null,
          status: 'pending',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-status'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      toast.success('Application submitted! We\'ll review it soon.');
    },
    onError: (error: Error) => {
      console.error('Submit application error:', error);
      if (error.message.includes('already have a pending')) {
        toast.error('You already have a pending application');
      } else {
        toast.error('Failed to submit application');
      }
    },
  });
};

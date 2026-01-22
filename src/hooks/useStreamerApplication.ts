import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface StreamerApplication {
  id: string;
  user_id: string;
  username: string;
  bio: string;
  why_stream: string | null;
  content_type: string | null;
  streaming_frequency: string | null;
  prior_experience: string | null;
  primary_game_id: string | null;
  socials: Json | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface ApplicationFormData {
  why_stream: string;
  content_type: string;
  streaming_frequency: string;
  prior_experience: string;
  primary_game_id?: string;
  socials?: {
    twitter?: string;
    discord?: string;
    youtube?: string;
    twitch?: string;
  };
}

// Get the current user's application status
export const useApplicationStatus = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['application-status', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase.rpc('get_user_application_status', {
        p_user_id: userId
      });
      
      if (error) throw error;
      return data as { 
        has_application: boolean; 
        status: string | null; 
        application_id: string | null;
        created_at: string | null;
      } | null;
    },
    enabled: !!userId,
  });
};

// Get the current user's application
export const useMyApplication = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['my-application', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('streamer_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as StreamerApplication | null;
    },
    enabled: !!userId,
  });
};

// Submit a streamer application
export const useSubmitApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      username, 
      bio, 
      formData 
    }: { 
      userId: string; 
      username: string; 
      bio: string;
      formData: ApplicationFormData;
    }) => {
      const { error } = await supabase
        .from('streamer_applications')
        .insert({
          user_id: userId,
          username,
          bio,
          why_stream: formData.why_stream,
          content_type: formData.content_type,
          streaming_frequency: formData.streaming_frequency,
          prior_experience: formData.prior_experience,
          primary_game_id: formData.primary_game_id || null,
          socials: formData.socials || {},
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-status'] });
      queryClient.invalidateQueries({ queryKey: ['my-application'] });
      toast.success('Application submitted successfully!');
    },
    onError: (error: Error) => {
      console.error('Application submission error:', error);
      if (error.message.includes('pending')) {
        toast.error('You already have a pending application');
      } else {
        toast.error('Failed to submit application');
      }
    },
  });
};

// Admin: Get all pending applications
export const usePendingApplications = () => {
  return useQuery({
    queryKey: ['pending-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('streamer_applications')
        .select(`
          *,
          profiles:user_id (
            avatar_url,
            verified_creator
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
};

// Admin: Get all applications
export const useAllApplications = (status?: string) => {
  return useQuery({
    queryKey: ['all-applications', status],
    queryFn: async () => {
      // First fetch applications
      let query = supabase
        .from('streamer_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      
      const { data: applications, error } = await query;
      if (error) throw error;
      if (!applications?.length) return [];
      
      // Then fetch profiles separately to avoid join issues
      const userIds = [...new Set(applications.map(app => app.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, avatar_url, verified_creator')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return applications.map(app => ({
        ...app,
        profiles: profileMap.get(app.user_id) || null,
      }));
    },
  });
};

// Admin: Approve application
export const useApproveApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, notes }: { applicationId: string; notes?: string }) => {
      const { error } = await supabase.rpc('approve_streamer_application', {
        p_application_id: applicationId,
        p_notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-applications'] });
      queryClient.invalidateQueries({ queryKey: ['all-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-paged'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-search-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Application approved!');
    },
    onError: (error) => {
      console.error('Approve error:', error);
      toast.error('Failed to approve application');
    },
  });
};

// Admin: Reject application
export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, notes }: { applicationId: string; notes?: string }) => {
      const { error } = await supabase.rpc('reject_streamer_application', {
        p_application_id: applicationId,
        p_notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-applications'] });
      queryClient.invalidateQueries({ queryKey: ['all-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-paged'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-search-users'] });
      toast.success('Application rejected');
    },
    onError: (error) => {
      console.error('Reject error:', error);
      toast.error('Failed to reject application');
    },
  });
};

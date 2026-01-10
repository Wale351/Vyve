import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface AdminStats {
  total_users: number;
  total_streamers: number;
  total_admins: number;
  live_streams: number;
  pending_applications: number;
  total_tips_volume: number;
}

export interface StreamerApplication {
  id: string;
  user_id: string;
  username: string;
  bio: string;
  why_stream: string | null;
  content_type: string | null;
  streaming_frequency: string | null;
  prior_experience: string | null;
  socials: Record<string, string> | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  primary_game_id: string | null;
  profile?: {
    avatar_url: string | null;
  };
}

export interface AdminUser {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  verified_creator: boolean;
  suspended: boolean;
  created_at: string;
  role: 'viewer' | 'streamer' | 'admin';
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  admin?: {
    username: string;
    avatar_url: string | null;
  };
}

// Hooks
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (error) throw error;
      return data as unknown as AdminStats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const usePendingApplications = () => {
  return useQuery({
    queryKey: ['pending-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('streamer_applications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return (data || []) as unknown as StreamerApplication[];
    },
  });
};

export const useAllApplications = () => {
  return useQuery({
    queryKey: ['all-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('streamer_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as StreamerApplication[];
    },
  });
};

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
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Application approved!');
    },
    onError: (error) => {
      console.error('Approve application error:', error);
      toast.error('Failed to approve application');
    },
  });
};

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
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Application rejected');
    },
    onError: (error) => {
      console.error('Reject application error:', error);
      toast.error('Failed to reject application');
    },
  });
};

export const useAdminSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ['admin-search-users', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase.rpc('admin_search_users', {
        p_query: query,
        p_limit: 20,
      });
      if (error) throw error;
      return (data || []) as AdminUser[];
    },
    enabled: query.length >= 2,
  });
};

export const useSetUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'viewer' | 'streamer' | 'admin' }) => {
      const { error } = await supabase.rpc('admin_set_user_role', {
        p_user_id: userId,
        p_role: role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-search-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Role updated!');
    },
    onError: (error: Error) => {
      console.error('Set role error:', error);
      toast.error(error.message || 'Failed to update role');
    },
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const { error } = await supabase.rpc('suspend_user', {
        p_user_id: userId,
        p_reason: reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-search-users'] });
      toast.success('User suspended');
    },
    onError: (error: Error) => {
      console.error('Suspend user error:', error);
      toast.error(error.message || 'Failed to suspend user');
    },
  });
};

export const useUnsuspendUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('unsuspend_user', {
        p_user_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-search-users'] });
      toast.success('User unsuspended');
    },
    onError: (error) => {
      console.error('Unsuspend user error:', error);
      toast.error('Failed to unsuspend user');
    },
  });
};

export const useSetUserVerified = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      const { error } = await supabase.rpc('set_user_verified', {
        p_user_id: userId,
        p_verified: verified,
      });
      if (error) throw error;
    },
    onSuccess: (_, { verified }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-search-users'] });
      toast.success(verified ? 'User verified!' : 'Verification removed');
    },
    onError: (error) => {
      console.error('Set verified error:', error);
      toast.error('Failed to update verification');
    },
  });
};

export const useLiveStreams = () => {
  return useQuery({
    queryKey: ['admin-live-streams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('streams')
        .select(`
          id,
          title,
          is_live,
          viewer_count,
          flagged,
          flag_reason,
          hidden,
          started_at,
          streamer:profiles!streams_streamer_id_fkey(id, username, avatar_url)
        `)
        .eq('is_live', true)
        .order('viewer_count', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

export const useEndStream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (streamId: string) => {
      const { error } = await supabase.rpc('admin_end_stream', {
        p_stream_id: streamId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-live-streams'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Stream ended');
    },
    onError: (error) => {
      console.error('End stream error:', error);
      toast.error('Failed to end stream');
    },
  });
};

export const useFlagStream = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ streamId, reason }: { streamId: string; reason: string }) => {
      const { error } = await supabase.rpc('admin_flag_stream', {
        p_stream_id: streamId,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-live-streams'] });
      toast.success('Stream flagged');
    },
    onError: (error) => {
      console.error('Flag stream error:', error);
      toast.error('Failed to flag stream');
    },
  });
};

export const useSetStreamHidden = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ streamId, hidden }: { streamId: string; hidden: boolean }) => {
      const { error } = await supabase.rpc('admin_set_stream_hidden', {
        p_stream_id: streamId,
        p_hidden: hidden,
      });
      if (error) throw error;
    },
    onSuccess: (_, { hidden }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-live-streams'] });
      toast.success(hidden ? 'Stream hidden from discovery' : 'Stream visible in discovery');
    },
    onError: (error) => {
      console.error('Set stream hidden error:', error);
      toast.error('Failed to update stream visibility');
    },
  });
};

export const useAuditLogs = (limit = 50) => {
  return useQuery({
    queryKey: ['audit-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data || []) as unknown as AuditLog[];
    },
  });
};

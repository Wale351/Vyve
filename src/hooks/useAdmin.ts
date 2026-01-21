import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminStats {
  total_users: number;
  total_streamers: number;
  live_streams: number;
  pending_applications: number;
  total_tips_eth: number;
}

// Get admin dashboard stats
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (error) throw error;
      return data as unknown as AdminStats;
    },
  });
};

// Fetch all users (paginated)
export const useAdminAllUsers = (limit: number = 50) => {
  return useQuery({
    queryKey: ['admin-all-users', limit],
    queryFn: async () => {
      // Use admin_profiles view which has role information
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
  });
};

// Search users
export const useAdminSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ['admin-search-users', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase.rpc('admin_search_users', {
        p_query: query,
        p_limit: 20,
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2,
  });
};

// Get all live streams for moderation
export const useAdminLiveStreams = () => {
  return useQuery({
    queryKey: ['admin-live-streams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('streams')
        .select(`
          *,
          profiles:streamer_id (
            username,
            avatar_url
          )
        `)
        .eq('is_live', true)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });
};

// Set user role
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
      toast.success('User role updated');
    },
    onError: (error) => {
      console.error('Set role error:', error);
      toast.error('Failed to update role');
    },
  });
};

// Suspend user
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
    onError: (error) => {
      console.error('Suspend error:', error);
      toast.error('Failed to suspend user');
    },
  });
};

// Unsuspend user
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
      console.error('Unsuspend error:', error);
      toast.error('Failed to unsuspend user');
    },
  });
};

// Global mute user
export const useGlobalMuteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason, durationHours }: { userId: string; reason?: string; durationHours?: number }) => {
      const { error } = await supabase.rpc('admin_global_mute', {
        p_user_id: userId,
        p_reason: reason || null,
        p_duration_hours: durationHours || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-search-users'] });
      toast.success('User muted globally');
    },
    onError: (error) => {
      console.error('Global mute error:', error);
      toast.error('Failed to mute user');
    },
  });
};

// Global unmute user
export const useGlobalUnmuteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('admin_global_unmute', {
        p_user_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-search-users'] });
      toast.success('User unmuted');
    },
    onError: (error) => {
      console.error('Global unmute error:', error);
      toast.error('Failed to unmute user');
    },
  });
};

// End a stream (admin)
export const useAdminEndStream = () => {
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
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast.success('Stream ended');
    },
    onError: (error) => {
      console.error('End stream error:', error);
      toast.error('Failed to end stream');
    },
  });
};

// Flag a stream
export const useAdminFlagStream = () => {
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

// Hide/unhide stream from discovery
export const useAdminSetStreamHidden = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, hidden }: { streamId: string; hidden: boolean }) => {
      const { error } = await supabase.rpc('admin_set_stream_hidden', {
        p_stream_id: streamId,
        p_hidden: hidden,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-live-streams'] });
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast.success('Stream visibility updated');
    },
    onError: (error) => {
      console.error('Set hidden error:', error);
      toast.error('Failed to update stream visibility');
    },
  });
};

// Set user verified status
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-search-users'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Verification status updated');
    },
    onError: (error) => {
      console.error('Set verified error:', error);
      toast.error('Failed to update verification status');
    },
  });
};

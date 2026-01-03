import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Check if current user is admin
export const useIsAdmin = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['is-admin', userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      return data === true;
    },
    enabled: !!userId,
  });
};

// Get admin dashboard stats
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (error) throw error;
      return data as {
        total_users: number;
        total_streamers: number;
        active_streams: number;
        total_tips_eth: number;
        new_users_24h: number;
        new_users_7d: number;
        pending_applications: number;
        open_reports: number;
      };
    },
  });
};

// Get all users for admin
export const useAdminUsers = (search?: string) => {
  return useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          username,
          wallet_address,
          avatar_url,
          bio,
          verified_creator,
          suspended,
          suspended_at,
          suspended_reason,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('username', `%${search}%`);
      }

      const { data: profiles, error } = await query.limit(100);
      if (error) throw error;
      
      // Fetch roles separately
      const userIds = profiles?.map(p => p.id) || [];
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);
      
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      
      return profiles?.map(u => ({
        ...u,
        role: roleMap.get(u.id) || 'viewer'
      }));
    },
  });
};

// Get all streams for admin
export const useAdminStreams = () => {
  return useQuery({
    queryKey: ['admin-streams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('streams')
        .select(`
          *,
          streamer:public_profiles!streams_streamer_id_fkey(username, avatar_url)
        `)
        .order('started_at', { ascending: false, nullsFirst: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
};

// Get all chat messages for admin
export const useAdminChatMessages = (streamId?: string, userId?: string) => {
  return useQuery({
    queryKey: ['admin-chat', streamId, userId],
    queryFn: async () => {
      let query = supabase
        .from('chat_messages')
        .select(`
          *,
          sender:public_profiles!chat_messages_sender_id_fkey(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (streamId) {
        query = query.eq('stream_id', streamId);
      }
      if (userId) {
        query = query.eq('sender_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Get tips for admin
export const useAdminTips = () => {
  return useQuery({
    queryKey: ['admin-tips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tips')
        .select(`
          *,
          sender:public_profiles!tips_sender_id_fkey(username),
          receiver:public_profiles!tips_receiver_id_fkey(username)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
};

// Get reports for admin
export const useAdminReports = (status?: string) => {
  return useQuery({
    queryKey: ['admin-reports', status],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });
};

// Get streamer applications
export const useStreamerApplications = (status?: string) => {
  return useQuery({
    queryKey: ['streamer-applications', status],
    queryFn: async () => {
      let query = supabase
        .from('streamer_applications')
        .select(`
          *,
          game:games(name)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });
};

// Get own application (for users)
export const useOwnApplication = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['own-application', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('streamer_applications')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Get audit logs
export const useAdminAuditLogs = () => {
  return useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
};

// Admin actions mutations
export const useApproveApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId, notes }: { applicationId: string; notes?: string }) => {
      const { error } = await supabase.rpc('approve_streamer_application', {
        p_application_id: applicationId,
        p_notes: notes || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streamer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Application approved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useRejectApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId, notes }: { applicationId: string; notes?: string }) => {
      const { error } = await supabase.rpc('reject_streamer_application', {
        p_application_id: applicationId,
        p_notes: notes || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streamer-applications'] });
      toast.success('Application rejected');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const { error } = await supabase.rpc('suspend_user', {
        p_user_id: userId,
        p_reason: reason || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User suspended');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUnsuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('unsuspend_user', { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User unsuspended');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useSetUserVerified = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      const { error } = await supabase.rpc('set_user_verified', {
        p_user_id: userId,
        p_verified: verified
      });
      if (error) throw error;
    },
    onSuccess: (_, { verified }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(verified ? 'User verified' : 'User unverified');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useAdminEndStream = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (streamId: string) => {
      const { error } = await supabase.rpc('admin_end_stream', { p_stream_id: streamId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-streams'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Stream ended');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useAdminSetStreamHidden = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ streamId, hidden }: { streamId: string; hidden: boolean }) => {
      const { error } = await supabase.rpc('admin_set_stream_hidden', {
        p_stream_id: streamId,
        p_hidden: hidden
      });
      if (error) throw error;
    },
    onSuccess: (_, { hidden }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-streams'] });
      toast.success(hidden ? 'Stream hidden' : 'Stream visible');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useAdminDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase.rpc('admin_delete_message', { p_message_id: messageId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat'] });
      toast.success('Message deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useAdminGlobalMute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason, durationHours }: { userId: string; reason?: string; durationHours?: number }) => {
      const { error } = await supabase.rpc('admin_global_mute', {
        p_user_id: userId,
        p_reason: reason || null,
        p_duration_hours: durationHours || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User globally muted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useAdminGlobalUnmute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('admin_global_unmute', { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User unmuted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

// Submit streamer application (for users)
export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      username: string;
      bio: string;
      primary_game_id?: string;
      socials?: Record<string, string>;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('streamer_applications')
        .insert({
          user_id: user.user.id,
          username: data.username,
          bio: data.bio,
          primary_game_id: data.primary_game_id || null,
          socials: data.socials || {},
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['own-application'] });
      toast.success('Application submitted!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

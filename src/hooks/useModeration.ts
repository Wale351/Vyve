import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Check if current user is the streamer
export const useIsStreamOwner = (streamId: string | undefined, userId: string | undefined) => {
  return useQuery({
    queryKey: ['stream-owner', streamId, userId],
    queryFn: async () => {
      if (!streamId || !userId) return false;
      
      const { data, error } = await supabase
        .from('streams')
        .select('streamer_id')
        .eq('id', streamId)
        .single();

      if (error) return false;
      return data.streamer_id === userId;
    },
    enabled: !!streamId && !!userId,
  });
};

// Get muted users for a stream
export const useMutedUsers = (streamId: string | undefined) => {
  return useQuery({
    queryKey: ['muted-users', streamId],
    queryFn: async () => {
      if (!streamId) return [];
      
      const { data, error } = await supabase
        .from('stream_muted_users')
        .select('muted_user_id')
        .eq('stream_id', streamId);

      if (error) throw error;
      return data.map(m => m.muted_user_id);
    },
    enabled: !!streamId,
  });
};

// Get blocked users for a streamer
export const useBlockedUsers = (streamerId: string | undefined) => {
  return useQuery({
    queryKey: ['blocked-users', streamerId],
    queryFn: async () => {
      if (!streamerId) return [];
      
      const { data, error } = await supabase
        .from('streamer_blocked_users')
        .select('blocked_user_id')
        .eq('streamer_id', streamerId);

      if (error) throw error;
      return data.map(b => b.blocked_user_id);
    },
    enabled: !!streamerId,
  });
};

// Mute a user in a stream
export const useMuteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      streamId, 
      mutedUserId, 
      mutedBy,
      reason 
    }: { 
      streamId: string; 
      mutedUserId: string; 
      mutedBy: string;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from('stream_muted_users')
        .insert({
          stream_id: streamId,
          muted_user_id: mutedUserId,
          muted_by: mutedBy,
          reason,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['muted-users', variables.streamId] });
      toast.success('User muted from chat');
    },
    onError: () => {
      toast.error('Failed to mute user');
    },
  });
};

// Unmute a user
export const useUnmuteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, mutedUserId }: { streamId: string; mutedUserId: string }) => {
      const { error } = await supabase
        .from('stream_muted_users')
        .delete()
        .eq('stream_id', streamId)
        .eq('muted_user_id', mutedUserId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['muted-users', variables.streamId] });
      toast.success('User unmuted');
    },
    onError: () => {
      toast.error('Failed to unmute user');
    },
  });
};

// Block a user from all streams
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      streamerId, 
      blockedUserId,
      reason 
    }: { 
      streamerId: string; 
      blockedUserId: string;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from('streamer_blocked_users')
        .insert({
          streamer_id: streamerId,
          blocked_user_id: blockedUserId,
          reason,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users', variables.streamerId] });
      toast.success('User blocked from your streams');
    },
    onError: () => {
      toast.error('Failed to block user');
    },
  });
};

// Unblock a user
export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamerId, blockedUserId }: { streamerId: string; blockedUserId: string }) => {
      const { error } = await supabase
        .from('streamer_blocked_users')
        .delete()
        .eq('streamer_id', streamerId)
        .eq('blocked_user_id', blockedUserId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users', variables.streamerId] });
      toast.success('User unblocked');
    },
    onError: () => {
      toast.error('Failed to unblock user');
    },
  });
};

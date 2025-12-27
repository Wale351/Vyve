import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from './useWalletAuth';
import { toast } from 'sonner';

export interface NotificationPreference {
  id: string;
  user_id: string;
  streamer_id: string;
  notify_on_live: boolean;
  created_at: string;
  updated_at: string;
}

// Check if user has notifications enabled for a specific streamer
export const useNotificationPreference = (streamerId: string | undefined) => {
  const { user } = useWalletAuth();

  return useQuery({
    queryKey: ['notification-preference', user?.id, streamerId],
    queryFn: async (): Promise<NotificationPreference | null> => {
      if (!user?.id || !streamerId) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('streamer_id', streamerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!streamerId,
  });
};

// Toggle notification preference for a streamer
export const useToggleNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();

  return useMutation({
    mutationFn: async ({ streamerId, enabled }: { streamerId: string; enabled: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');

      if (enabled) {
        // Enable notifications
        const { error } = await supabase
          .from('notification_preferences')
          .upsert({
            user_id: user.id,
            streamer_id: streamerId,
            notify_on_live: true,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,streamer_id' });

        if (error) throw error;
      } else {
        // Disable by deleting the preference
        const { error } = await supabase
          .from('notification_preferences')
          .delete()
          .eq('user_id', user.id)
          .eq('streamer_id', streamerId);

        if (error) throw error;
      }
    },
    onSuccess: (_, { streamerId, enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['notification-preference', user?.id, streamerId] });
      toast.success(enabled ? 'Notifications enabled' : 'Notifications disabled');
    },
    onError: (error) => {
      console.error('Toggle notifications error:', error);
      toast.error('Failed to update notification settings');
    },
  });
};

// Get all streamers the user has notifications enabled for
export const useMyNotificationSubscriptions = () => {
  const { user } = useWalletAuth();

  return useQuery({
    queryKey: ['notification-subscriptions', user?.id],
    queryFn: async (): Promise<NotificationPreference[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('notify_on_live', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
};

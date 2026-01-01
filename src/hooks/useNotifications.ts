import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from './useWalletAuth';

export interface Notification {
  id: string;
  type: 'new_follower' | 'tip_received' | 'stream_live';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: {
    user_id?: string;
    username?: string;
    avatar_url?: string;
    amount?: number;
    stream_id?: string;
  };
}

// Fetch which notifications have been read
const useNotificationReads = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['notification-reads', userId],
    queryFn: async () => {
      if (!userId) return new Set<string>();

      const { data } = await supabase
        .from('notification_reads')
        .select('notification_key')
        .eq('user_id', userId);

      return new Set(data?.map(r => r.notification_key) || []);
    },
    enabled: !!userId,
  });
};

// Generate notifications from follows and tips
export const useNotifications = () => {
  const { user } = useWalletAuth();
  const { data: readKeys = new Set<string>() } = useNotificationReads(user?.id);

  return useQuery({
    queryKey: ['notifications', user?.id, Array.from(readKeys)],
    queryFn: async (): Promise<Notification[]> => {
      if (!user?.id) return [];

      const notifications: Notification[] = [];

      // Fetch recent followers (last 7 days)
      const { data: followers } = await supabase
        .from('follows')
        .select(`
          id,
          created_at,
          follower_id,
          follower:public_profiles!follows_follower_id_fkey(id, username, avatar_url)
        `)
        .eq('following_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (followers) {
        followers.forEach((follow: any) => {
          const followerProfile = follow.follower;
          const notificationKey = `follow_${follow.id}`;
          notifications.push({
            id: notificationKey,
            type: 'new_follower',
            title: 'New Follower',
            message: `${followerProfile?.username || 'Someone'} started following you`,
            read: readKeys.has(notificationKey),
            created_at: follow.created_at,
            data: {
              user_id: follow.follower_id,
              username: followerProfile?.username,
              avatar_url: followerProfile?.avatar_url,
            },
          });
        });
      }

      // Fetch recent tips received (last 7 days)
      const { data: tips } = await supabase
        .from('tips')
        .select(`
          id,
          created_at,
          amount_eth,
          sender_id,
          sender:public_profiles!tips_sender_id_fkey(id, username, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (tips) {
        tips.forEach((tip: any) => {
          const senderProfile = tip.sender;
          const notificationKey = `tip_${tip.id}`;
          notifications.push({
            id: notificationKey,
            type: 'tip_received',
            title: 'Tip Received',
            message: `${senderProfile?.username || 'Someone'} tipped you ${tip.amount_eth} ETH`,
            read: readKeys.has(notificationKey),
            created_at: tip.created_at,
            data: {
              user_id: tip.sender_id,
              username: senderProfile?.username,
              avatar_url: senderProfile?.avatar_url,
              amount: tip.amount_eth,
            },
          });
        });
      }

      // Sort all notifications by date
      notifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return notifications.slice(0, 20);
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });
};

export const useUnreadCount = () => {
  const { data: notifications } = useNotifications();
  return notifications?.filter(n => !n.read).length || 0;
};

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();

  return useMutation({
    mutationFn: async (notificationKeys: string[]) => {
      if (!user?.id || notificationKeys.length === 0) return;

      // Deduplicate keys to prevent "ON CONFLICT DO UPDATE cannot affect row a second time" error
      const uniqueKeys = [...new Set(notificationKeys)];

      // Insert read records for each unique notification
      const records = uniqueKeys.map(key => ({
        user_id: user.id,
        notification_key: key,
      }));

      const { error } = await supabase
        .from('notification_reads')
        .upsert(records, { onConflict: 'user_id,notification_key' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-reads'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

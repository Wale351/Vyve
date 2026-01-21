import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StreamTip {
  id: string;
  stream_id: string;
  sender_id: string;
  receiver_id: string;
  amount_eth: number;
  created_at: string;
  sender_username?: string;
}

// Fetch tips for a stream (only for streamer)
export const useStreamTips = (streamId: string | undefined, streamerId: string | undefined, userId: string | undefined) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  // Only fetch if the current user is the streamer
  const isStreamer = streamerId && userId && streamerId === userId;

  const query = useQuery({
    queryKey: ['stream-tips', streamId],
    queryFn: async () => {
      if (!streamId || !isStreamer) return [];
      
      // Fetch tips for this stream
      const { data: tips, error } = await supabase
        .from('tips')
        .select('id, stream_id, sender_id, receiver_id, amount_eth, created_at')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (!tips?.length) return [];
      
      // Fetch sender usernames
      const senderIds = [...new Set(tips.map(t => t.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', senderIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || []);
      
      return tips.map(tip => ({
        ...tip,
        sender_username: profileMap.get(tip.sender_id) || 'Anonymous',
      })) as StreamTip[];
    },
    enabled: !!streamId && !!isStreamer,
    staleTime: Infinity,
  });

  // Real-time subscription for new tips
  useEffect(() => {
    if (!streamId || !isStreamer) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`tips-realtime-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tips',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          const newTip = payload.new as any;
          console.log('[StreamTips] New tip received:', newTip.id);
          
          // Fetch sender username
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', newTip.sender_id)
            .maybeSingle();

          const enrichedTip: StreamTip = {
            id: newTip.id,
            stream_id: newTip.stream_id,
            sender_id: newTip.sender_id,
            receiver_id: newTip.receiver_id,
            amount_eth: newTip.amount_eth,
            created_at: newTip.created_at,
            sender_username: profile?.username || 'Anonymous',
          };

          queryClient.setQueryData<StreamTip[]>(
            ['stream-tips', streamId],
            (old) => [...(old || []), enrichedTip]
          );
        }
      )
      .subscribe((status) => {
        console.log('[StreamTips] Realtime subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [streamId, isStreamer, queryClient]);

  return query;
};

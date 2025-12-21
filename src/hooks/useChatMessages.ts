import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessageWithSender {
  id: string;
  stream_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  profiles: {
    username: string | null;
    wallet_address: string;
  } | null;
}

export const useChatMessages = (streamId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chat', streamId],
    queryFn: async () => {
      if (!streamId) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!chat_messages_sender_id_fkey (
            username,
            wallet_address
          )
        `)
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data as ChatMessageWithSender[];
    },
    enabled: !!streamId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!streamId) return;

    const channel = supabase
      .channel(`chat-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          // Fetch the new message with profile data
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profiles!chat_messages_sender_id_fkey (
                username,
                wallet_address
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            queryClient.setQueryData<ChatMessageWithSender[]>(
              ['chat', streamId],
              (old) => [...(old || []), data as ChatMessageWithSender]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId, queryClient]);

  return query;
};

const MAX_MESSAGE_LENGTH = 500;

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async ({
      streamId,
      senderId,
      message,
    }: {
      streamId: string;
      senderId: string;
      message: string;
    }) => {
      // Client-side validation
      const trimmedMessage = message.trim();
      
      if (!trimmedMessage) {
        throw new Error('Message cannot be empty');
      }
      
      if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        throw new Error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
      }

      const { error } = await supabase.from('chat_messages').insert({
        stream_id: streamId,
        sender_id: senderId,
        message: trimmedMessage,
      });

      if (error) {
        // Handle rate limit error
        if (error.message.includes('rate') || error.code === '42501') {
          throw new Error('You are sending messages too quickly. Please wait a moment.');
        }
        throw error;
      }
    },
  });
};

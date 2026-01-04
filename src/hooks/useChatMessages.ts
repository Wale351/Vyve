import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mapDatabaseError } from '@/lib/errorHandler';

export interface ChatMessageWithSender {
  id: string;
  stream_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
}

export const useChatMessages = (streamId: string | undefined) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
            avatar_url
          )
        `)
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data as unknown as ChatMessageWithSender[];
    },
    enabled: !!streamId,
    staleTime: Infinity, // Don't refetch - rely on realtime
  });

  // Real-time subscription with instant updates
  useEffect(() => {
    if (!streamId) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`chat-realtime-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          console.log('[Chat] Realtime message received:', newMsg.id);
          
          // Check if this message is already in the cache (from optimistic update)
          const currentMessages = queryClient.getQueryData<ChatMessageWithSender[]>(['chat', streamId]) || [];
          const exists = currentMessages.some(m => m.id === newMsg.id);
          
          if (exists) {
            console.log('[Chat] Message already exists (optimistic), skipping');
            return;
          }

          // Fetch the message with profile data for non-optimistic messages
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profiles!chat_messages_sender_id_fkey (
                username,
                avatar_url
              )
            `)
            .eq('id', newMsg.id)
            .single();

          if (data) {
            queryClient.setQueryData<ChatMessageWithSender[]>(
              ['chat', streamId],
              (old) => [...(old || []), data as unknown as ChatMessageWithSender]
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('[Chat] Realtime subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [streamId, queryClient]);

  return query;
};

const MAX_MESSAGE_LENGTH = 500;

interface SendMessageParams {
  streamId: string;
  senderId: string;
  message: string;
  senderProfile?: {
    username: string;
    avatar_url: string | null;
  };
}

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      streamId,
      senderId,
      message,
    }: SendMessageParams) => {
      const trimmedMessage = message.trim();
      
      if (!trimmedMessage) {
        throw new Error('Message cannot be empty');
      }
      
      if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        throw new Error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          stream_id: streamId,
          sender_id: senderId,
          message: trimmedMessage,
        })
        .select()
        .single();

      if (error) {
        const appError = mapDatabaseError(error);
        throw new Error(appError.userMessage);
      }

      return data;
    },
    // Optimistic update for instant UI feedback
    onMutate: async ({ streamId, senderId, message, senderProfile }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat', streamId] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<ChatMessageWithSender[]>(['chat', streamId]);

      // Create optimistic message
      const optimisticMessage: ChatMessageWithSender = {
        id: `optimistic-${Date.now()}`,
        stream_id: streamId,
        sender_id: senderId,
        message: message.trim(),
        created_at: new Date().toISOString(),
        profiles: senderProfile || null,
      };

      // Optimistically add to cache
      queryClient.setQueryData<ChatMessageWithSender[]>(
        ['chat', streamId],
        (old) => [...(old || []), optimisticMessage]
      );

      return { previousMessages, optimisticId: optimisticMessage.id };
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic message with real one
      if (context?.optimisticId && data) {
        queryClient.setQueryData<ChatMessageWithSender[]>(
          ['chat', variables.streamId],
          (old) => {
            if (!old) return [data as unknown as ChatMessageWithSender];
            return old.map(msg => 
              msg.id === context.optimisticId 
                ? { ...data, profiles: msg.profiles } as ChatMessageWithSender
                : msg
            );
          }
        );
      }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', variables.streamId], context.previousMessages);
      }
    },
  });
};

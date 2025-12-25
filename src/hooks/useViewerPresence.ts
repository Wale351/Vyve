import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePrivyAuth } from './usePrivyAuth';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ViewerPresence {
  viewerCount: number;
  isConnected: boolean;
}

export const useViewerPresence = (streamId: string | undefined): ViewerPresence => {
  const { user } = usePrivyAuth();
  const [viewerCount, setViewerCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const updateViewerCount = useCallback(async (count: number) => {
    if (!streamId) return;
    
    // Update viewer count in database (fire and forget)
    try {
      await supabase
        .from('streams')
        .update({ viewer_count: count })
        .eq('id', streamId);
    } catch (error) {
      console.error('[ViewerPresence] Error updating viewer count:', error);
    }
  }, [streamId]);

  useEffect(() => {
    if (!streamId) return;

    let channel: RealtimeChannel | null = null;

    const setupPresence = async () => {
      // Create a unique channel for this stream's viewers
      channel = supabase.channel(`stream-viewers:${streamId}`, {
        config: {
          presence: {
            key: user?.id || `anonymous-${Math.random().toString(36).slice(2)}`,
          },
        },
      });

      // Track presence state changes
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel?.presenceState() || {};
          const count = Object.keys(state).length;
          console.log('[ViewerPresence] Sync - Viewer count:', count);
          setViewerCount(count);
          updateViewerCount(count);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('[ViewerPresence] Join:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('[ViewerPresence] Leave:', key, leftPresences);
        });

      // Subscribe and track presence
      const status = await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          
          // Track this user's presence
          await channel?.track({
            user_id: user?.id || 'anonymous',
            online_at: new Date().toISOString(),
          });
          
          console.log('[ViewerPresence] Subscribed and tracking');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.log('[ViewerPresence] Channel closed or error:', status);
        }
      });
    };

    setupPresence();

    // Cleanup on unmount
    return () => {
      if (channel) {
        console.log('[ViewerPresence] Cleaning up channel');
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, [streamId, user?.id, updateViewerCount]);

  return { viewerCount, isConnected };
};

// Hook to subscribe to stream updates (for viewers who want to see real-time changes)
export const useStreamRealtime = (streamId: string | undefined) => {
  const [stream, setStream] = useState<{
    viewer_count: number;
    is_live: boolean;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (!streamId) return;

    // Subscribe to stream changes
    const channel = supabase
      .channel(`stream-updates:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'streams',
          filter: `id=eq.${streamId}`,
        },
        (payload) => {
          console.log('[StreamRealtime] Stream updated:', payload.new);
          setStream({
            viewer_count: payload.new.viewer_count,
            is_live: payload.new.is_live,
            title: payload.new.title,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  return stream;
};
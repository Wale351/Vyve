import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStreamTipTotal = (streamId: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: ['stream-tip-total', streamId],
    queryFn: async () => {
      if (!streamId) return 0;
      const { data, error } = await supabase.rpc('get_stream_tip_total', {
        p_stream_id: streamId,
      });
      if (error) throw error;
      return Number(data ?? 0);
    },
    enabled: !!streamId && enabled,
    refetchInterval: enabled ? 5000 : false,
  });
};

export const useSetStreamTipGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      streamId,
      enabled,
      title,
      amountEth,
    }: {
      streamId: string;
      enabled: boolean;
      title?: string;
      amountEth?: number | null;
    }) => {
      const { error } = await supabase
        .from('streams')
        .update({
          tip_goal_enabled: enabled,
          tip_goal_title: title ?? null,
          tip_goal_amount_eth: amountEth ?? null,
        })
        .eq('id', streamId);

      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['streams', vars.streamId] });
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast.success('Tip goal updated');
    },
    onError: (error) => {
      console.error('Set tip goal error:', error);
      toast.error('Failed to update tip goal');
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityUpdateData {
  name?: string;
  description?: string;
  short_description?: string;
  rules?: string;
  is_nft_gated?: boolean;
  nft_contract_address?: string | null;
  is_ens_gated?: boolean;
  required_ens_suffix?: string | null;
  banner_url?: string | null;
  avatar_url?: string | null;
}

export function useUpdateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityId, data }: { communityId: string; data: CommunityUpdateData }) => {
      const { data: community, error } = await supabase
        .from('communities')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', communityId)
        .select()
        .single();

      if (error) throw error;
      return community;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useDeleteCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: string) => {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

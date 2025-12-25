import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ followerId, followingId }: { followerId: string; followingId: string }) => {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId,
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Already following this user');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['follows'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast.success('Following!');
    },
    onError: (error: Error) => {
      console.error('Follow error:', error);
      toast.error(error.message || 'Failed to follow');
    },
  });
};

export const useUnfollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ followerId, followingId }: { followerId: string; followingId: string }) => {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast.success('Unfollowed');
    },
    onError: (error) => {
      console.error('Unfollow error:', error);
      toast.error('Failed to unfollow');
    },
  });
};

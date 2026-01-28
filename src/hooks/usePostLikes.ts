import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from './useWalletAuth';
import { toast } from 'sonner';

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export function usePostLikes(postId: string) {
  const { user } = useWalletAuth();

  return useQuery({
    queryKey: ['post-likes', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_post_likes')
        .select('*')
        .eq('post_id', postId);

      if (error) throw error;
      return data as PostLike[];
    },
    enabled: !!postId,
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user?.id) throw new Error('Must be logged in to like posts');

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('community_post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
      }

      return { postId, isLiked: !isLiked };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['post-likes', data.postId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

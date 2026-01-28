import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from '@/hooks/useWalletAuth';

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          author:public_profiles!community_comments_author_id_fkey(id, username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as PostComment[];
    },
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();

  return useMutation({
    mutationFn: async (data: { post_id: string; content: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: comment, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: data.post_id,
          author_id: user.id,
          content: data.content,
        })
        .select(`
          *,
          author:public_profiles!community_comments_author_id_fkey(id, username, avatar_url)
        `)
        .single();

      if (error) throw error;
      return comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', variables.post_id] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return { postId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', data.postId] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content, image_url }: { postId: string; content: string; image_url?: string | null }) => {
      const { data, error } = await supabase
        .from('community_posts')
        .update({ content, image_url, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', data.community_id] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, communityId }: { postId: string; communityId: string }) => {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      return { communityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', data.communityId] });
    },
  });
}

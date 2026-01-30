import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from './useWalletAuth';
import { toast } from 'sonner';

export interface Giveaway {
  id: string;
  title: string;
  description: string | null;
  prizeAmount: number | null;
  prizeType: string | null;
  endsAt: string | null;
  isActive: boolean;
  postId: string;
  winnerId: string | null;
  createdAt: string;
  entries: number;
  hasEntered: boolean;
}

export const useCommunityGiveaways = (communityId: string) => {
  const { user } = useWalletAuth();

  return useQuery({
    queryKey: ['community-giveaways', communityId],
    queryFn: async (): Promise<Giveaway[]> => {
      // Get giveaways via community_posts
      const { data: posts, error: postsError } = await supabase
        .from('community_posts')
        .select('id')
        .eq('community_id', communityId)
        .eq('post_type', 'giveaway');

      if (postsError) throw postsError;
      if (!posts?.length) return [];

      const postIds = posts.map(p => p.id);

      // Get giveaways for these posts
      const { data: giveaways, error: giveawaysError } = await supabase
        .from('community_giveaways')
        .select('*')
        .in('post_id', postIds)
        .order('created_at', { ascending: false });

      if (giveawaysError) throw giveawaysError;
      if (!giveaways?.length) return [];

      // Get all entries for these giveaways
      const giveawayIds = giveaways.map(g => g.id);
      const { data: allEntries, error: entriesError } = await supabase
        .from('community_giveaway_entries')
        .select('giveaway_id, user_id')
        .in('giveaway_id', giveawayIds);

      if (entriesError) throw entriesError;

      // Build giveaway data with entry counts
      return giveaways.map(giveaway => {
        const giveawayEntries = allEntries?.filter(e => e.giveaway_id === giveaway.id) || [];
        const hasEntered = user?.id 
          ? giveawayEntries.some(e => e.user_id === user.id)
          : false;

        return {
          id: giveaway.id,
          title: giveaway.title,
          description: giveaway.description,
          prizeAmount: giveaway.prize_amount,
          prizeType: giveaway.prize_type,
          endsAt: giveaway.ends_at,
          isActive: giveaway.is_active ?? true,
          postId: giveaway.post_id,
          winnerId: giveaway.winner_id,
          createdAt: giveaway.created_at || new Date().toISOString(),
          entries: giveawayEntries.length,
          hasEntered,
        };
      });
    },
    enabled: !!communityId,
  });
};

export const useEnterGiveaway = () => {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();

  return useMutation({
    mutationFn: async ({ giveawayId, communityId }: { giveawayId: string; communityId: string }) => {
      if (!user?.id) throw new Error('Must be logged in to enter');

      // Check if already entered
      const { data: existingEntry } = await supabase
        .from('community_giveaway_entries')
        .select('id')
        .eq('giveaway_id', giveawayId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingEntry) {
        throw new Error('You have already entered this giveaway');
      }

      // Check if giveaway is still active
      const { data: giveaway } = await supabase
        .from('community_giveaways')
        .select('is_active, ends_at')
        .eq('id', giveawayId)
        .single();

      if (!giveaway?.is_active) {
        throw new Error('This giveaway is no longer active');
      }

      if (giveaway.ends_at && new Date(giveaway.ends_at) < new Date()) {
        throw new Error('This giveaway has ended');
      }

      // Enter giveaway
      const { error } = await supabase
        .from('community_giveaway_entries')
        .insert({
          giveaway_id: giveawayId,
          user_id: user.id,
        });

      if (error) throw error;

      return { giveawayId, communityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-giveaways', data.communityId] });
      toast.success('You have entered the giveaway!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCreateGiveaway = () => {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();

  return useMutation({
    mutationFn: async ({
      communityId,
      title,
      description,
      prizeAmount,
      prizeType,
      endsAt,
      giveawayType,
    }: {
      communityId: string;
      title: string;
      description?: string;
      prizeAmount?: number;
      prizeType?: string;
      endsAt?: Date;
      giveawayType?: 'raffle' | 'action';
    }) => {
      if (!user?.id) throw new Error('Must be logged in');

      // Ensure prize_type is lowercase to match DB constraint
      const normalizedPrizeType = prizeType?.toLowerCase() as 'eth' | 'nft' | 'other' | undefined;

      // Create a post for the giveaway
      const { data: post, error: postError } = await supabase
        .from('community_posts')
        .insert({
          community_id: communityId,
          author_id: user.id,
          content: title,
          post_type: 'giveaway',
        })
        .select()
        .single();

      if (postError) throw postError;

      // Create the giveaway
      const { data: giveaway, error: giveawayError } = await supabase
        .from('community_giveaways')
        .insert({
          post_id: post.id,
          title,
          description: description || null,
          prize_amount: prizeAmount || null,
          prize_type: normalizedPrizeType || null,
          ends_at: endsAt?.toISOString() || null,
          is_active: true,
        })
        .select()
        .single();

      if (giveawayError) throw giveawayError;

      return { giveaway, communityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-giveaways', data.communityId] });
      queryClient.invalidateQueries({ queryKey: ['community-posts', data.communityId] });
      toast.success('Giveaway created!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

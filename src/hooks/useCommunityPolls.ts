import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from './useWalletAuth';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface PollOption {
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsAt: string | null;
  isActive: boolean;
  userVotedIndex: number | null;
  postId: string;
  createdAt: string;
}

// Parse options from JSON and calculate vote counts
const parseOptions = (optionsJson: Json, voteCounts: Record<number, number>): PollOption[] => {
  if (!Array.isArray(optionsJson)) return [];
  return optionsJson.map((opt, index) => ({
    label: typeof opt === 'string' ? opt : (opt as { label?: string })?.label || `Option ${index + 1}`,
    votes: voteCounts[index] || 0,
  }));
};

export const useCommunityPolls = (communityId: string) => {
  const { user } = useWalletAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['community-polls', communityId],
    queryFn: async (): Promise<Poll[]> => {
      // Get polls via community_posts
      const { data: posts, error: postsError } = await supabase
        .from('community_posts')
        .select('id')
        .eq('community_id', communityId)
        .eq('post_type', 'poll');

      if (postsError) throw postsError;
      if (!posts?.length) return [];

      const postIds = posts.map(p => p.id);

      // Get polls for these posts
      const { data: polls, error: pollsError } = await supabase
        .from('community_polls')
        .select('*')
        .in('post_id', postIds)
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;
      if (!polls?.length) return [];

      // Get all votes for these polls
      const pollIds = polls.map(p => p.id);
      const { data: allVotes, error: votesError } = await supabase
        .from('community_poll_votes')
        .select('poll_id, option_index, user_id')
        .in('poll_id', pollIds);

      if (votesError) throw votesError;

      // Build poll data with vote counts
      return polls.map(poll => {
        const pollVotes = allVotes?.filter(v => v.poll_id === poll.id) || [];
        const voteCounts: Record<number, number> = {};
        let userVotedIndex: number | null = null;

        pollVotes.forEach(vote => {
          voteCounts[vote.option_index] = (voteCounts[vote.option_index] || 0) + 1;
          if (user?.id && vote.user_id === user.id) {
            userVotedIndex = vote.option_index;
          }
        });

        const options = parseOptions(poll.options, voteCounts);
        const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

        return {
          id: poll.id,
          question: poll.question,
          options,
          totalVotes,
          endsAt: poll.ends_at,
          isActive: poll.is_active ?? true,
          userVotedIndex,
          postId: poll.post_id,
          createdAt: poll.created_at || new Date().toISOString(),
        };
      });
    },
    enabled: !!communityId,
  });

  // Real-time subscription for vote updates
  useEffect(() => {
    if (!communityId) return;

    const channel = supabase
      .channel(`polls-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_poll_votes',
        },
        () => {
          // Invalidate and refetch polls when votes change
          queryClient.invalidateQueries({ queryKey: ['community-polls', communityId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, queryClient]);

  return query;
};

export const useVoteOnPoll = () => {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();

  return useMutation({
    mutationFn: async ({ pollId, optionIndex, communityId }: { 
      pollId: string; 
      optionIndex: number;
      communityId: string;
    }) => {
      if (!user?.id) throw new Error('Must be logged in to vote');

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('community_poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        throw new Error('You have already voted on this poll');
      }

      // Check if poll is still active
      const { data: poll } = await supabase
        .from('community_polls')
        .select('is_active, ends_at')
        .eq('id', pollId)
        .single();

      if (!poll?.is_active) {
        throw new Error('This poll is no longer active');
      }

      if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
        throw new Error('This poll has ended');
      }

      // Submit vote
      const { error } = await supabase
        .from('community_poll_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          option_index: optionIndex,
        });

      if (error) throw error;

      return { pollId, optionIndex, communityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-polls', data.communityId] });
      toast.success('Vote recorded!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCreatePoll = () => {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();

  return useMutation({
    mutationFn: async ({ 
      communityId, 
      question, 
      options, 
      endsAt 
    }: { 
      communityId: string;
      question: string;
      options: string[];
      endsAt?: Date;
    }) => {
      if (!user?.id) throw new Error('Must be logged in');

      // Create a post for the poll
      const { data: post, error: postError } = await supabase
        .from('community_posts')
        .insert({
          community_id: communityId,
          author_id: user.id,
          content: question,
          post_type: 'poll',
        })
        .select()
        .single();

      if (postError) throw postError;

      // Create the poll
      const { data: poll, error: pollError } = await supabase
        .from('community_polls')
        .insert({
          post_id: post.id,
          question,
          options: options as unknown as Json,
          ends_at: endsAt?.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (pollError) throw pollError;

      return { poll, communityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-polls', data.communityId] });
      toast.success('Poll created!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

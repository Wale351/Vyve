import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from '@/hooks/useWalletAuth';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  banner_url: string | null;
  avatar_url: string | null;
  owner_id: string;
  rules: string | null;
  is_nft_gated: boolean;
  nft_contract_address: string | null;
  is_ens_gated: boolean;
  required_ens_suffix: string | null;
  member_count: number;
  is_active: boolean;
  created_at: string;
  owner?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  is_member?: boolean;
  has_live_stream?: boolean;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  post_type: 'post' | 'announcement' | 'stream_alert' | 'poll' | 'giveaway';
  is_pinned: boolean;
  reactions: Record<string, string[]>;
  created_at: string;
  author?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export function useCommunities(searchQuery?: string) {
  const { user } = useWalletAuth();

  return useQuery({
    queryKey: ['communities', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('communities')
        .select(`
          *,
          owner:public_profiles!communities_owner_id_fkey(id, username, avatar_url)
        `)
        .eq('is_active', true)
        .order('member_count', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Check membership status if user is logged in
      if (user?.id && data) {
        const { data: memberships } = await supabase
          .from('community_memberships')
          .select('community_id')
          .eq('user_id', user.id);

        const memberCommunityIds = new Set(memberships?.map(m => m.community_id) || []);

        return data.map(c => ({
          ...c,
          is_member: memberCommunityIds.has(c.id) || c.owner_id === user.id
        })) as Community[];
      }

      return data as Community[];
    },
  });
}

export function useCommunity(slug: string) {
  const { user } = useWalletAuth();

  return useQuery({
    queryKey: ['community', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          owner:public_profiles!communities_owner_id_fkey(id, username, avatar_url)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;

      // Check membership
      let is_member = data.owner_id === user?.id;
      if (user?.id && !is_member) {
        const { data: membership } = await supabase
          .from('community_memberships')
          .select('id')
          .eq('community_id', data.id)
          .eq('user_id', user.id)
          .maybeSingle();

        is_member = !!membership;
      }

      return { ...data, is_member } as Community;
    },
    enabled: !!slug,
  });
}

export function useCommunityPosts(communityId: string) {
  return useQuery({
    queryKey: ['community-posts', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:public_profiles!community_posts_author_id_fkey(id, username, avatar_url)
        `)
        .eq('community_id', communityId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CommunityPost[];
    },
    enabled: !!communityId,
  });
}

export function useCommunityMembers(communityId: string) {
  return useQuery({
    queryKey: ['community-members', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_memberships')
        .select(`
          *,
          user:public_profiles!community_memberships_user_id_fkey(id, username, avatar_url, verified_creator)
        `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!communityId,
  });
}

export function useJoinCommunity() {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();

  return useMutation({
    mutationFn: async ({ communityId, slug }: { communityId: string; slug: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if already a member
      const { data: existing } = await supabase
        .from('community_memberships')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        return { alreadyMember: true };
      }

      const { error } = await supabase
        .from('community_memberships')
        .insert({ community_id: communityId, user_id: user.id });

      if (error) throw error;
      return { alreadyMember: false };
    },
    onSuccess: (_, variables) => {
      // Invalidate with exact query keys for immediate UI update
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community', variables.slug] });
      queryClient.invalidateQueries({ queryKey: ['community-members', variables.communityId] });
    },
  });
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();
  const { user } = useWalletAuth();

  return useMutation({
    mutationFn: async ({ communityId, slug }: { communityId: string; slug: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('community_memberships')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community', variables.slug] });
      queryClient.invalidateQueries({ queryKey: ['community-members', variables.communityId] });
    },
  });
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      short_description?: string;
      rules?: string;
      is_nft_gated?: boolean;
      nft_contract_address?: string;
      is_ens_gated?: boolean;
      required_ens_suffix?: string;
      banner_url?: string;
      avatar_url?: string;
      owner_id: string;
    }) => {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const { data: community, error } = await supabase
        .from('communities')
        .insert({ ...data, slug })
        .select()
        .single();

      if (error) throw error;
      return community;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      community_id: string;
      author_id: string;
      content: string;
      image_url?: string;
      post_type?: 'post' | 'announcement' | 'stream_alert' | 'poll' | 'giveaway';
      is_pinned?: boolean;
    }) => {
      const { data: post, error } = await supabase
        .from('community_posts')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return post;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', variables.community_id] });
    },
  });
}

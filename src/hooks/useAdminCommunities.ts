import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminCommunity {
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
  status: 'pending' | 'active' | 'suspended';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface CommunityReport {
  id: string;
  community_id: string;
  reporter_id: string;
  target_type: 'post' | 'comment' | 'community';
  target_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface AdminCommunityStats {
  total_communities: number;
  active_communities: number;
  pending_communities: number;
  suspended_communities: number;
  pending_reports: number;
  total_members: number;
}

// Get admin community stats
export const useAdminCommunityStats = () => {
  return useQuery({
    queryKey: ['admin-community-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_community_stats');
      if (error) throw error;
      return data as unknown as AdminCommunityStats;
    },
  });
};

// Get all communities for admin (including pending/suspended)
export const useAdminCommunities = (filters?: {
  status?: string;
  search?: string;
  gated?: 'all' | 'gated' | 'ungated';
}) => {
  return useQuery({
    queryKey: ['admin-communities', filters],
    queryFn: async () => {
      let query = supabase
        .from('communities')
        .select(`
          *,
          owner:public_profiles!communities_owner_id_fkey(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
      }

      if (filters?.gated === 'gated') {
        query = query.or('is_nft_gated.eq.true,is_ens_gated.eq.true');
      } else if (filters?.gated === 'ungated') {
        query = query.eq('is_nft_gated', false).eq('is_ens_gated', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AdminCommunity[];
    },
  });
};

// Get single community detail for admin
export const useAdminCommunityDetail = (communityId: string) => {
  return useQuery({
    queryKey: ['admin-community-detail', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          owner:public_profiles!communities_owner_id_fkey(id, username, avatar_url, verified_creator)
        `)
        .eq('id', communityId)
        .single();

      if (error) throw error;
      return data as AdminCommunity;
    },
    enabled: !!communityId,
  });
};

// Get community posts for admin
export const useAdminCommunityPosts = (communityId: string) => {
  return useQuery({
    queryKey: ['admin-community-posts', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:public_profiles!community_posts_author_id_fkey(id, username, avatar_url)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!communityId,
  });
};

// Get community members for admin
export const useAdminCommunityMembers = (communityId: string) => {
  return useQuery({
    queryKey: ['admin-community-members', communityId],
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
};

// Get community reports for admin
export const useAdminCommunityReports = (communityId?: string) => {
  return useQuery({
    queryKey: ['admin-community-reports', communityId],
    queryFn: async () => {
      let query = supabase
        .from('community_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch reporter info separately
      const reporterIds = [...new Set(data?.map(r => r.reporter_id) || [])];
      const { data: reporters } = await supabase
        .from('public_profiles')
        .select('id, username, avatar_url')
        .in('id', reporterIds);

      const reporterMap = new Map(reporters?.map(r => [r.id, r]) || []);

      return (data || []).map(report => ({
        ...report,
        reporter: reporterMap.get(report.reporter_id) || null,
      })) as CommunityReport[];
    },
  });
};

// Get audit logs for a community
export const useAdminCommunityAuditLogs = (communityId: string) => {
  return useQuery({
    queryKey: ['admin-community-audit-logs', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .eq('target_id', communityId)
        .or(`target_type.eq.community,target_type.eq.community_post,target_type.eq.community_membership,target_type.eq.community_report`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!communityId,
  });
};

// Approve community
export const useApproveCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityId, notes }: { communityId: string; notes?: string }) => {
      const { error } = await supabase.rpc('admin_approve_community', {
        p_community_id: communityId,
        p_notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-community-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-community-stats'] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      toast.success('Community approved');
    },
    onError: (error) => {
      console.error('Approve community error:', error);
      toast.error('Failed to approve community');
    },
  });
};

// Suspend community
export const useSuspendCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityId, reason }: { communityId: string; reason?: string }) => {
      const { error } = await supabase.rpc('admin_suspend_community', {
        p_community_id: communityId,
        p_reason: reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-community-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-community-stats'] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      toast.success('Community suspended');
    },
    onError: (error) => {
      console.error('Suspend community error:', error);
      toast.error('Failed to suspend community');
    },
  });
};

// Unsuspend community
export const useUnsuspendCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: string) => {
      const { error } = await supabase.rpc('admin_unsuspend_community', {
        p_community_id: communityId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-community-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-community-stats'] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      toast.success('Community unsuspended');
    },
    onError: (error) => {
      console.error('Unsuspend community error:', error);
      toast.error('Failed to unsuspend community');
    },
  });
};

// Delete community
export const useDeleteCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ communityId, reason }: { communityId: string; reason?: string }) => {
      const { error } = await supabase.rpc('admin_delete_community', {
        p_community_id: communityId,
        p_reason: reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-community-stats'] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      toast.success('Community deleted');
    },
    onError: (error) => {
      console.error('Delete community error:', error);
      toast.error('Failed to delete community');
    },
  });
};

// Delete community post
export const useAdminDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason?: string }) => {
      const { error } = await supabase.rpc('admin_delete_community_post', {
        p_post_id: postId,
        p_reason: reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success('Post deleted');
    },
    onError: (error) => {
      console.error('Delete post error:', error);
      toast.error('Failed to delete post');
    },
  });
};

// Pin/unpin community post
export const useAdminPinPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, pinned }: { postId: string; pinned: boolean }) => {
      const { error } = await supabase.rpc('admin_pin_community_post', {
        p_post_id: postId,
        p_pinned: pinned,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success('Post updated');
    },
    onError: (error) => {
      console.error('Pin post error:', error);
      toast.error('Failed to update post');
    },
  });
};

// Kick community member
export const useAdminKickMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ membershipId, reason }: { membershipId: string; reason?: string }) => {
      const { error } = await supabase.rpc('admin_kick_community_member', {
        p_membership_id: membershipId,
        p_reason: reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-community-members'] });
      queryClient.invalidateQueries({ queryKey: ['community-members'] });
      toast.success('Member removed');
    },
    onError: (error) => {
      console.error('Kick member error:', error);
      toast.error('Failed to remove member');
    },
  });
};

// Review community report
export const useAdminReviewReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, status, notes }: { reportId: string; status: string; notes?: string }) => {
      const { error } = await supabase.rpc('admin_review_community_report', {
        p_report_id: reportId,
        p_status: status,
        p_notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-community-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-community-stats'] });
      toast.success('Report reviewed');
    },
    onError: (error) => {
      console.error('Review report error:', error);
      toast.error('Failed to review report');
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'viewer' | 'streamer' | 'admin';

export interface Profile {
  id: string;
  wallet_address: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  verified_creator: boolean;
  avatar_last_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  verified_creator: boolean;
  role: UserRole;
  created_at: string;
}

// Fetch public profile by ID
export const useProfile = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error) throw error;
      return data as PublicProfile | null;
    },
    enabled: !!profileId,
  });
};

// Fetch own profile with full details (including wallet_address)
export const useOwnProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', 'own', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!userId,
  });
};

// Check if user has a completed profile
export const useProfileComplete = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', 'complete', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) return false;
      
      return !!(data?.username && data?.avatar_url);
    },
    enabled: !!userId,
  });
};

// Check if profile image can be updated (30 day cooldown)
export const useCanUpdateProfileImage = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', 'image-cooldown', userId],
    queryFn: async () => {
      if (!userId) return { canUpdate: false, nextUpdateDate: null };
      
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_last_updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return { canUpdate: true, nextUpdateDate: null };
      
      if (!data.avatar_last_updated_at) {
        return { canUpdate: true, nextUpdateDate: null };
      }
      
      const lastUpdate = new Date(data.avatar_last_updated_at);
      const nextUpdate = new Date(lastUpdate);
      nextUpdate.setDate(nextUpdate.getDate() + 30);
      
      const canUpdate = new Date() >= nextUpdate;
      
      return { 
        canUpdate, 
        nextUpdateDate: canUpdate ? null : nextUpdate 
      };
    },
    enabled: !!userId,
  });
};

export const useProfileById = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', 'id', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error) throw error;
      return data as PublicProfile | null;
    },
    enabled: !!profileId,
  });
};

export const useProfileTipsReceived = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['tips', 'received', profileId],
    queryFn: async () => {
      if (!profileId) return 0;
      
      const { data, error } = await supabase
        .from('tips')
        .select('amount_eth')
        .eq('receiver_id', profileId);

      if (error) throw error;
      
      const total = data?.reduce((sum, tip) => sum + Number(tip.amount_eth), 0) || 0;
      return total;
    },
    enabled: !!profileId,
  });
};

// Get follower count
export const useFollowerCount = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['followers', 'count', profileId],
    queryFn: async () => {
      if (!profileId) return 0;
      
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profileId,
  });
};

// Get following count
export const useFollowingCount = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['following', 'count', profileId],
    queryFn: async () => {
      if (!profileId) return 0;
      
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profileId,
  });
};

// Check if current user follows a profile
export const useIsFollowing = (currentUserId: string | undefined, profileId: string | undefined) => {
  return useQuery({
    queryKey: ['follows', currentUserId, profileId],
    queryFn: async () => {
      if (!currentUserId || !profileId) return false;
      
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', profileId)
        .maybeSingle();

      if (error) return false;
      return !!data;
    },
    enabled: !!currentUserId && !!profileId && currentUserId !== profileId,
  });
};

// Get user role from user_roles table
export const useUserRole = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-role', userId],
    queryFn: async () => {
      if (!userId) return 'viewer' as UserRole;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role')
        .limit(1)
        .maybeSingle();

      if (error || !data) return 'viewer' as UserRole;
      return data.role as UserRole;
    },
    enabled: !!userId,
  });
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchPublicProfile, fetchPublicProfileByUsername, fetchUserRole, PUBLIC_PROFILE_FIELDS } from '@/lib/profileHelpers';

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

// Fetch public profile by ID - uses profiles table directly
export const useProfile = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      return fetchPublicProfile(profileId);
    },
    enabled: !!profileId,
  });
};

// Fetch public profile by username (case-insensitive)
export const useProfileByUsername = (username: string | undefined) => {
  return useQuery({
    queryKey: ['profile', 'username', username?.toLowerCase()],
    queryFn: async () => {
      if (!username) return null;
      return fetchPublicProfileByUsername(username);
    },
    enabled: !!username,
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

// Alias for useProfile
export const useProfileById = (profileId: string | undefined) => {
  return useProfile(profileId);
};

// Fetch profile by wallet address - uses secure RPC function
export const useProfileByWallet = (walletAddress: string | undefined) => {
  return useQuery({
    queryKey: ['profile', 'wallet', walletAddress?.toLowerCase()],
    queryFn: async () => {
      if (!walletAddress) return null;
      
      // Use secure RPC function to get profile ID from wallet address
      const { data: profileId, error: lookupError } = await supabase
        .rpc('get_profile_by_wallet', { p_wallet_address: walletAddress });
      
      if (lookupError || !profileId) return null;
      
      return fetchPublicProfile(profileId);
    },
    enabled: !!walletAddress,
  });
};

// Get wallet address for tipping (secure function - only returns wallet for legitimate tipping use)
export const useWalletForTipping = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['wallet-for-tipping', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .rpc('get_wallet_for_tipping', { p_user_id: userId });

      if (error) return null;
      return data as string | null;
    },
    enabled: !!userId,
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

      if (error) return 0;
      
      const total = data?.reduce((sum, tip) => sum + Number(tip.amount_eth), 0) || 0;
      return total;
    },
    enabled: !!profileId,
  });
};

// Get follower count using secure RPC function
export const useFollowerCount = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['followers', 'count', profileId],
    queryFn: async () => {
      if (!profileId) return 0;
      
      const { data, error } = await supabase
        .rpc('get_follower_count', { p_profile_id: profileId });

      if (error) return 0;
      return Number(data) || 0;
    },
    enabled: !!profileId,
  });
};

// Get following count using secure RPC function
export const useFollowingCount = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['following', 'count', profileId],
    queryFn: async () => {
      if (!profileId) return 0;
      
      const { data, error } = await supabase
        .rpc('get_following_count', { p_profile_id: profileId });

      if (error) return 0;
      return Number(data) || 0;
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
      return fetchUserRole(userId);
    },
    enabled: !!userId,
  });
};

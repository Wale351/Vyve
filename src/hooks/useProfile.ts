import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  wallet_address: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  avatar_last_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

// Public profile without wallet address
export interface PublicProfile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
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
      
      // Profile is complete if it exists, has username and avatar
      return !!(data?.username && data?.avatar_url);
    },
    enabled: !!userId,
  });
};

// Check if avatar can be updated (30 day cooldown)
export const useCanUpdateAvatar = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', 'avatar-cooldown', userId],
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

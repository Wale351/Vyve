import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_streamer: boolean | null;
  created_at: string;
}

// Full profile with wallet address - only returned for the profile owner
export interface ProfileWithWallet extends Profile {
  wallet_address: string;
}

// Fetch public profile by ID (without wallet address)
export const useProfile = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      // Use the public_profiles view which excludes wallet_address
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!profileId,
  });
};

// Fetch own profile with wallet address (for profile owner only)
export const useOwnProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', 'own', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Direct query to profiles table - RLS ensures only own profile returns wallet_address
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as ProfileWithWallet | null;
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
      return data as Profile | null;
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

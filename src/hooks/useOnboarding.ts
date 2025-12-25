import { useState, useEffect, useCallback } from 'react';
import { useWalletAuth } from './useWalletAuth';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';

export const useOnboarding = () => {
  const { user, isAuthenticated, isInitialized } = useWalletAuth();
  const { address } = useAccount();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  const checkProfile = useCallback(async () => {
    if (!isInitialized) return;
    
    if (!isAuthenticated || !user?.id) {
      setShowOnboarding(false);
      setProfileExists(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking profile:', error);
        setProfileExists(false);
        setShowOnboarding(true);
      } else if (!data) {
        // No profile exists
        setProfileExists(false);
        setShowOnboarding(true);
      } else if (!data.username || !data.avatar_url) {
        // Profile exists but incomplete
        setProfileExists(true);
        setShowOnboarding(true);
      } else {
        // Profile is complete
        setProfileExists(true);
        setShowOnboarding(false);
      }
    } catch (err) {
      console.error('Error checking profile:', err);
      setProfileExists(false);
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isInitialized, user?.id]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  const completeOnboarding = useCallback(() => {
    setShowOnboarding(false);
    setProfileExists(true);
  }, []);

  const triggerOnboarding = useCallback(() => {
    setShowOnboarding(true);
  }, []);

  // Get wallet address from user metadata or wagmi
  const walletAddress = user?.user_metadata?.wallet_address || address;

  return {
    showOnboarding,
    completeOnboarding,
    triggerOnboarding,
    isLoading,
    profileExists,
    userId: user?.id,
    walletAddress,
    refetchProfile: checkProfile,
  };
};

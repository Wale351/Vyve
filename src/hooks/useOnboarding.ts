import { useState, useEffect, useCallback } from 'react';
import { usePrivyAuth } from './usePrivyAuth';
import { supabase } from '@/integrations/supabase/client';

export const useOnboarding = () => {
  const { user, isAuthenticated, isInitialized, walletAddress } = usePrivyAuth();
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

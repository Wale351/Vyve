import { useState, useEffect, useCallback } from 'react';
import { useWalletAuth } from './useWalletAuth';
import { supabase } from '@/integrations/supabase/client';

export const useOnboarding = () => {
  const { user, isAuthenticated, isInitialized, walletAddress } = useWalletAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  // Check if user has completed profile setup
  useEffect(() => {
    const checkProfile = async () => {
      if (!isInitialized) {
        return;
      }

      if (!isAuthenticated || !user?.id) {
        setIsLoading(false);
        setShowOnboarding(false);
        setProfileExists(null);
        return;
      }

      try {
        // Check if profile exists with required fields
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking profile:', error);
          setProfileExists(false);
          setShowOnboarding(true);
        } else if (!data || !data.username || !data.avatar_url) {
          // Profile doesn't exist or is incomplete
          setProfileExists(false);
          setShowOnboarding(true);
        } else {
          // Profile is complete
          setProfileExists(true);
          setShowOnboarding(false);
        }
      } catch (err) {
        console.error('Error in profile check:', err);
        setProfileExists(false);
        setShowOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [isAuthenticated, isInitialized, user?.id]);

  // Complete onboarding (called after profile creation)
  const completeOnboarding = useCallback(() => {
    setShowOnboarding(false);
    setProfileExists(true);
  }, []);

  // Force show onboarding (for testing or re-triggering)
  const triggerOnboarding = useCallback(() => {
    setShowOnboarding(true);
  }, []);

  return {
    showOnboarding,
    isLoading,
    profileExists,
    completeOnboarding,
    triggerOnboarding,
    walletAddress,
    userId: user?.id,
  };
};

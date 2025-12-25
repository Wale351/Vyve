import { useState, useEffect } from 'react';
import { useWalletAuth } from './useWalletAuth';
import { supabase } from '@/integrations/supabase/client';

export const useOnboarding = () => {
  const { user, isAuthenticated, isInitialized } = useWalletAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
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
          .select('id, username, profile_image_url')
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
        } else if (!data.username || !data.profile_image_url) {
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
    };

    checkProfile();
  }, [isAuthenticated, isInitialized, user?.id]);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setProfileExists(true);
  };

  const triggerOnboarding = () => {
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    triggerOnboarding,
    isLoading,
    profileExists,
    userId: user?.id,
    walletAddress: user?.user_metadata?.wallet_address,
  };
};

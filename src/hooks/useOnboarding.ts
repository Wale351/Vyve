import { useState, useEffect } from 'react';
import { useWalletAuth } from './useWalletAuth';
import { useOwnProfile } from './useProfile';

export const useOnboarding = () => {
  const { user, isAuthenticated, isInitialized } = useWalletAuth();
  const { data: profile, isLoading: profileLoading } = useOwnProfile(user?.id);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Wait for auth and profile to be ready
    if (!isInitialized || profileLoading) return;
    if (hasChecked) return;

    // Only show onboarding for authenticated users
    if (isAuthenticated && profile) {
      // Check if this is a new user (no username set)
      const isNewUser = !profile.username || profile.username === '';
      
      // Check if we've already dismissed onboarding this session
      const dismissed = sessionStorage.getItem(`onboarding_dismissed_${user?.id}`);
      
      if (isNewUser && !dismissed) {
        setShowOnboarding(true);
      }
    }
    
    setHasChecked(true);
  }, [isAuthenticated, isInitialized, profile, profileLoading, user?.id, hasChecked]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    if (user?.id) {
      sessionStorage.setItem(`onboarding_dismissed_${user.id}`, 'true');
    }
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    if (user?.id) {
      sessionStorage.setItem(`onboarding_dismissed_${user.id}`, 'true');
    }
  };

  return {
    showOnboarding,
    dismissOnboarding,
    completeOnboarding,
    profile,
    userId: user?.id,
  };
};

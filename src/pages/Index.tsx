import { usePrivyAuth } from '@/hooks/usePrivyAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import Landing from './Landing';
import Home from './Home';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isInitialized, isAuthenticating } = usePrivyAuth();
  const { showOnboarding, isLoading: onboardingLoading, profileExists } = useOnboarding();

  // Show loading while checking auth state
  if (!isInitialized || onboardingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authenticating state
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Signing in...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing page
  if (!isAuthenticated) {
    return <Landing />;
  }

  // Authenticated but no profile or onboarding in progress
  // The OnboardingModal will handle the profile creation
  // Show a minimal screen while onboarding
  if (showOnboarding || !profileExists) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // Fully authenticated with profile - show home page
  return <Home />;
};

export default Index;

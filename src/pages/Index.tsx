import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import Landing from './Landing';
import Home from './Home';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isInitialized, isAuthenticating } = useWalletAuth();
  const { showOnboarding, isLoading: onboardingLoading, profileExists } = useOnboarding();

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authenticating state
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Signing in...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing page
  if (!isAuthenticated) {
    return <Landing />;
  }

  // Authenticated but loading onboarding state
  if (onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Authenticated and profile setup complete - show home
  // The OnboardingModal will handle showing itself if needed
  return <Home />;
};

export default Index;

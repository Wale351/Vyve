import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import Landing from './Landing';
import Home from './Home';
import { motion } from 'framer-motion';

const AppLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <motion.div
      className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const Index = () => {
  const { isAuthenticated, isInitialized, isAuthenticating } = useWalletAuth();
  const { showOnboarding, isLoading: onboardingLoading, profileExists } = useOnboarding();

  // Show loading while initializing
  if (!isInitialized) {
    return <AppLoader />;
  }

  // Show authenticating state
  if (isAuthenticating) {
    return <AppLoader />;
  }

  // Not authenticated - show landing page
  if (!isAuthenticated) {
    return <Landing />;
  }

  // Authenticated but loading onboarding state
  if (onboardingLoading) {
    return <AppLoader />;
  }

  // Authenticated and profile setup complete - show home
  // The OnboardingModal will handle showing itself if needed
  return <Home />;
};

export default Index;

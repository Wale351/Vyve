import { ReactNode } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { Button } from '@/components/ui/button';
import { Loader2, UserX, LogIn } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface ProfileGateProps {
  children: ReactNode;
  fallbackMessage?: string;
}

/**
 * A component that blocks access to features if the user doesn't have a complete profile.
 * Users without profiles cannot:
 * - Go live
 * - Chat
 * - Tip
 * - Access profile pages
 */
const ProfileGate = ({ children, fallbackMessage }: ProfileGateProps) => {
  const { isAuthenticated, isInitialized } = useWalletAuth();
  const { showOnboarding, isLoading, profileExists } = useOnboarding();

  // Still initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <LogIn className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Connect your wallet to access this feature.
        </p>
        <ConnectButton />
      </div>
    );
  }

  // Profile incomplete (onboarding modal should be showing)
  if (showOnboarding || !profileExists) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <UserX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          {fallbackMessage || 'You need to complete your profile to access this feature.'}
        </p>
        <p className="text-sm text-muted-foreground">
          The profile setup modal should appear automatically.
        </p>
      </div>
    );
  }

  // Profile is complete - render children
  return <>{children}</>;
};

export default ProfileGate;

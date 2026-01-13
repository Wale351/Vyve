import { ReactNode, forwardRef, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type AuthButtonProps = {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
};

/**
 * Authentication button powered by Privy.
 * Opens Privy login modal when clicked.
 */
const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  function AuthButton(
    { children, className, disabled, variant = 'premium', size = 'sm' },
    ref
  ) {
    const { ready, authenticated, login } = usePrivy();
    const [privyTimeout, setPrivyTimeout] = useState(false);

    // Add a timeout so button doesn't stay loading forever if Privy fails
    useEffect(() => {
      if (ready) {
        setPrivyTimeout(false);
        return;
      }
      
      const timer = setTimeout(() => {
        console.warn('Privy initialization timeout - proceeding without Privy');
        setPrivyTimeout(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }, [ready]);

    const handleClick = () => {
      if (!ready) {
        // If Privy isn't ready but timeout occurred, try anyway
        if (privyTimeout) {
          login();
        }
        return;
      }
      login();
    };

    // Show loading only briefly, then show button (clickable after timeout)
    if (!ready && !privyTimeout) {
      return (
        <Button 
          ref={ref}
          variant={variant} 
          size={size} 
          className={cn(className)} 
          disabled
        >
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading...
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={handleClick}
        disabled={disabled || authenticated}
        type="button"
      >
        {children || 'Sign In'}
      </Button>
    );
  }
);

export default AuthButton;

import { ReactNode, forwardRef } from 'react';
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

    const handleClick = () => {
      if (!ready) return;
      login();
    };

    if (!ready) {
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

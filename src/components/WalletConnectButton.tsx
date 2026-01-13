import { ReactNode, forwardRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type WalletConnectButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  connectedTitle?: string;
};

/**
 * A reliable wallet connect button powered by RainbowKit's ConnectButton.Custom.
 * - If disconnected: opens connect modal
 * - If connected: opens account modal
 */
const WalletConnectButton = forwardRef<HTMLButtonElement, WalletConnectButtonProps>(
  function WalletConnectButton(
    { children, className, disabled, variant = 'premium', size = 'sm', connectedTitle },
    ref
  ) {
  return (
    <ConnectButton.Custom>
      {({ mounted, account, chain, openConnectModal, openAccountModal, openChainModal }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          return (
            <Button variant={variant} size={size} className={cn(className)} disabled>
              {children}
            </Button>
          );
        }

        if (!connected) {
          return (
            <Button
              variant={variant}
              size={size}
              className={cn(className)}
              onClick={() => openConnectModal()}
              disabled={disabled}
              type="button"
            >
              {children}
            </Button>
          );
        }

        if (chain?.unsupported) {
          return (
            <Button
              variant={variant}
              size={size}
              className={cn(className)}
              onClick={() => openChainModal()}
              disabled={disabled}
              type="button"
            >
              Wrong network
            </Button>
          );
        }

        return (
          <Button
            variant={variant}
            size={size}
            className={cn(className)}
            onClick={() => openAccountModal()}
            disabled={disabled}
            type="button"
            title={connectedTitle || account?.displayName}
          >
            {children}
          </Button>
        );
      }}
      </ConnectButton.Custom>
    );
  }
);

export default WalletConnectButton;

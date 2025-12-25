import { ReactNode, useCallback } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
export default function WalletConnectButton({
  children,
  className,
  disabled,
  variant = 'premium',
  size = 'sm',
  connectedTitle,
}: WalletConnectButtonProps) {
  return (
    <ConnectButton.Custom>
      {({ mounted, account, chain, openConnectModal, openAccountModal, openChainModal }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        const onClickConnect = useCallback(() => {
          if (import.meta.env.DEV) {
            console.debug('[WalletConnectButton] click connect', {
              mounted,
              hasOpenConnectModal: !!openConnectModal,
            });
          }

          if (!openConnectModal) {
            toast('Wallet UI is still loading. Please try again.');
            return;
          }

          openConnectModal();
        }, [mounted, openConnectModal]);

        const onClickAccount = useCallback(() => {
          if (import.meta.env.DEV) {
            console.debug('[WalletConnectButton] click account', {
              mounted,
              hasOpenAccountModal: !!openAccountModal,
              address: account?.address,
            });
          }

          if (!openAccountModal) {
            toast('Wallet UI is still loading. Please try again.');
            return;
          }

          openAccountModal();
        }, [account?.address, mounted, openAccountModal]);

        const onClickChain = useCallback(() => {
          if (!openChainModal) {
            toast('Wallet UI is still loading. Please try again.');
            return;
          }
          openChainModal();
        }, [openChainModal]);

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
              onClick={onClickConnect}
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
              onClick={onClickChain}
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
            onClick={onClickAccount}
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

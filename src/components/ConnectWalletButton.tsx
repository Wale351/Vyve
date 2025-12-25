import { useMemo, useState } from 'react';
import { useConnect } from 'wagmi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  className?: string;
  children?: React.ReactNode;
};

const ConnectWalletButton = ({
  variant = 'premium',
  size = 'sm',
  className,
  children = 'Connect Wallet',
}: Props) => {
  const [open, setOpen] = useState(false);
  const { connectAsync, connectors, isPending } = useConnect();

  const availableConnectors = useMemo(
    () => connectors.filter((c) => c.type !== 'unknown'),
    [connectors]
  );

  const handleConnect = async (connectorId: string) => {
    const connector = availableConnectors.find((c) => c.id === connectorId);
    if (!connector) return;

    try {
      await connectAsync({ connector });
      setOpen(false);
      toast.success('Wallet connected');
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || 'Could not connect wallet';
      toast.error(msg);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        {children}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <DialogTitle className="font-display text-2xl">Connect your wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {availableConnectors.map((c) => (
              <Button
                key={c.id}
                variant="soft"
                className="w-full justify-between"
                onClick={() => handleConnect(c.id)}
                disabled={isPending}
              >
                <span className="font-medium">{c.name}</span>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
              </Button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            By connecting, you agree to our Terms and Privacy Policy.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConnectWalletButton;

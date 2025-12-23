import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Coins, Loader2 } from 'lucide-react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TipButtonProps {
  streamerId: string;
  streamerName: string;
}

const TipButton = ({ streamerId, streamerName }: TipButtonProps) => {
  const { isConnected, address } = useAccount();
  const [amount, setAmount] = useState('0.01');
  const [isOpen, setIsOpen] = useState(false);
  const [streamerWallet, setStreamerWallet] = useState<string | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  const { data: hash, isPending, sendTransaction } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Fetch streamer wallet address when dialog opens
  useEffect(() => {
    const fetchWallet = async () => {
      if (!isOpen || !streamerId) return;
      
      setIsLoadingWallet(true);
      try {
        // Get streamer's wallet address from profiles
        // Note: This will work because the current user has a valid session
        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', streamerId)
          .single();
        
        if (error) throw error;
        setStreamerWallet(data?.wallet_address || null);
      } catch (error) {
        console.error('Error fetching streamer wallet:', error);
        toast.error('Unable to load streamer wallet');
        setStreamerWallet(null);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    fetchWallet();
  }, [isOpen, streamerId]);

  const handleTip = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!streamerWallet) {
      toast.error('Unable to send tip - streamer wallet not available');
      return;
    }

    try {
      sendTransaction({
        to: streamerWallet as `0x${string}`,
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Tip error:', error);
      toast.error('Failed to send tip');
    }
  };

  // Show success toast when transaction confirms
  useEffect(() => {
    if (isSuccess && hash) {
      toast.success(`Successfully tipped ${amount} ETH to ${streamerName}!`);
      setIsOpen(false);
    }
  }, [isSuccess, hash, amount, streamerName]);

  const presetAmounts = ['0.001', '0.01', '0.05', '0.1'];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="premium" className="gap-2" disabled={!isConnected}>
          <Coins className="h-4 w-4" />
          Tip
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Send a Tip</DialogTitle>
          <DialogDescription>
            Support {streamerName} with ETH on Base
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {isLoadingWallet ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !streamerWallet ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Unable to load streamer wallet</p>
            </div>
          ) : (
            <>
              {/* Preset amounts */}
              <div className="flex gap-2">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant={amount === preset ? 'soft' : 'outline'}
                    size="sm"
                    onClick={() => setAmount(preset)}
                    className="flex-1"
                  >
                    {preset} ETH
                  </Button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="bg-muted/50 border-border/50"
                />
                <span className="flex items-center text-muted-foreground">ETH</span>
              </div>

              {/* Send button */}
              <Button
                onClick={handleTip}
                disabled={isPending || isConfirming || !amount}
                variant="premium"
                className="w-full"
                size="lg"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isPending ? 'Confirming...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4" />
                    Send {amount} ETH
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Tips are sent directly to the streamer's wallet on Base
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TipButton;

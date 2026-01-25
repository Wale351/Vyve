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
import { Coins, Loader2, CheckCircle2, Sparkles, UserX } from 'lucide-react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useProfileComplete } from '@/hooks/useProfile';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useOnboarding } from '@/hooks/useOnboarding';

interface TipButtonProps {
  streamerId: string;
  streamerName: string;
  streamId: string;
}

const TipButton = ({ streamerId, streamerName, streamId }: TipButtonProps) => {
  const { isConnected, address } = useAccount();
  const { user, isAuthenticated } = useWalletAuth();
  const { data: isProfileComplete } = useProfileComplete(user?.id);
  const { triggerOnboarding } = useOnboarding();
  const [amount, setAmount] = useState('0.01');
  const [isOpen, setIsOpen] = useState(false);
  const [streamerWallet, setStreamerWallet] = useState<string | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSavingTip, setIsSavingTip] = useState(false);

  const { data: hash, isPending, sendTransaction, reset } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Fetch streamer wallet address securely when dialog opens
  useEffect(() => {
    const fetchWallet = async () => {
      if (!isOpen || !streamerId) return;
      
      setIsLoadingWallet(true);
      try {
        // Use secure RPC function to get wallet for tipping
        const { data, error } = await supabase
          .rpc('get_wallet_for_tipping', { p_user_id: streamerId });
        
        if (error) throw error;
        setStreamerWallet(data || null);
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

  // Save tip to database and show success when transaction confirms
  useEffect(() => {
    const saveTipToDatabase = async () => {
      if (!isSuccess || !hash || !address || !streamerWallet || isSavingTip) return;
      
      setIsSavingTip(true);
      
      try {
        // Get current user's profile ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Save tip to database
        const { error } = await supabase
          .from('tips')
          .insert({
            sender_id: user.id,
            receiver_id: streamerId,
            stream_id: streamId,
            amount_eth: parseFloat(amount),
            tx_hash: hash,
            from_wallet: address,
            to_wallet: streamerWallet,
          });

        if (error) {
          console.error('Error saving tip:', error);
          // Don't fail the whole flow if DB save fails - transaction already succeeded
        }

        // Show success animation
        setShowSuccess(true);
        toast.success(
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Sent {amount} ETH to {streamerName}!</span>
          </div>
        );

        // Close dialog after animation
        setTimeout(() => {
          setIsOpen(false);
          setShowSuccess(false);
          setAmount('0.01');
          reset();
          setIsSavingTip(false);
        }, 2000);
        
      } catch (error) {
        console.error('Error saving tip:', error);
        setIsSavingTip(false);
      }
    };

    saveTipToDatabase();
  }, [isSuccess, hash, address, streamerWallet, streamerId, streamId, amount, streamerName, reset, isSavingTip]);

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

  const presetAmounts = ['0.001', '0.01', '0.05', '0.1'];

  const isProcessing = isPending || isConfirming || isSavingTip;

  // Check if user can tip (connected, authenticated, profile complete)
  const canTip = isConnected && isAuthenticated && isProfileComplete;

  const handleTipClick = () => {
    if (!isProfileComplete && isAuthenticated) {
      triggerOnboarding();
      return;
    }
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isProcessing) {
        setIsOpen(open);
        if (!open) {
          setShowSuccess(false);
          reset();
        }
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="premium" 
          className="gap-2" 
          disabled={!isConnected}
          onClick={(e) => {
            if (!canTip) {
              e.preventDefault();
              handleTipClick();
            }
          }}
        >
          <Coins className="h-4 w-4" />
          <span>Tip on Base</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        {showSuccess ? (
          // Success State
          <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <h3 className="font-display text-xl font-bold mt-6">Tip Sent!</h3>
            <p className="text-muted-foreground mt-2">
              {amount} ETH sent to {streamerName}
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span>Transaction confirmed on Base Sepolia</span>
            </div>
          </div>
        ) : (
          // Normal State
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Send a Tip</DialogTitle>
              <DialogDescription>
                Support {streamerName} with ETH on Base Sepolia Testnet
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {isLoadingWallet ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !streamerWallet ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Streamer wallet not available</p>
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
                        disabled={isProcessing}
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
                      disabled={isProcessing}
                    />
                    <span className="flex items-center text-muted-foreground">ETH</span>
                  </div>

                  {/* Send button */}
                  <Button
                    onClick={handleTip}
                    disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                    variant="premium"
                    className={cn(
                      "w-full relative overflow-hidden",
                      isProcessing && "animate-pulse"
                    )}
                    size="lg"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          {isPending && 'Confirm in wallet...'}
                          {isConfirming && 'Confirming on Base Sepolia...'}
                          {isSavingTip && 'Saving...'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <Coins className="h-4 w-4 mr-2" />
                        Send {amount} ETH
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Tips are sent directly to the streamer's wallet on Base Sepolia Testnet
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TipButton;

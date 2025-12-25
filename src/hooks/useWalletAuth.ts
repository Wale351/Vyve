import { useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const useWalletAuth = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage();
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const walletAddress = address;

  // Listen for Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-authenticate with Supabase when wallet connects
  useEffect(() => {
    const authenticateWithSupabase = async () => {
      if (!isConnected || !walletAddress || isAuthenticating || session) {
        return;
      }

      setIsAuthenticating(true);
      
      try {
        // Generate a cryptographically secure nonce
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        const nonce = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        const timestamp = Date.now();
        
        const message = `Sign in to Vyve\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

        // Request signature from wallet
        const signature = await signMessageAsync({ message, account: walletAddress as `0x${string}` });

        // Send to backend for verification and session creation
        const { data, error } = await supabase.functions.invoke('wallet-auth', {
          body: {
            wallet_address: walletAddress,
            signature,
            message,
          },
        });

        if (error) {
          console.error('Wallet auth error:', error);
          toast.error('Authentication failed. Please try again.');
          return;
        }

        if (data?.session) {
          // Set the session in Supabase client
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          
          toast.success('Successfully signed in!');
        }
      } catch (error: any) {
        if (error?.message?.includes('User rejected') || error?.message?.includes('cancelled')) {
          toast.error('Signature rejected');
        } else {
          console.error('Sign in error:', error);
          toast.error('Authentication failed. Please try again.');
        }
      } finally {
        setIsAuthenticating(false);
      }
    };

    authenticateWithSupabase();
  }, [isConnected, walletAddress, session, isAuthenticating, signMessageAsync]);

  // Sign out from Supabase and disconnect wallet
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      disconnect();
      toast.success('Signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [disconnect]);

  // Open RainbowKit connect modal
  const openLogin = useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  return {
    // Wallet state (for compatibility with usePrivyAuth)
    ready: true,
    authenticated: isConnected,
    privyUser: null,
    walletAddress,
    
    // Supabase state
    session,
    user,
    isAuthenticated: !!session,
    isAuthenticating,
    isInitialized,
    
    // Actions
    openLogin,
    signOut,
  };
};

// Re-export as usePrivyAuth for backward compatibility
export const usePrivyAuth = useWalletAuth;

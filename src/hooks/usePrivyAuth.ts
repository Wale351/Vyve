import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const usePrivyAuth = () => {
  const { ready, authenticated, user: privyUser, login, logout: privyLogout } = usePrivy();
  const { wallets } = useWallets();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get the wallet address from Privy
  const wallet = wallets.find(w => w.walletClientType !== 'privy');
  const walletAddress = wallet?.address || privyUser?.wallet?.address;

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

  // Auto-authenticate with Supabase when Privy connects
  useEffect(() => {
    const authenticateWithSupabase = async () => {
      if (!ready || !authenticated || !walletAddress || isAuthenticating || session) {
        return;
      }

      setIsAuthenticating(true);
      
      try {
        // Get the wallet client to sign
        if (!wallet) {
          throw new Error('No wallet found');
        }

        // Generate a cryptographically secure nonce
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        const nonce = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        const timestamp = Date.now();
        
        const message = `Sign in to Vyve\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

        // Request signature from wallet via Privy
        const signature = await wallet.sign(message);

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
  }, [ready, authenticated, walletAddress, wallet, session, isAuthenticating]);

  // Sign out from both Privy and Supabase
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      await privyLogout();
      toast.success('Signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [privyLogout]);

  // Open Privy login modal
  const openLogin = useCallback(() => {
    login();
  }, [login]);

  return {
    // Privy state
    ready,
    authenticated,
    privyUser,
    walletAddress,
    
    // Supabase state
    session,
    user,
    isAuthenticated: !!session,
    isAuthenticating,
    isInitialized: ready && isInitialized,
    
    // Actions
    openLogin,
    signOut,
  };
};

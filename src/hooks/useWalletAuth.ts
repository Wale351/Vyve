import { useState, useEffect, useCallback, useRef } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

/**
 * Custom hook for Privy wallet authentication integrated with Supabase.
 * Handles login/logout, session management, and wallet connectivity.
 */
export const useWalletAuth = () => {
  const { 
    ready, 
    authenticated, 
    user: privyUser, 
    login, 
    logout: privyLogout,
    linkWallet,
    unlinkWallet,
  } = usePrivy();
  const { wallets } = useWallets();
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);
  
  // Track if we've already synced this Privy user with Supabase
  const syncedPrivyUserRef = useRef<string | null>(null);
  const authInProgressRef = useRef(false);

  // Get the primary wallet address (first linked wallet, if any)
  const primaryWallet = wallets.find(w => w.walletClientType !== 'privy');
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const activeWallet = primaryWallet || embeddedWallet;
  const walletAddress = activeWallet?.address?.toLowerCase();

  // Computed: fully initialized when both Privy and Supabase are ready
  // Use a more lenient check - consider initialized if Supabase is ready
  // and either Privy is ready OR we've waited long enough
  const [privyTimeout, setPrivyTimeout] = useState(false);
  
  // Add a timeout for Privy initialization (3 seconds max)
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

  // Consider initialized if Supabase is ready - don't block on Privy
  // This allows landing page to show immediately for unauthenticated users
  const isInitialized = supabaseInitialized;

  // Listen for Supabase auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        syncedPrivyUserRef.current = null;
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setSupabaseInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync Privy user with Supabase when authenticated
  useEffect(() => {
    const syncWithSupabase = async () => {
      // Wait for both Privy and Supabase to be ready
      if (!ready || !supabaseInitialized) return;

      // If not authenticated with Privy, sign out of Supabase too
      if (!authenticated || !privyUser) {
        if (session) {
          await supabase.auth.signOut();
        }
        return;
      }

      // Already synced this user
      if (syncedPrivyUserRef.current === privyUser.id) return;

      // Already in progress
      if (authInProgressRef.current || isAuthenticating) return;

      // Already have a valid session
      if (session?.user) {
        syncedPrivyUserRef.current = privyUser.id;
        return;
      }

      // Start auth process
      authInProgressRef.current = true;
      setIsAuthenticating(true);

      try {
        // Get the wallet address or email from Privy user
        const privyWalletAddress = privyUser.wallet?.address?.toLowerCase();
        const privyEmail = privyUser.email?.address;

        // Call our edge function to sync/create Supabase user
        const { data, error } = await supabase.functions.invoke('privy-auth', {
          body: {
            privy_user_id: privyUser.id,
            wallet_address: privyWalletAddress || walletAddress,
            email: privyEmail,
          },
        });

        if (error) {
          console.error('Privy auth sync error:', error);
          toast.error('Authentication failed. Please try again.');
          return;
        }

        if (data?.session) {
          syncedPrivyUserRef.current = privyUser.id;

          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          toast.success('Signed in successfully!');
        }
      } catch (error) {
        console.error('Privy auth error:', error);
        toast.error('Authentication failed.');
      } finally {
        setIsAuthenticating(false);
        authInProgressRef.current = false;
      }
    };

    syncWithSupabase();
  }, [ready, authenticated, privyUser, session, isAuthenticating, walletAddress, supabaseInitialized]);

  // Sign out from both Privy and Supabase
  const signOut = useCallback(async () => {
    try {
      syncedPrivyUserRef.current = null;
      authInProgressRef.current = false;
      
      await supabase.auth.signOut();
      await privyLogout();
      
      toast.success('Signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Sign out failed');
    }
  }, [privyLogout]);

  // Open Privy login modal
  const openLogin = useCallback(() => {
    login();
  }, [login]);

  // Link an external wallet to the Privy account
  const handleLinkWallet = useCallback(() => {
    linkWallet();
  }, [linkWallet]);

  // Unlink a wallet from the Privy account
  const handleUnlinkWallet = useCallback(async (address: string) => {
    try {
      await unlinkWallet(address);
      toast.success('Wallet unlinked');
    } catch (error) {
      toast.error('Failed to unlink wallet');
    }
  }, [unlinkWallet]);

  return {
    // Privy state
    ready,
    authenticated,
    privyUser,
    wallets,
    
    // Wallet state
    walletAddress,
    activeWallet,
    primaryWallet,
    embeddedWallet,

    // Supabase state
    session,
    user,
    isAuthenticated: !!session,
    isAuthenticating,
    isInitialized,

    // Actions
    openLogin,
    signOut,
    linkWallet: handleLinkWallet,
    unlinkWallet: handleUnlinkWallet,
  };
};

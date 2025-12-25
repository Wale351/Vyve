import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

type SharedWalletAuthState = {
  authenticatedAddress: string | null;
  authAttemptInProgress: boolean;
  suppressAuthUntil: number; // epoch ms
  lastAuthAttemptAt: number; // epoch ms
};

const getSharedState = (): SharedWalletAuthState => {
  const g = globalThis as unknown as { __vyve_wallet_auth__?: SharedWalletAuthState };
  if (!g.__vyve_wallet_auth__) {
    g.__vyve_wallet_auth__ = {
      authenticatedAddress: null,
      authAttemptInProgress: false,
      suppressAuthUntil: 0,
      lastAuthAttemptAt: 0,
    };
  }
  return g.__vyve_wallet_auth__;
};

// Note: We don't aggressively clear localStorage anymore as it corrupts wagmi's internal state.
// Instead, we rely on wagmi's disconnect() and the suppressAuthUntil timestamp to prevent re-auth.

export const useWalletAuth = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { signMessageAsync } = useSignMessage();

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Local refs (per-hook-instance) + shared state (cross-component) to avoid multiple signature prompts.
  const authenticatedAddressRef = useRef<string | null>(null);
  const authAttemptInProgressRef = useRef(false);

  const shared = getSharedState();

  const walletAddress = address;
  const walletAddressLower = walletAddress?.toLowerCase();

  // Keep an up-to-date reference to signMessageAsync without retriggering auth effects.
  const signMessageAsyncRef = useRef(signMessageAsync);
  useEffect(() => {
    signMessageAsyncRef.current = signMessageAsync;
  }, [signMessageAsync]);

  // Keep an up-to-date reference to RainbowKit modal openers (avoid stale closures).
  const openConnectModalRef = useRef(openConnectModal);
  useEffect(() => {
    openConnectModalRef.current = openConnectModal;
  }, [openConnectModal]);

  const openAccountModalRef = useRef(openAccountModal);
  useEffect(() => {
    openAccountModalRef.current = openAccountModal;
  }, [openAccountModal]);

  // Listen for Supabase auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      // If we got a session, mark this address as authenticated
      if (currentSession && walletAddressLower) {
        authenticatedAddressRef.current = walletAddressLower;
        shared.authenticatedAddress = walletAddressLower;
      }

      // If signed out, reset the authenticated address
      if (event === 'SIGNED_OUT') {
        authenticatedAddressRef.current = null;
        shared.authenticatedAddress = null;
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      // If we have an existing session and wallet is connected, mark as authenticated
      if (existingSession && walletAddressLower) {
        authenticatedAddressRef.current = walletAddressLower;
        shared.authenticatedAddress = walletAddressLower;
      }

      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
    // Intentionally depend on walletAddressLower so switching wallets updates the authenticated marker.
  }, [walletAddressLower, shared]);

  // Auto-authenticate with Supabase when wallet connects
  useEffect(() => {
    const authenticateWithSupabase = async () => {
      // Wait for initialization
      if (!isInitialized) return;

      // Check all conditions
      if (!isConnected || !walletAddress || !walletAddressLower) return;

      // Don't auto-auth right after a manual sign-out/disconnect.
      if (Date.now() < shared.suppressAuthUntil) return;

      // Already have a session
      if (session) return;

      // Already authenticated this address (shared across the whole app)
      if (shared.authenticatedAddress === walletAddressLower) return;

      // Already authenticated this address (local)
      if (authenticatedAddressRef.current === walletAddressLower) return;

      // Already attempting authentication (shared + local)
      if (shared.authAttemptInProgress || authAttemptInProgressRef.current || isAuthenticating) return;

      // Basic throttle to avoid back-to-back prompts if multiple components mount at once.
      if (Date.now() - shared.lastAuthAttemptAt < 1500) return;

      // Mark that we're starting authentication
      shared.authAttemptInProgress = true;
      shared.lastAuthAttemptAt = Date.now();
      authAttemptInProgressRef.current = true;
      setIsAuthenticating(true);

      try {
        // Generate a cryptographically secure nonce
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        const nonce = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
        const timestamp = Date.now();

        const message = `Sign in to Vyve\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

        // Request signature from wallet
        const signature = await signMessageAsyncRef.current({
          message,
          account: walletAddress as `0x${string}`,
        });

        // Send to backend for verification and session creation
        const { data, error } = await supabase.functions.invoke('wallet-auth', {
          body: {
            wallet_address: walletAddress,
            signature,
            message,
          },
        });

        if (error) {
          toast.error('Authentication failed. Please try again.');
          // Don't mark as authenticated on error so user can retry
          return;
        }

        if (data?.session) {
          // Mark this address as authenticated BEFORE setting session
          authenticatedAddressRef.current = walletAddressLower;
          shared.authenticatedAddress = walletAddressLower;

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
          // Prevent immediate re-prompt spam; user can disconnect/reconnect to try again.
          authenticatedAddressRef.current = walletAddressLower;
          shared.authenticatedAddress = walletAddressLower;
          shared.suppressAuthUntil = Date.now() + 10_000;
        } else {
          toast.error('Authentication failed. Please try again.');
        }
      } finally {
        setIsAuthenticating(false);
        authAttemptInProgressRef.current = false;
        shared.authAttemptInProgress = false;
      }
    };

    authenticateWithSupabase();
  }, [isConnected, walletAddress, walletAddressLower, session, isInitialized, isAuthenticating, shared]);

  // Sign out from Supabase and disconnect wallet
  const signOut = useCallback(async () => {
    try {
      // Stop auto-auth from immediately re-triggering while we disconnect.
      shared.suppressAuthUntil = Date.now() + 15_000;

      // Reset markers
      authenticatedAddressRef.current = null;
      authAttemptInProgressRef.current = false;
      shared.authenticatedAddress = null;
      shared.authAttemptInProgress = false;

      await supabase.auth.signOut();

      // Disconnect the wallet (UI state) - wagmi handles its own cleanup
      disconnect();

      toast.success('Signed out');
    } catch {
      toast.error('Sign out failed');
    }
  }, [disconnect, shared]);

  // Open RainbowKit connect/account modal
  const openLogin = useCallback(() => {
    // If user is already connected, open the account modal (so they can switch/disconnect).
    if (isConnected) {
      const openAccount = openAccountModalRef.current;
      if (openAccount) {
        openAccount();
        return;
      }
    }

    // Reset suppression when user explicitly wants to connect
    shared.suppressAuthUntil = 0;
    shared.authenticatedAddress = null;
    authenticatedAddressRef.current = null;

    const openConnect = openConnectModalRef.current;
    if (openConnect) {
      openConnect();
      return;
    }

    // RainbowKit modal can be briefly undefined during provider init.
    toast('Wallet modal is still loading. Try again in a moment.');
    setTimeout(() => {
      openConnectModalRef.current?.();
    }, 150);
  }, [isConnected, shared]);

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

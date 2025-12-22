import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const useWalletAuth = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Listen for auth state changes
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

  // Sign in with wallet
  const signInWithWallet = useCallback(async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setIsAuthenticating(true);
    
    try {
      // Generate a nonce for security
      const nonce = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      
      const message = `Sign in to Base Haven\n\nWallet: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

      // Request signature from wallet
      const signature = await signMessageAsync({ 
        message,
        account: address,
      });

      // Send to backend for verification and session creation
      const { data, error } = await supabase.functions.invoke('wallet-auth', {
        body: {
          wallet_address: address,
          signature,
          message,
        },
      });

      if (error) {
        console.error('Wallet auth error:', error);
        toast.error('Authentication failed. Please try again.');
        return false;
      }

      if (data?.session) {
        // Set the session in Supabase client
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        toast.success('Successfully signed in!');
        return true;
      }

      toast.error('Authentication failed. Please try again.');
      return false;
    } catch (error: any) {
      // User rejected signature
      if (error?.message?.includes('User rejected')) {
        toast.error('Signature rejected');
      } else {
        console.error('Sign in error:', error);
        toast.error('Authentication failed. Please try again.');
      }
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, isConnected, signMessageAsync]);

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
  }, []);

  // Auto sign-out when wallet disconnects
  useEffect(() => {
    if (isInitialized && !isConnected && session) {
      signOut();
    }
  }, [isConnected, session, isInitialized, signOut]);

  return {
    session,
    user,
    isAuthenticated: !!session,
    isAuthenticating,
    isInitialized,
    signInWithWallet,
    signOut,
  };
};

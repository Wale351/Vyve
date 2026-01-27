import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

// ENS resolution must happen on mainnet (L1) even for Base users
// This is because ENS primary names are registered on mainnet
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com'),
});

export interface EnsIdentity {
  name: string | null;
  avatar: string | null;
  isLoading: boolean;
  isResolved: boolean;
  error: string | null;
}

interface UseEnsIdentityOptions {
  enabled?: boolean;
  retryOnFailure?: boolean;
}

/**
 * Hook to resolve ENS/Base name and avatar for a wallet address.
 * Resolution happens on Ethereum mainnet as that's where ENS primary names live.
 * 
 * Privacy: This hook only uses the address locally for resolution.
 * No wallet addresses are exposed in the resolved data.
 */
export const useEnsIdentity = (
  address: string | undefined,
  options: UseEnsIdentityOptions = {}
): EnsIdentity => {
  const { enabled = true, retryOnFailure = true } = options;
  
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const resolveIdentity = useCallback(async (walletAddress: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Reverse resolve address to ENS name
      const ensName = await mainnetClient.getEnsName({
        address: walletAddress as `0x${string}`,
      });

      if (ensName) {
        setName(ensName);

        // Step 2: Resolve avatar if name exists
        try {
          const ensAvatar = await mainnetClient.getEnsAvatar({
            name: normalize(ensName),
          });
          setAvatar(ensAvatar);
        } catch (avatarError) {
          // Avatar resolution can fail, that's okay
          console.warn('[ENS] Avatar resolution failed:', avatarError);
          setAvatar(null);
        }
      } else {
        setName(null);
        setAvatar(null);
      }

      setIsResolved(true);
    } catch (err) {
      console.error('[ENS] Resolution failed:', err);
      setError('ENS resolution failed');
      setIsResolved(true);

      // Retry logic for transient failures
      if (retryOnFailure && retryCount < 2) {
        setTimeout(() => {
          setRetryCount((c) => c + 1);
        }, 2000 * (retryCount + 1));
      }
    } finally {
      setIsLoading(false);
    }
  }, [retryOnFailure, retryCount]);

  useEffect(() => {
    if (!enabled || !address) {
      setIsLoading(false);
      setIsResolved(false);
      setName(null);
      setAvatar(null);
      return;
    }

    resolveIdentity(address);
  }, [address, enabled, resolveIdentity]);

  return {
    name,
    avatar,
    isLoading,
    isResolved,
    error,
  };
};

/**
 * Generate a suggested username from ENS name.
 * Strips the .eth suffix and sanitizes for username format.
 */
export const ensNameToUsername = (ensName: string): string => {
  // Remove .eth suffix
  let username = ensName.replace(/\.eth$/i, '');
  
  // Replace dots with underscores (for subdomains)
  username = username.replace(/\./g, '_');
  
  // Remove any characters that aren't alphanumeric or underscore
  username = username.replace(/[^a-zA-Z0-9_]/g, '');
  
  // Ensure minimum length
  if (username.length < 3) {
    username = `${username}_${Math.random().toString(36).slice(2, 6)}`;
  }
  
  // Truncate to max length
  if (username.length > 30) {
    username = username.slice(0, 30);
  }
  
  return username.toLowerCase();
};

/**
 * Generate a temporary username for users without ENS names.
 */
export const generateTempUsername = (): string => {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `vyver_${suffix}`;
};

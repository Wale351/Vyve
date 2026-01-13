import { baseSepolia } from 'viem/chains';
import type { PrivyClientConfig } from '@privy-io/react-auth';

// Privy configuration
export const privyAppId = 'cmk905mdl02krl10d4zdowbko';

export const privyConfig: PrivyClientConfig = {
  // Appearance
  appearance: {
    theme: 'dark',
    accentColor: '#8B5CF6',
    logo: undefined,
  },
  // Login methods
  loginMethods: ['email', 'wallet'],
  // Chain configuration - Base Sepolia
  defaultChain: baseSepolia,
  supportedChains: [baseSepolia],
  // Embedded wallets configuration
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
  },
  // Mobile friendly
  mfa: {
    noPromptOnMfaRequired: false,
  },
  // Wallet config
  walletConnectCloudProjectId: '34357d3c125c2bcf2ce2bc3309d98715',
};

// Export the active chain
export const activeChain = baseSepolia;

import { base } from 'viem/chains';
import type { PrivyClientConfig } from '@privy-io/react-auth';

// Privy App ID - this is a publishable key
export const PRIVY_APP_ID = 'cm6b6g3mn005t12oaz9xsmxyv';

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'dark',
    accentColor: '#8B5CF6', // primary purple
    logo: undefined,
    showWalletLoginFirst: true,
  },
  loginMethods: ['wallet'],
  defaultChain: base,
  supportedChains: [base],
};

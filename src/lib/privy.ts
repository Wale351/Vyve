import { base } from 'viem/chains';
import type { PrivyClientConfig } from '@privy-io/react-auth';

// Privy App ID - Get yours from https://dashboard.privy.io
// This is a publishable key, safe to include in frontend code
export const PRIVY_APP_ID = 'clpispdty00ycl80fpueukbhl';

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

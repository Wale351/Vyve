import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet,
  zerionWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';

export const config = getDefaultConfig({
  appName: 'Vyve',
  projectId: '34357d3c125c2bcf2ce2bc3309d98715', // WalletConnect project ID
  chains: [baseSepolia],
  ssr: false,
  wallets: [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
        rainbowWallet,
        zerionWallet,
        trustWallet,
      ],
    },
  ],
});

// Export chain for use in other components
export const activeChain = baseSepolia;

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

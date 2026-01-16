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

// Deep linking configuration for mobile wallets
const WALLET_CONNECT_PROJECT_ID = '34357d3c125c2bcf2ce2bc3309d98715';

export const config = getDefaultConfig({
  appName: 'Vyve',
  projectId: WALLET_CONNECT_PROJECT_ID,
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

// Deep link URLs for mobile wallet apps
export const WALLET_DEEP_LINKS = {
  metamask: {
    ios: 'metamask://',
    android: 'metamask://',
    universal: 'https://metamask.app.link',
  },
  coinbase: {
    ios: 'cbwallet://',
    android: 'cbwallet://',
    universal: 'https://go.cb-w.com',
  },
  rainbow: {
    ios: 'rainbow://',
    android: 'rainbow://',
    universal: 'https://rnbwapp.com',
  },
  trust: {
    ios: 'trust://',
    android: 'trust://',
    universal: 'https://link.trustwallet.com',
  },
};

// Helper to detect mobile device
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Helper to detect if in-app browser (wallet browser)
export const isInWalletBrowser = () => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes('metamask') ||
    ua.includes('coinbase') ||
    ua.includes('rainbow') ||
    ua.includes('trust')
  );
};

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

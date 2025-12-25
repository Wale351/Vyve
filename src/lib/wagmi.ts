import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Vyve',
  projectId: '34357d3c125c2bcf2ce2bc3309d98715', // WalletConnect project ID
  chains: [base],
  ssr: false,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

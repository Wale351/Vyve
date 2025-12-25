import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './lib/wagmi';
import Index from "./pages/Index";
import Watch from "./pages/Watch";
import GoLive from "./pages/GoLive";
import Profile from "./pages/Profile";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import NotFound from "./pages/NotFound";
import OnboardingModal from "./components/OnboardingModal";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: 'hsl(230, 65%, 60%)',
          accentColorForeground: 'hsl(220, 10%, 98%)',
          borderRadius: 'medium',
          overlayBlur: 'small',
        })}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <OnboardingModal />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/watch/:streamId" element={<Watch />} />
              <Route path="/go-live" element={<GoLive />} />
              <Route path="/profile/:address" element={<Profile />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:slug" element={<GameDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;

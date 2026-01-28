import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from './lib/wagmi';
import Index from "./pages/Index";
import Watch from "./pages/Watch";
import GoLive from "./pages/GoLive";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import ApplyStreamer from "./pages/ApplyStreamer";
import Admin from "./pages/Admin";
import VerifyAccount from "./pages/VerifyAccount";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import CreateCommunity from "./pages/CreateCommunity";
import CommunitySettings from "./pages/CommunitySettings";

import NotFound from "./pages/NotFound";
import OnboardingModal from "./components/OnboardingModal";

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider 
        theme={darkTheme({
          accentColor: '#8B5CF6',
          accentColorForeground: 'white',
          borderRadius: 'medium',
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
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile/:identifier" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:slug" element={<GameDetail />} />
              <Route path="/apply/streamer" element={<ApplyStreamer />} />
              <Route path="/verify" element={<VerifyAccount />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/communities/create" element={<CreateCommunity />} />
              <Route path="/communities/:slug" element={<CommunityDetail />} />
              <Route path="/communities/:slug/settings" element={<CommunitySettings />} />
              
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;

import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import WalletConnectButton from '@/components/WalletConnectButton';
import vyveLogo from '@/assets/vyve-logo.png';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className="max-w-7xl mx-auto px-6 py-3 rounded-lg bg-card/80 backdrop-blur-md border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={vyveLogo} alt="Vyve" className="w-8 h-8 rounded" />
              <span className="text-lg font-bold tracking-wide text-foreground uppercase">Vyve</span>
            </div>

            <div className="hidden md:block">
              <WalletConnectButton variant="default" size="sm">
                Launch App
              </WalletConnectButton>
            </div>

            <button 
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="md:hidden overflow-hidden mx-4 mt-2"
      >
        <div className="bg-card/95 backdrop-blur-md rounded-lg border border-border/50 p-4">
          <WalletConnectButton variant="default" size="sm" className="w-full">
            Launch App
          </WalletConnectButton>
        </div>
      </motion.div>
    </motion.header>
  );
}

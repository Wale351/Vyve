import { motion } from 'framer-motion';
import { Play, Menu, X } from 'lucide-react';
import { useState } from 'react';
import WalletConnectButton from '@/components/WalletConnectButton';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className="max-w-7xl mx-auto px-6 py-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Play className="h-5 w-5 text-primary-foreground" fill="currentColor" />
                </div>
                <motion.div 
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-secondary"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <span className="font-varsity text-3xl tracking-wider text-foreground">VYVE</span>
            </motion.div>

            {/* CTA */}
            <div className="hidden md:block">
              <WalletConnectButton variant="premium" size="sm">
                Launch App
              </WalletConnectButton>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
        className="md:hidden overflow-hidden mx-4 mt-2"
      >
        <div className="bg-card/95 backdrop-blur-xl rounded-xl border border-border/50 p-4">
          <WalletConnectButton variant="premium" size="sm" className="w-full">
            Launch App
          </WalletConnectButton>
        </div>
      </motion.div>
    </motion.header>
  );
}

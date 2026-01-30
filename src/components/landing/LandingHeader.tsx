import { motion } from 'framer-motion';
import { Play, Menu, X } from 'lucide-react';
import { useState } from 'react';
import WalletConnectButton from '@/components/WalletConnectButton';

// Fixed brand colors for landing page
const BRAND_PRIMARY = 'hsl(175, 85%, 45%)';
const BRAND_SECONDARY = 'hsl(15, 75%, 55%)';

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
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(to bottom right, ${BRAND_PRIMARY}, ${BRAND_SECONDARY})` }}
                >
                  <Play className="h-5 w-5 text-white" fill="currentColor" />
                </div>
                <motion.div 
                  className="absolute inset-0 rounded-xl"
                  style={{ background: `linear-gradient(to bottom right, ${BRAND_PRIMARY}, ${BRAND_SECONDARY})` }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
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
        transition={{ duration: 0.3, ease: "easeOut" }}
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

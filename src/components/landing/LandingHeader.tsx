import { motion } from 'framer-motion';
import { Play, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import WalletConnectButton from '@/components/WalletConnectButton';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className="max-w-5xl mx-auto px-5 py-3 rounded-xl bg-card/80 backdrop-blur-xl border border-border/50">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Play className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-display text-xl font-bold">Vyve</span>
            </Link>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Browse
                </span>
              </Link>
              <WalletConnectButton variant="premium" size="sm">
                Connect
              </WalletConnectButton>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
        <div className="bg-card/95 backdrop-blur-xl rounded-xl border border-border/50 p-4 space-y-3">
          <Link 
            to="/" 
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Streams
          </Link>
          <WalletConnectButton variant="premium" size="sm" className="w-full">
            Connect Wallet
          </WalletConnectButton>
        </div>
      </motion.div>
    </motion.header>
  );
}
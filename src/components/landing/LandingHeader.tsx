import { motion } from 'framer-motion';
import { Play, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import WalletConnectButton from '@/components/WalletConnectButton';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Creators', href: '#creators' },
  { label: 'Games', href: '/games', isRoute: true },
];

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className="max-w-7xl mx-auto px-5 py-3.5 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Play className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-varsity text-2xl tracking-wider text-foreground">VYVE</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((item) => (
                item.isRoute ? (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                )
              ))}
            </nav>

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
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ 
          height: mobileMenuOpen ? 'auto' : 0, 
          opacity: mobileMenuOpen ? 1 : 0 
        }}
        className="md:hidden overflow-hidden mx-4 mt-2"
      >
        <div className="bg-card/95 backdrop-blur-xl rounded-xl border border-border/50 p-5 space-y-4">
          {navLinks.map((item) => (
            item.isRoute ? (
              <Link
                key={item.label}
                to={item.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            )
          ))}
          <div className="pt-2">
            <WalletConnectButton variant="premium" size="sm" className="w-full">
              Launch App
            </WalletConnectButton>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}

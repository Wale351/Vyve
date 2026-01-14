import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  Platform: [
    { label: 'Features', href: '#features' },
    { label: 'For Creators', href: '#creators' },
    { label: 'Games', href: '/games', isRoute: true },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Get Testnet ETH', href: 'https://www.alchemy.com/faucets/base-sepolia', external: true },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-border/30 bg-card/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Play className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-varsity text-2xl tracking-wider">VYVE</span>
            </Link>
            
            <p className="text-muted-foreground text-sm max-w-xs mb-6 leading-relaxed">
              Decentralized streaming for web3 gaming. Own your content, earn without limits.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {['Twitter', 'Discord', 'GitHub'].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ y: -2 }}
                  className="w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
                >
                  <span className="text-xs font-medium">{social[0]}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider mb-4 text-foreground">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm inline-flex items-center gap-1"
                      >
                        {link.label}
                        {link.external && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        )}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Vyve. Built on Base Sepolia.</p>
            <p className="text-xs">
              Powered by <span className="text-foreground">Livepeer</span> & <span className="text-foreground">Supabase</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

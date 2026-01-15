import { motion } from 'framer-motion';
import { Play, Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react';

const links = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'For Creators', href: '#creators' },
    { label: 'Roadmap', href: '#' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API', href: '#' },
    { label: 'Get Testnet ETH', href: 'https://www.alchemy.com/faucets/base-sepolia', external: true },
  ],
  community: [
    { label: 'Discord', href: 'https://discord.gg/lovable-dev', external: true },
    { label: 'Twitter', href: '#' },
    { label: 'Blog', href: '#' },
  ],
};

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: MessageCircle, href: 'https://discord.gg/lovable-dev', label: 'Discord' },
  { icon: Github, href: '#', label: 'GitHub' },
];

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-border/30">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div 
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Play className="h-5 w-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-varsity text-3xl tracking-wider">VYVE</span>
            </motion.div>
            
            <p className="text-muted-foreground mb-6 max-w-sm">
              The decentralized streaming platform where creators truly own their content and audience.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {socials.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4 text-foreground">
                {category}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                    >
                      {item.label}
                      {item.external && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Vyve. Built on Base Sepolia Testnet.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

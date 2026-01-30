import { motion } from 'framer-motion';
import { Play, Github, Twitter, ExternalLink } from 'lucide-react';
import { SiDiscord } from 'react-icons/si';

// Fixed brand colors for landing page
const BRAND_PRIMARY = 'hsl(175, 85%, 45%)';
const BRAND_SECONDARY = 'hsl(15, 75%, 55%)';

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
  { icon: SiDiscord, href: 'https://discord.gg/lovable-dev', label: 'Discord' },
  { icon: Github, href: '#', label: 'GitHub' },
];

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-border/30">
      {/* Gradient top border */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${BRAND_PRIMARY.replace(')', ' / 0.5)')}, transparent)` }}
      />

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div 
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(to bottom right, ${BRAND_PRIMARY}, ${BRAND_SECONDARY})` }}
              >
                <Play className="h-5 w-5 text-white" fill="currentColor" />
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
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center transition-colors duration-300"
                  style={{ '--hover-bg': `${BRAND_PRIMARY.replace(')', ' / 0.2)')}` } as React.CSSProperties}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-muted-foreground" />
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
                      className="text-muted-foreground transition-colors duration-200 inline-flex items-center gap-1 group"
                      style={{ '--link-hover': BRAND_PRIMARY } as React.CSSProperties}
                    >
                      <span className="hover:text-[var(--link-hover)]">{item.label}</span>
                      {item.external && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
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
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} Vyve. Built on Base Sepolia Testnet.</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1">
                Powered by <span className="font-semibold text-[#0052FF]">Base</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="transition-colors duration-200" style={{ '--hover': BRAND_PRIMARY } as React.CSSProperties}>Privacy</a>
              <a href="#" className="transition-colors duration-200" style={{ '--hover': BRAND_PRIMARY } as React.CSSProperties}>Terms</a>
              <a href="#" className="transition-colors duration-200" style={{ '--hover': BRAND_PRIMARY } as React.CSSProperties}>Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

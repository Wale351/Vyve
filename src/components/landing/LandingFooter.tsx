import { ExternalLink } from 'lucide-react';
import vyveLogo from '@/assets/vyve-logo.png';

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

export default function LandingFooter() {
  return (
    <footer className="border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={vyveLogo} alt="Vyve" className="w-8 h-8 rounded" />
              <span className="text-lg font-bold tracking-wide uppercase">Vyve</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              The decentralized streaming platform where creators truly own their content and audience.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      {item.label}
                      {item.external && <ExternalLink className="w-3 h-3" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Vyve. Built on Base.</span>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

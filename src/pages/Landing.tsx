import { Play, Zap, Shield, Users, TrendingUp, Sparkles } from 'lucide-react';
import WalletConnectButton from '@/components/WalletConnectButton';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="container flex h-14 md:h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Play className="h-4 w-4 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-display text-xl font-bold">Vyve</span>
          </div>

          <WalletConnectButton variant="premium" size="sm" className="gap-2">
            Connect Wallet
          </WalletConnectButton>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container relative px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Web3 Live Streaming Platform</span>
            </div>
            
            {/* Headline */}
            <h1 
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              Stream. Earn.{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Own Your Content
              </span>
            </h1>
            
            {/* Subheadline */}
            <p 
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              The decentralized streaming platform where creators truly own their audience. 
              Receive tips directly to your wallet. No middlemen.
            </p>
            
            {/* CTA Button */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
              style={{ animationDelay: '300ms' }}
            >
              <WalletConnectButton variant="premium" size="lg" className="gap-2 text-lg px-8 py-6">
                <Play className="h-5 w-5" />
                Get Started
              </WalletConnectButton>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Why Choose Vyve?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built on Base for fast, low-cost transactions. Powered by decentralized infrastructure.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: Zap,
              title: 'Instant Tips',
              description: 'Receive ETH tips directly to your wallet. No waiting, no fees to platforms.',
            },
            {
              icon: Shield,
              title: 'Decentralized',
              description: 'Your content, your rules. Built on decentralized infrastructure.',
            },
            {
              icon: Users,
              title: 'Community Owned',
              description: 'Build genuine connections with your audience without algorithms.',
            },
            {
              icon: TrendingUp,
              title: 'Low Fees',
              description: 'Base network ensures minimal transaction costs for you and your viewers.',
            },
          ].map((feature, i) => (
            <div 
              key={feature.title}
              className="glass-card p-6 text-center hover:border-primary/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${400 + i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Vyve. Built on Base.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

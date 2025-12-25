import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Play, Zap, Shield, Users, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openConnectModal,
              openChainModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button onClick={openConnectModal} variant="premium" size="sm" className="gap-2">
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button onClick={openChainModal} variant="destructive" size="sm">
                          Wrong network
                        </Button>
                      );
                    }

                    return null;
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="container relative px-4 pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8 animate-fade-in"
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Decentralized Streaming on Base</span>
            </div>
            
            {/* Main heading */}
            <h1 
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in tracking-tight"
              style={{ animationDelay: '100ms' }}
            >
              Stream. Earn.{' '}
              <span className="gradient-text">Own</span> it.
            </h1>
            
            <p 
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in leading-relaxed"
              style={{ animationDelay: '200ms' }}
            >
              The first decentralized streaming platform where creators keep 100% of their tips. 
              No middlemen, no cuts, just you and your audience.
            </p>
            
            {/* CTA Button */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
              style={{ animationDelay: '300ms' }}
            >
              <ConnectButton.Custom>
                {({
                  openConnectModal,
                  mounted,
                }) => {
                  const ready = mounted;

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        style: {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      <Button onClick={openConnectModal} variant="premium" size="lg" className="gap-2 text-lg px-8 py-6">
                        <Play className="h-5 w-5" />
                        Get Started
                      </Button>
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Why Vyve?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built for creators who want true ownership of their content and earnings.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <div className="p-6 md:p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Instant Tips</h3>
            <p className="text-muted-foreground">
              Receive ETH tips directly to your wallet. No waiting, no fees.
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">True Ownership</h3>
            <p className="text-muted-foreground">
              Your content, your audience, your rules. Decentralized and censorship-resistant.
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Community First</h3>
            <p className="text-muted-foreground">
              Build genuine connections with your audience. No algorithms in the way.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container px-4 py-16 md:py-24 border-t border-border/30">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-3xl md:text-4xl font-display font-bold mb-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span>100%</span>
            </div>
            <p className="text-muted-foreground">Tips to creators</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-3xl md:text-4xl font-display font-bold mb-2">
              <Zap className="h-8 w-8 text-secondary" />
              <span>0%</span>
            </div>
            <p className="text-muted-foreground">Platform fees</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-3xl md:text-4xl font-display font-bold mb-2">
              <Shield className="h-8 w-8 text-accent" />
              <span>∞</span>
            </div>
            <p className="text-muted-foreground">Freedom</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to start streaming?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Connect your wallet and join the future of content creation.
          </p>
          <ConnectButton.Custom>
            {({
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  <Button onClick={openConnectModal} variant="premium" size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Connect Wallet
                  </Button>
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/50">
        <div className="container px-4 py-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Play className="h-3.5 w-3.5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-display text-lg font-bold">Vyve</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Built on Base • Powered by Livepeer
            </p>
            
            <div className="flex items-center gap-6">
              <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Terms
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Privacy
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Discord
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

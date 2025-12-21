import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Radio, User, Gamepad2, Zap } from 'lucide-react';
import { useAccount } from 'wagmi';

const Header = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo with glow effect */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 blur-lg bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Gamepad2 className="relative h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="font-display text-xl font-bold gradient-text">
              Base Haven
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button
                variant={location.pathname === '/' ? 'glow' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Browse
              </Button>
            </Link>
            {isConnected && (
              <>
                <Link to="/go-live">
                  <Button
                    variant={location.pathname === '/go-live' ? 'glow' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Radio className="h-4 w-4" />
                    Go Live
                  </Button>
                </Link>
                <Link to={`/profile/${address}`}>
                  <Button
                    variant={location.pathname.startsWith('/profile') ? 'glow' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Wallet Connect with custom styling */}
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
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
                      <Button onClick={openConnectModal} variant="neon" className="gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                        Connect Wallet
                      </Button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <Button onClick={openChainModal} variant="destructive" className="gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
                        Wrong network
                      </Button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      {/* Chain selector */}
                      <Button
                        onClick={openChainModal}
                        variant="glass"
                        size="sm"
                        className="hidden sm:flex gap-2"
                      >
                        {chain.hasIcon && (
                          <div
                            className="w-5 h-5 rounded-full overflow-hidden"
                            style={{ background: chain.iconBackground }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                className="w-5 h-5"
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </Button>

                      {/* Account button with glow */}
                      <Button 
                        onClick={openAccountModal} 
                        variant="glass"
                        className="gap-2 group"
                      >
                        {/* Glowing avatar indicator */}
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                            {account.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-neon-green rounded-full border-2 border-background" />
                        </div>
                        
                        <span className="font-medium">{account.displayName}</span>
                        
                        {account.displayBalance && (
                          <span className="hidden sm:inline text-muted-foreground text-xs bg-muted/50 px-2 py-0.5 rounded">
                            {account.displayBalance}
                          </span>
                        )}
                      </Button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
};

export default Header;
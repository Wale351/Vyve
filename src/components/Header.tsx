import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Radio, User, Gamepad2 } from 'lucide-react';
import { useAccount } from 'wagmi';

const Header = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Gamepad2 className="h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 blur-lg bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
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
              >
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

        {/* Wallet Connect */}
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
                      <Button onClick={openConnectModal} variant="neon">
                        Connect Wallet
                      </Button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <Button onClick={openChainModal} variant="destructive">
                        Wrong network
                      </Button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={openChainModal}
                        variant="glass"
                        size="sm"
                        className="hidden sm:flex"
                      >
                        {chain.hasIcon && (
                          <div
                            className="w-4 h-4 rounded-full overflow-hidden mr-1"
                            style={{ background: chain.iconBackground }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                className="w-4 h-4"
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </Button>

                      <Button onClick={openAccountModal} variant="glass">
                        {account.displayName}
                        {account.displayBalance && (
                          <span className="hidden sm:inline text-muted-foreground ml-1">
                            ({account.displayBalance})
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

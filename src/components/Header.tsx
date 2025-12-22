import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Radio, User, Play, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWalletAuth } from '@/hooks/useWalletAuth';

const Header = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { isAuthenticated, isAuthenticating, signInWithWallet, signOut } = useWalletAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/90 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Play className="h-4 w-4 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-display text-xl font-bold">
              Base Haven
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button
                variant={location.pathname === '/' ? 'soft' : 'ghost'}
                size="sm"
              >
                Browse
              </Button>
            </Link>
            {isConnected && isAuthenticated && (
              <>
                <Link to="/go-live">
                  <Button
                    variant={location.pathname === '/go-live' ? 'soft' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Radio className="h-4 w-4" />
                    Go Live
                  </Button>
                </Link>
                <Link to={`/profile/${address}`}>
                  <Button
                    variant={location.pathname.startsWith('/profile') ? 'soft' : 'ghost'}
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

        <div className="flex items-center gap-3">
          {/* Sign In / Sign Out button for connected wallets */}
          {isConnected && !isAuthenticated && (
            <Button 
              onClick={signInWithWallet} 
              variant="soft" 
              size="sm"
              disabled={isAuthenticating}
              className="gap-2"
            >
              {isAuthenticating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {isAuthenticating ? 'Signing...' : 'Sign In'}
            </Button>
          )}
          
          {isConnected && isAuthenticated && (
            <Button 
              onClick={signOut} 
              variant="ghost" 
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          )}

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
                        <Button onClick={openConnectModal} variant="premium" className="gap-2">
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button onClick={openChainModal} variant="destructive" className="gap-2">
                          Wrong network
                        </Button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-2">
                        {/* Chain selector */}
                        <Button
                          onClick={openChainModal}
                          variant="subtle"
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

                        {/* Account button */}
                        <Button 
                          onClick={openAccountModal} 
                          variant="subtle"
                          className="gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                            {account.displayName.charAt(0).toUpperCase()}
                          </div>
                          
                          <span className="font-medium">{account.displayName}</span>
                          
                          {account.displayBalance && (
                            <span className="hidden sm:inline text-muted-foreground text-xs">
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
      </div>
    </header>
  );
};

export default Header;

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Radio, User, Play, LogIn, LogOut, Loader2, Gamepad2, Menu, Home } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWalletAuth } from '@/hooks/useWalletAuth';

const Header = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { isAuthenticated, isAuthenticating, signInWithWallet, signOut } = useWalletAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Browse', icon: Home, show: true },
    { path: '/games', label: 'Games', icon: Gamepad2, show: true },
    { path: '/go-live', label: 'Go Live', icon: Radio, show: isConnected && isAuthenticated },
    { path: `/profile/${address}`, label: 'Profile', icon: User, show: isConnected && isAuthenticated },
  ];

  const NavItem = ({ path, label, icon: Icon, isActive }: { path: string; label: string; icon: any; isActive: boolean }) => (
    <Link 
      to={path} 
      onClick={() => setMobileMenuOpen(false)}
    >
      <Button
        variant={isActive ? 'soft' : 'ghost'}
        size="sm"
        className="w-full justify-start gap-2"
      >
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/90 backdrop-blur-xl">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="p-4 border-b border-border/30">
                  <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Play className="h-4 w-4 text-primary-foreground" fill="currentColor" />
                    </div>
                    <span className="font-display text-xl font-bold">Vyve</span>
                  </Link>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                  {navItems.filter(item => item.show).map(item => (
                    <NavItem
                      key={item.path}
                      path={item.path}
                      label={item.label}
                      icon={item.icon}
                      isActive={item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path)}
                    />
                  ))}
                </nav>

                {/* Mobile Auth Section */}
                <div className="p-4 border-t border-border/30 space-y-3">
                  {isConnected && !isAuthenticated && (
                    <Button 
                      onClick={() => { signInWithWallet(); setMobileMenuOpen(false); }} 
                      variant="soft" 
                      className="w-full gap-2"
                      disabled={isAuthenticating}
                    >
                      {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                      {isAuthenticating ? 'Signing...' : 'Sign In'}
                    </Button>
                  )}
                  
                  {isConnected && isAuthenticated && (
                    <Button 
                      onClick={() => { signOut(); setMobileMenuOpen(false); }} 
                      variant="ghost" 
                      className="w-full gap-2 text-muted-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Play className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-display text-lg md:text-xl font-bold hidden sm:inline">
              Vyve
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.filter(item => item.show).map(item => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={item.path === '/' ? (location.pathname === '/' ? 'soft' : 'ghost') : (location.pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path) ? 'soft' : 'ghost')}
                  size="sm"
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Desktop Sign In / Sign Out */}
          {isConnected && !isAuthenticated && (
            <Button 
              onClick={signInWithWallet} 
              variant="soft" 
              size="sm"
              disabled={isAuthenticating}
              className="hidden md:flex gap-2"
            >
              {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {isAuthenticating ? 'Signing...' : 'Sign In'}
            </Button>
          )}
          
          {isConnected && isAuthenticated && (
            <Button 
              onClick={signOut} 
              variant="ghost" 
              size="sm"
              className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground"
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
                        <Button onClick={openConnectModal} variant="premium" size="sm" className="gap-2 text-sm">
                          <span className="hidden sm:inline">Connect</span>
                          <span className="sm:hidden">Connect</span>
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

                    return (
                      <div className="flex items-center gap-1.5 md:gap-2">
                        {/* Chain selector - hidden on mobile */}
                        <Button
                          onClick={openChainModal}
                          variant="subtle"
                          size="sm"
                          className="hidden lg:flex gap-2 px-2"
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
                          <span className="hidden xl:inline">{chain.name}</span>
                        </Button>

                        {/* Account button */}
                        <Button 
                          onClick={openAccountModal} 
                          variant="subtle"
                          size="sm"
                          className="gap-1.5 md:gap-2 px-2 md:px-3"
                        >
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[9px] md:text-[10px] font-bold text-primary-foreground">
                            {account.displayName.charAt(0).toUpperCase()}
                          </div>
                          
                          <span className="font-medium text-sm hidden sm:inline">{account.displayName}</span>
                          
                          {account.displayBalance && (
                            <span className="hidden lg:inline text-muted-foreground text-xs">
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

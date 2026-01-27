import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Gamepad2, Home, ArrowLeft } from 'lucide-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useOwnProfile } from '@/hooks/useProfile';
import GlobalSearch from '@/components/GlobalSearch';
import MobileSearch from '@/components/MobileSearch';
import ProfileAccountMenu from '@/components/ProfileAccountMenu';
import WalletConnectButton from '@/components/WalletConnectButton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useWalletAuth();
  const { data: profile } = useOwnProfile(user?.id);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isHomePage = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/30 bg-background/90 backdrop-blur-xl">
      <div className="w-full flex h-14 md:h-16 items-center justify-between px-4">
        {/* Left Section - Profile on Home, Back Button elsewhere */}
        <div className="flex items-center gap-2">
          {isHomePage ? (
            // Show profile menu on homepage
            isAuthenticated && profile ? (
              <ProfileAccountMenu>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8 border border-border">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile?.username || 'Profile'} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs">
                        {profile?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </ProfileAccountMenu>
            ) : (
              <WalletConnectButton>Connect</WalletConnectButton>
            )
          ) : (
            // Show back button on all other pages
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Center Section - Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <Link to="/">
            <Button
              variant={location.pathname === '/' ? 'soft' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/games">
            <Button
              variant={location.pathname.startsWith('/games') ? 'soft' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <Gamepad2 className="h-4 w-4" />
              Activities
            </Button>
          </Link>
        </nav>

        {/* Right Section - Search */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Desktop Search */}
          <div className="hidden lg:block">
            <GlobalSearch />
          </div>
        </div>
      </div>
      
      {/* Mobile Search Modal */}
      <MobileSearch open={mobileSearchOpen} onOpenChange={setMobileSearchOpen} />
    </header>
  );
};

export default Header;

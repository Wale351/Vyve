import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';
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
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="w-full flex h-12 md:h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {isHomePage ? (
            isAuthenticated && profile ? (
              <ProfileAccountMenu>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-7 w-7 border border-border">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile?.username || 'Profile'} />
                    ) : (
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {profile?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </Button>
              </ProfileAccountMenu>
            ) : (
              <WalletConnectButton>Connect</WalletConnectButton>
            )
          ) : (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <div className="hidden lg:block">
            <GlobalSearch />
          </div>
        </div>
      </div>
      
      <MobileSearch open={mobileSearchOpen} onOpenChange={setMobileSearchOpen} />
    </motion.header>
  );
};

export default Header;

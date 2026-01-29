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
      className="fixed top-0 left-0 right-0 z-50 w-full glass-subtle"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-full flex h-14 md:h-16 items-center justify-between px-4">
        {/* Left Section - Profile on Home, Back Button elsewhere */}
        <div className="flex items-center gap-2">
          {isHomePage ? (
            // Show profile menu on homepage
            isAuthenticated && profile ? (
              <ProfileAccountMenu>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8 border border-primary/20">
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
              className="h-9 w-9 rounded-xl"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Center Section - Empty on homepage, could add branding later */}
        <div className="hidden md:block" />

        {/* Right Section - Search */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl lg:hidden"
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
    </motion.header>
  );
};

export default Header;

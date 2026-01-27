import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  User,
  Radio,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Wallet,
} from 'lucide-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useOwnProfile, useUserRole } from '@/hooks/useProfile';
import { useBalance } from 'wagmi';
import { formatEther } from 'viem';

interface ProfileAccountMenuProps {
  children?: React.ReactNode;
}

const ProfileAccountMenu = ({ children }: ProfileAccountMenuProps) => {
  const navigate = useNavigate();
  const { user, walletAddress, signOut } = useWalletAuth();
  const { data: profile } = useOwnProfile(user?.id);
  const { data: role } = useUserRole(user?.id);
  
  const { data: balance } = useBalance({
    address: walletAddress as `0x${string}` | undefined,
  });

  const isStreamer = role === 'streamer' || role === 'admin';
  const profileHref = profile?.username ? `/profile/${profile.username}` : '/';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    {
      label: 'Profile',
      icon: User,
      href: profileHref,
      show: true,
    },
    {
      label: 'Go Live',
      icon: Radio,
      href: '/go-live',
      show: isStreamer,
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/analytics',
      show: isStreamer,
    },
    {
      label: 'Communities',
      icon: Users,
      href: '/communities',
      show: true,
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      show: true,
    },
  ];

  const formatBalance = () => {
    if (!balance) return null;
    const formatted = parseFloat(formatEther(balance.value)).toFixed(4);
    return `${formatted} ${balance.symbol}`;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="h-8 w-8 border border-border">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile?.username || 'Profile'} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Account Menu</SheetTitle>
        </SheetHeader>
        
        {/* Profile Header Section */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-border">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile?.username || 'Profile'} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg truncate">{profile?.username || 'User'}</p>
              <p className="text-sm text-muted-foreground capitalize">{role || 'Viewer'}</p>
            </div>
          </div>
          
          {/* Wallet Balance */}
          {balance && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Balance</span>
              </div>
              <p className="mt-1 font-mono font-medium">{formatBalance()}</p>
            </motion.div>
          )}
        </div>
        
        <Separator />
        
        {/* Menu Items */}
        <nav className="p-2">
          <AnimatePresence>
            {menuItems.filter(item => item.show).map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>
        
        <Separator />
        
        {/* Disconnect Button */}
        <div className="p-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Disconnect
            </button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileAccountMenu;

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
  Gamepad2,
  Shield,
  Moon,
  Sun,
  Palette,
} from 'lucide-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useOwnProfile, useUserRole } from '@/hooks/useProfile';
import { useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useTheme, accentColorOptions } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ProfileAccountMenuProps {
  children?: React.ReactNode;
}

const ProfileAccountMenu = ({ children }: ProfileAccountMenuProps) => {
  const navigate = useNavigate();
  const { user, walletAddress, signOut } = useWalletAuth();
  const { data: profile } = useOwnProfile(user?.id);
  const { data: role } = useUserRole(user?.id);
  const { theme, accentColor, toggleTheme, setAccentColor } = useTheme();
  
  const { data: balance } = useBalance({
    address: walletAddress as `0x${string}` | undefined,
  });

  const isStreamer = role === 'streamer' || role === 'admin';
  const isAdmin = role === 'admin';
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
      label: 'Activities',
      icon: Gamepad2,
      href: '/games',
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
      label: 'Admin',
      icon: Shield,
      href: '/admin',
      show: isAdmin,
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      show: true,
    },
  ];

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
      
      <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 flex flex-col glass-card border-r-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Account Menu</SheetTitle>
        </SheetHeader>
        
        {/* Profile Header Section */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-primary/30">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile?.username || 'Profile'} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg">
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              {/* Subtle glow ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-sm -z-10" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg truncate">{profile?.username || 'User'}</p>
              <p className="text-sm font-mono text-muted-foreground">
                {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}` : '0 ETH'}
              </p>
            </div>
          </div>
        </div>
        
        <Separator className="opacity-30" />
        
        {/* Menu Items */}
        <nav className="p-2 flex-1">
          <AnimatePresence>
            {menuItems.filter(item => item.show).map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted/50 transition-all duration-200 active:scale-[0.98]"
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>
        
        {/* Theme Controls */}
        <div className="px-4 pb-2">
          <Separator className="opacity-30 mb-3" />
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted/50 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )}
            </motion.div>
          </button>
          
          {/* Accent Color Picker */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Accent</span>
            </div>
            <div className="flex gap-2 mt-2">
              {accentColorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAccentColor(option.value)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all duration-200',
                    option.class,
                    accentColor === option.value 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' 
                      : 'opacity-60 hover:opacity-100 hover:scale-105'
                  )}
                  title={option.label}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Disconnect Button */}
        <div className="mt-auto">
          <Separator className="opacity-30" />
          <div className="p-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 active:scale-[0.98]"
              >
                <LogOut className="h-5 w-5" />
                Disconnect
              </button>
            </motion.div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileAccountMenu;

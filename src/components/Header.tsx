import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Radio, User, Play, LogOut, Gamepad2, Home, Settings, ChevronDown, Bell, Heart, Coins, BarChart3, Search } from 'lucide-react';
import { useState as useSearchState } from 'react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useOwnProfile, useUserRole } from '@/hooks/useProfile';
import GlobalSearch from '@/components/GlobalSearch';
import MobileSearch from '@/components/MobileSearch';
import { useNotifications, useMarkNotificationsRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, walletAddress, signOut } = useWalletAuth();
  const { data: profile } = useOwnProfile(user?.id);
  const { data: role } = useUserRole(user?.id);
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationsRead();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const profileHref = user?.id ? `/profile/${user.id}` : '/';

  const [localReadKeys, setLocalReadKeys] = useState<Set<string>>(new Set());
  
  // Calculate unread count considering both server state and local state
  const unreadCount = notifications?.filter(n => !n.read && !localReadKeys.has(n.id)).length || 0;

  // Mark notifications as read when dropdown is opened
  useEffect(() => {
    if (notificationsOpen && notifications) {
      const unreadKeys = notifications.filter(n => !n.read && !localReadKeys.has(n.id)).map(n => n.id);
      if (unreadKeys.length > 0) {
        // Immediately update local state to hide the badge
        setLocalReadKeys(prev => new Set([...prev, ...unreadKeys]));
        markRead.mutate(unreadKeys);
      }
    }
  }, [notificationsOpen, notifications]);
  const isStreamer = role === 'streamer' || role === 'admin';

  const navItems = [
    { path: '/games', label: 'Activities', icon: Gamepad2, show: true },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, show: isStreamer },
  ];


  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/30 bg-background/90 backdrop-blur-xl">
      <div className="w-full flex h-14 md:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3 md:gap-8">
          {/* Logo - Always visible on left */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Play className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-display text-lg md:text-xl font-bold">
              Vyve
            </span>
            {/* Testnet Badge */}
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-500 border border-amber-500/30">
              Sepolia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.filter(item => item.show).map(item => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={item.path === '/' ? (location.pathname === '/' ? 'soft' : 'ghost') : (location.pathname.startsWith(item.path) ? 'soft' : 'ghost')}
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
          {/* Desktop Search */}
          <div className="hidden lg:block">
            <GlobalSearch />
          </div>
          
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <MobileSearch open={mobileSearchOpen} onOpenChange={setMobileSearchOpen} />

          {/* Go Live Button for streamers */}
          {isStreamer && (
            <Link to="/go-live" className="hidden md:block">
              <Button variant="premium" size="sm" className="gap-2">
                <Radio className="h-4 w-4" />
                Go Live
              </Button>
            </Link>
          )}

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-popover">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">{unreadCount} new</span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        asChild
                        className="flex items-start gap-3 p-3 cursor-pointer focus:bg-muted"
                      >
                        <Link to={notification.data?.user_id ? `/profile/${notification.data.user_id}` : '#'}>
                          <div className="flex-shrink-0 mt-0.5">
                            {notification.type === 'new_follower' ? (
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Heart className="h-4 w-4 text-primary" />
                              </div>
                            ) : notification.type === 'tip_received' ? (
                              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Coins className="h-4 w-4 text-amber-500" />
                              </div>
                            ) : (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={notification.data?.avatar_url || ''} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications yet
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Profile Avatar Dropdown */}
          {isAuthenticated && profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8 border border-border">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile.username || 'Profile'} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs">
                        {profile.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <div className="px-2 py-1.5">
                  <p className="font-medium">{profile.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role || 'Viewer'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={profileHref} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {isStreamer && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/go-live" className="cursor-pointer">
                        <Radio className="mr-2 h-4 w-4" />
                        Go Live
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/analytics" className="cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

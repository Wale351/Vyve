import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
import { Radio, User, Play, LogOut, Gamepad2, Menu, Home, Settings, ChevronDown, Bell, Heart, Coins, BarChart3 } from 'lucide-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useOwnProfile, useUserRole } from '@/hooks/useProfile';
import GlobalSearch from '@/components/GlobalSearch';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Mark notifications as read when dropdown is opened
  useEffect(() => {
    if (notificationsOpen && notifications) {
      const unreadKeys = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadKeys.length > 0) {
        markRead.mutate(unreadKeys);
      }
    }
  }, [notificationsOpen, notifications]);
  const isStreamer = role === 'streamer' || role === 'admin';

  const navItems = [
    { path: '/', label: 'Browse', icon: Home, show: true },
    { path: '/games', label: 'Games', icon: Gamepad2, show: true },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, show: isStreamer },
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
                      isActive={item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)}
                    />
                  ))}
                  
                  {isStreamer && (
                    <>
                      <NavItem
                        path="/go-live"
                        label="Go Live"
                        icon={Radio}
                        isActive={location.pathname === '/go-live'}
                      />
                      <NavItem
                        path="/analytics"
                        label="Analytics"
                        icon={BarChart3}
                        isActive={location.pathname.startsWith('/analytics')}
                      />
                    </>
                  )}
                </nav>

                {/* Mobile User Section */}
                {isAuthenticated && profile && (
                  <div className="p-4 border-t border-border/30 space-y-2">
                    {/* Mobile Notifications */}
                    <Link to="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between">
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-destructive" />
                        )}
                      </Button>
                    </Link>
                    <Link to={`/profile/${walletAddress}`} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-muted-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Disconnect
                    </Button>
                  </div>
                )}
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

          {/* Global Search - Desktop */}
          <div className="hidden lg:block">
            <GlobalSearch />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
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
                  <Link to={`/profile/${walletAddress}`} className="cursor-pointer">
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

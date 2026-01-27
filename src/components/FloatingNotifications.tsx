import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Bell, Heart, Coins, User, X } from 'lucide-react';
import { useNotifications, useMarkNotificationsRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const FloatingNotifications = () => {
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const [open, setOpen] = useState(false);
  const [localReadKeys, setLocalReadKeys] = useState<Set<string>>(new Set());

  const unreadCount = notifications?.filter(n => !n.read && !localReadKeys.has(n.id)).length || 0;

  // Mark notifications as read when panel is opened
  useEffect(() => {
    if (open && notifications) {
      const unreadKeys = notifications.filter(n => !n.read && !localReadKeys.has(n.id)).map(n => n.id);
      if (unreadKeys.length > 0) {
        setLocalReadKeys(prev => new Set([...prev, ...unreadKeys]));
        markRead.mutate(unreadKeys);
      }
    }
  }, [open, notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_follower':
        return (
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
          </div>
        );
      case 'tip_received':
        return (
          <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Coins className="h-5 w-5 text-amber-500" />
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
        );
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full bg-muted/60 backdrop-blur-sm border border-border/50 hover:bg-muted hover:border-border shadow-sm relative"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <AnimatePresence mode="popLayout">
            {notifications && notifications.length > 0 ? (
              <div className="divide-y divide-border/50">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={notification.data?.username ? `/profile/${notification.data.username}` : '#'}
                      className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {notification.type === 'new_follower' || notification.type === 'tip_received' ? (
                        getNotificationIcon(notification.type)
                      ) : (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={notification.data?.avatar_url || ''} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 px-4"
              >
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">No notifications yet</p>
                <p className="text-sm text-muted-foreground/70 text-center mt-1">
                  When you get notifications, they'll show up here
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default FloatingNotifications;

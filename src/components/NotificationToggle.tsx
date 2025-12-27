import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationPreference, useToggleNotifications } from '@/hooks/useNotificationPreferences';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useIsFollowing } from '@/hooks/useProfile';

interface NotificationToggleProps {
  streamerId: string;
  className?: string;
}

const NotificationToggle = ({ streamerId, className }: NotificationToggleProps) => {
  const { user, isAuthenticated } = useWalletAuth();
  const { data: preference, isLoading: prefLoading } = useNotificationPreference(streamerId);
  const { data: isFollowing } = useIsFollowing(user?.id, streamerId);
  const toggleNotifications = useToggleNotifications();

  // Only show for authenticated users who follow this streamer
  if (!isAuthenticated || !isFollowing || user?.id === streamerId) {
    return null;
  }

  const isEnabled = preference?.notify_on_live === true;
  const isLoading = prefLoading || toggleNotifications.isPending;

  const handleToggle = () => {
    toggleNotifications.mutate({ streamerId, enabled: !isEnabled });
  };

  return (
    <Button
      variant={isEnabled ? 'soft' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={className}
      title={isEnabled ? 'Notifications enabled - Click to disable' : 'Get notified when they go live'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isEnabled ? (
        <>
          <Bell className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Notifications On</span>
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Notify Me</span>
        </>
      )}
    </Button>
  );
};

export default NotificationToggle;

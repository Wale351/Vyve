import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';
import { useIsFollowing } from '@/hooks/useProfile';
import { useFollow, useUnfollow } from '@/hooks/useFollow';

interface FollowButtonProps {
  profileId: string;
  className?: string;
}

const FollowButton = ({ profileId, className }: FollowButtonProps) => {
  const { user, isAuthenticated } = usePrivyAuth();
  const { data: isFollowing, isLoading: checkingFollow } = useIsFollowing(user?.id, profileId);
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  const isLoading = checkingFollow || followMutation.isPending || unfollowMutation.isPending;

  if (!isAuthenticated || !user?.id || user.id === profileId) {
    return null;
  }

  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate({ followerId: user.id, followingId: profileId });
    } else {
      followMutation.mutate({ followerId: user.id, followingId: profileId });
    }
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : 'premium'}
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;

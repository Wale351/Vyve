import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import FollowButton from '@/components/FollowButton';
import BaseNameBadge from '@/components/BaseNameBadge';
import { User, BadgeCheck, Calendar, Hexagon } from 'lucide-react';
import { useProfile, useFollowerCount } from '@/hooks/useProfile';
import { formatDistanceToNow } from 'date-fns';

interface UserHoverCardProps {
  userId: string;
  children: React.ReactNode;
}

const UserHoverCard = ({ userId, children }: UserHoverCardProps) => {
  const { data: profile, isLoading } = useProfile(userId);
  const { data: followerCount = 0 } = useFollowerCount(userId);

  if (!userId) return <>{children}</>;

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-72" align="start">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : profile ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Link to={`/profile/${profile.username}`}>
                <Avatar className="h-12 w-12 border-2 border-border hover:border-primary/50 transition-colors">
                  {profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.username} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                      {profile.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/profile/${profile.username}`} className="flex items-center gap-1 hover:underline">
                  <span className="font-semibold truncate">{profile.username}</span>
                  {profile.verified_creator && (
                    <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                  {profile.has_base_name && <BaseNameBadge size="sm" />}
                </div>
              </div>
            </div>
            
            {profile.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
              <div className="flex items-center gap-4">
                <span><strong className="text-foreground">{followerCount}</strong> followers</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: false })}</span>
              </div>
            </div>
            
            <FollowButton profileId={userId} className="w-full" />
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            User not found
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserHoverCard;

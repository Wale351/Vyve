import { Badge } from '@/components/ui/badge';
import { BadgeCheck, Star, Coins, Radio, Users, Eye, Flame, Crown, Zap, Trophy, Heart } from 'lucide-react';
import { PublicProfile } from '@/hooks/useProfile';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfileBadgesProps {
  profile: PublicProfile;
  tipsReceived?: number;
  tipsSent?: number;
  followerCount?: number;
  streamCount?: number;
  totalViews?: number;
}

const BadgeWithTooltip = ({ 
  children, 
  label 
}: { 
  children: React.ReactNode; 
  label: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent><p>{label}</p></TooltipContent>
  </Tooltip>
);

const ProfileBadges = ({ 
  profile, 
  tipsReceived = 0,
  tipsSent = 0,
  followerCount = 0,
  streamCount = 0,
  totalViews = 0,
}: ProfileBadgesProps) => {
  const badges = [];

  // Verified badge (highest priority)
  if (profile.verified_creator) {
    badges.push(
      <BadgeWithTooltip key="verified" label="Verified Creator">
        <Badge variant="default" className="gap-1 bg-primary/20 text-primary border-primary/30">
          <BadgeCheck className="h-3 w-3" />
          Verified
        </Badge>
      </BadgeWithTooltip>
    );
  }

  // Streamer badge
  if (profile.role === 'streamer' || profile.role === 'admin') {
    badges.push(
      <BadgeWithTooltip key="streamer" label="Can go live">
        <Badge variant="secondary" className="gap-1">
          <Radio className="h-3 w-3" />
          Streamer
        </Badge>
      </BadgeWithTooltip>
    );
  }

  // Follower milestone badges (only show highest)
  if (followerCount >= 10000) {
    badges.push(
      <BadgeWithTooltip key="legend" label="10,000+ followers">
        <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-400 bg-amber-500/10">
          <Crown className="h-3 w-3" />
          Legend
        </Badge>
      </BadgeWithTooltip>
    );
  } else if (followerCount >= 1000) {
    badges.push(
      <BadgeWithTooltip key="influencer" label="1,000+ followers">
        <Badge variant="outline" className="gap-1 border-pink-500/50 text-pink-400">
          <Flame className="h-3 w-3" />
          Influencer
        </Badge>
      </BadgeWithTooltip>
    );
  } else if (followerCount >= 100) {
    badges.push(
      <BadgeWithTooltip key="rising" label="100+ followers">
        <Badge variant="outline" className="gap-1 border-cyan-500/50 text-cyan-400">
          <Users className="h-3 w-3" />
          Rising Star
        </Badge>
      </BadgeWithTooltip>
    );
  }

  // Stream count badges (only show highest)
  if (streamCount >= 100) {
    badges.push(
      <BadgeWithTooltip key="veteran" label="100+ streams">
        <Badge variant="outline" className="gap-1 border-emerald-500/50 text-emerald-400">
          <Trophy className="h-3 w-3" />
          Veteran
        </Badge>
      </BadgeWithTooltip>
    );
  } else if (streamCount >= 10) {
    badges.push(
      <BadgeWithTooltip key="regular" label="10+ streams">
        <Badge variant="outline" className="gap-1 border-green-500/50 text-green-400">
          <Zap className="h-3 w-3" />
          Regular
        </Badge>
      </BadgeWithTooltip>
    );
  }

  // Viewer engagement badges (only show highest)
  if (totalViews >= 10000) {
    badges.push(
      <BadgeWithTooltip key="superstar" label="10,000+ total views">
        <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-400">
          <Star className="h-3 w-3" />
          Superstar
        </Badge>
      </BadgeWithTooltip>
    );
  } else if (totalViews >= 1000) {
    badges.push(
      <BadgeWithTooltip key="crowd-favorite" label="1,000+ total views">
        <Badge variant="outline" className="gap-1 border-orange-500/50 text-orange-400">
          <Eye className="h-3 w-3" />
          Crowd Favorite
        </Badge>
      </BadgeWithTooltip>
    );
  }

  // Top Earner badge (received tips)
  if (tipsReceived >= 1) {
    badges.push(
      <BadgeWithTooltip key="top-earner" label="Received 1+ ETH in tips">
        <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-500">
          <Coins className="h-3 w-3" />
          Top Earner
        </Badge>
      </BadgeWithTooltip>
    );
  }

  // Generous tipper badge (sent tips)
  if (tipsSent >= 1) {
    badges.push(
      <BadgeWithTooltip key="whale" label="Tipped 1+ ETH total">
        <Badge variant="outline" className="gap-1 border-blue-500/50 text-blue-400">
          <Heart className="h-3 w-3" />
          Whale
        </Badge>
      </BadgeWithTooltip>
    );
  } else if (tipsSent >= 0.1) {
    badges.push(
      <BadgeWithTooltip key="generous" label="Tipped 0.1+ ETH total">
        <Badge variant="outline" className="gap-1 border-sky-500/50 text-sky-400">
          <Heart className="h-3 w-3" />
          Generous
        </Badge>
      </BadgeWithTooltip>
    );
  }

  // Early User badge (joined before 2025)
  const joinDate = new Date(profile.created_at);
  const earlyUserCutoff = new Date('2025-06-01');
  if (joinDate < earlyUserCutoff) {
    badges.push(
      <BadgeWithTooltip key="early-user" label="Joined before June 2025">
        <Badge variant="outline" className="gap-1 border-purple-500/50 text-purple-400">
          <Star className="h-3 w-3" />
          Early User
        </Badge>
      </BadgeWithTooltip>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges}
    </div>
  );
};

export default ProfileBadges;

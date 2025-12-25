import { Badge } from '@/components/ui/badge';
import { BadgeCheck, Star, Coins, Radio } from 'lucide-react';
import { PublicProfile } from '@/hooks/useProfile';

interface ProfileBadgesProps {
  profile: PublicProfile;
  tipsReceived?: number;
}

const ProfileBadges = ({ profile, tipsReceived = 0 }: ProfileBadgesProps) => {
  const badges = [];

  // Verified badge
  if (profile.verified_creator) {
    badges.push(
      <Badge key="verified" variant="default" className="gap-1 bg-primary/20 text-primary border-primary/30">
        <BadgeCheck className="h-3 w-3" />
        Verified
      </Badge>
    );
  }

  // Streamer badge
  if (profile.role === 'streamer' || profile.role === 'admin') {
    badges.push(
      <Badge key="streamer" variant="secondary" className="gap-1">
        <Radio className="h-3 w-3" />
        Streamer
      </Badge>
    );
  }

  // Top Tipper badge (if received more than 1 ETH)
  if (tipsReceived >= 1) {
    badges.push(
      <Badge key="top-tipper" variant="outline" className="gap-1 border-amber-500/50 text-amber-500">
        <Coins className="h-3 w-3" />
        Top Earner
      </Badge>
    );
  }

  // Early User badge (joined before 2025)
  const joinDate = new Date(profile.created_at);
  const earlyUserCutoff = new Date('2025-06-01');
  if (joinDate < earlyUserCutoff) {
    badges.push(
      <Badge key="early-user" variant="outline" className="gap-1 border-purple-500/50 text-purple-400">
        <Star className="h-3 w-3" />
        Early User
      </Badge>
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

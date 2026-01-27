import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, Shield, Star, Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommunityMembers } from '@/hooks/useCommunities';

interface CommunityMembersProps {
  communityId: string;
  ownerId: string;
  owner?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

const getRoleBadge = (role: string, isOwner: boolean) => {
  if (isOwner) {
    return (
      <Badge variant="default" className="gap-1 bg-gradient-to-r from-yellow-500 to-orange-500">
        <Crown className="h-3 w-3" />
        Owner
      </Badge>
    );
  }

  switch (role) {
    case 'admin':
      return (
        <Badge variant="secondary" className="gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );
    case 'moderator':
      return (
        <Badge variant="outline" className="gap-1">
          <Star className="h-3 w-3" />
          Mod
        </Badge>
      );
    default:
      return null;
  }
};

const CommunityMembers = ({ communityId, ownerId, owner }: CommunityMembersProps) => {
  const { data: members, isLoading } = useCommunityMembers(communityId);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-3 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Combine owner with members
  const allMembers = [
    ...(owner ? [{
      user: owner,
      role: 'owner' as const,
      isOwner: true,
    }] : []),
    ...(members?.map(m => ({
      user: m.user,
      role: m.role as string,
      isOwner: false,
    })) || []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span className="text-sm">{allMembers.length} members</span>
      </div>

      {allMembers.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {allMembers.map((member, index) => (
            <motion.div
              key={member.user?.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link to={`/profile/${member.user?.username}`}>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {member.user?.avatar_url ? (
                        <AvatarImage src={member.user.avatar_url} alt={member.user.username} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                          {member.user?.username?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {member.user?.username || 'Unknown'}
                        </span>
                        {getRoleBadge(member.role, member.isOwner)}
                      </div>
                      {(member.user as any)?.verified_creator && (
                        <p className="text-xs text-muted-foreground">Verified Creator</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-medium mb-2">No members yet</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to join this community!
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunityMembers;

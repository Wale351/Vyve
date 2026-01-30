import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Radio, Calendar, Shield, Hexagon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Community, useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunities';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { cn } from '@/lib/utils';

interface CommunityCardProps {
  community: Community;
  index?: number;
}

const CommunityCard = ({ community, index = 0 }: CommunityCardProps) => {
  const { isAuthenticated } = useWalletAuth();
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();

  const isOwner = community.owner?.id === community.owner_id;
  const isPending = joinMutation.isPending || leaveMutation.isPending;

  const handleJoinLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (community.is_member) {
      leaveMutation.mutate({ communityId: community.id, slug: community.slug });
    } else {
      joinMutation.mutate({ communityId: community.id, slug: community.slug });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/communities/${community.slug}`}>
        <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 group">
          {/* Banner */}
          <div className="relative h-24 bg-gradient-to-br from-primary/20 to-secondary/20">
            {community.banner_url && (
              <img 
                src={community.banner_url} 
                alt="" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            
            {/* Avatar overlay */}
            <div className="absolute -bottom-6 left-4">
              <Avatar className="h-14 w-14 border-4 border-card shadow-lg">
                {community.avatar_url ? (
                  <AvatarImage src={community.avatar_url} alt={community.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                    {community.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            {/* Status badges */}
            <div className="absolute top-2 right-2 flex gap-1.5">
              {community.has_live_stream && (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <Radio className="h-3 w-3 animate-pulse" />
                  LIVE
                </Badge>
              )}
              {(community.is_nft_gated || community.is_ens_gated) && (
                <Badge variant="outline" className="gap-1 text-xs bg-card/80 border-primary/30">
                  {community.is_nft_gated && <Shield className="h-3 w-3" />}
                  {community.is_ens_gated && <Hexagon className="h-3 w-3" />}
                  Gated
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="pt-8 pb-4 space-y-3">
            {/* Name and description */}
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {community.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {community.short_description || community.description || 'No description'}
              </p>
            </div>

            {/* Owner info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                {community.owner?.avatar_url ? (
                  <AvatarImage src={community.owner.avatar_url} alt={community.owner.username} />
                ) : (
                  <AvatarFallback className="text-[10px] bg-muted">
                    {community.owner?.username?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-xs text-muted-foreground">
                by <span className="text-foreground">{community.owner?.username || 'Unknown'}</span>
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{community.member_count.toLocaleString()} members</span>
              </div>

              {isAuthenticated && !isOwner && (
                <Button
                  size="sm"
                  variant={community.is_member ? "outline" : "default"}
                  className={cn(
                    "h-7 text-xs px-3",
                    community.is_member && "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  )}
                  onClick={handleJoinLeave}
                  disabled={isPending}
                >
                  {isPending ? '...' : community.is_member ? 'Leave' : 'Join'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default CommunityCard;

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Bell, BellOff, Users, Calendar, 
  MessageSquare, Gift, Shield, Hexagon, Settings
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import CommunityFeed from '@/components/communities/CommunityFeed';
import CommunitySchedule from '@/components/communities/CommunitySchedule';
import CommunityPolls from '@/components/communities/CommunityPolls';
import CommunityMembers from '@/components/communities/CommunityMembers';
import { useCommunity, useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunities';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { cn } from '@/lib/utils';

const CommunityDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useWalletAuth();
  const { data: community, isLoading } = useCommunity(slug || '');
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  const isOwner = community?.owner_id === user?.id;
  const isPending = joinMutation.isPending || leaveMutation.isPending;

  const handleJoinLeave = () => {
    if (!community || !slug) return;
    
    if (community.is_member) {
      leaveMutation.mutate({ communityId: community.id, slug });
    } else {
      joinMutation.mutate({ communityId: community.id, slug });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <Skeleton className="h-48 w-full" />
          <div className="max-w-4xl mx-auto px-4 -mt-12">
            <div className="flex items-end gap-4 mb-6">
              <Skeleton className="h-24 w-24 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-4 max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Community not found</h1>
          <Button asChild>
            <Link to="/communities">Back to Communities</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/30 to-secondary/30">
        {community.banner_url && (
          <img 
            src={community.banner_url} 
            alt="" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-20 relative z-10 pb-8">
        {/* Community Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end gap-4 mb-6"
        >
          <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-xl rounded-xl">
            {community.avatar_url ? (
              <AvatarImage src={community.avatar_url} alt={community.name} className="rounded-lg" />
            ) : (
              <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl font-bold">
                {community.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">{community.name}</h1>
              {(community.is_nft_gated || community.is_ens_gated) && (
                <Badge variant="outline" className="gap-1 border-primary/30">
                  {community.is_nft_gated && <Shield className="h-3 w-3" />}
                  {community.is_ens_gated && <Hexagon className="h-3 w-3" />}
                  Gated
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Link 
                to={`/profile/${community.owner?.username}`}
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Avatar className="h-5 w-5">
                  {community.owner?.avatar_url ? (
                    <AvatarImage src={community.owner.avatar_url} />
                  ) : (
                    <AvatarFallback className="text-[10px]">
                      {community.owner?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span>{community.owner?.username}</span>
              </Link>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {community.member_count.toLocaleString()} members
              </span>
            </div>

            {community.short_description && (
              <p className="text-muted-foreground">{community.short_description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && community.is_member && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={cn(notificationsEnabled && "text-primary")}
              >
                {notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
              </Button>
            )}

            {isOwner && (
              <Button variant="outline" size="icon" asChild>
                <Link to={`/communities/${slug}/settings`}>
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {isAuthenticated && !isOwner && (
              <Button
                variant={community.is_member ? "outline" : "default"}
                onClick={handleJoinLeave}
                disabled={isPending}
                className={cn(
                  community.is_member && "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                )}
              >
                {isPending ? 'Loading...' : community.is_member ? 'Leave Community' : 'Join Community'}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-muted/50 p-1 overflow-x-auto">
            <TabsTrigger value="feed" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="polls" className="gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Polls & Giveaways</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="feed" className="mt-6">
                <CommunityFeed 
                  communityId={community.id} 
                  isOwner={isOwner} 
                  isMember={community.is_member || false}
                />
              </TabsContent>

              <TabsContent value="schedule" className="mt-6">
                <CommunitySchedule 
                  communityId={community.id} 
                  ownerId={community.owner_id}
                />
              </TabsContent>

              <TabsContent value="polls" className="mt-6">
                <CommunityPolls 
                  communityId={community.id} 
                  isOwner={isOwner}
                />
              </TabsContent>

              <TabsContent value="members" className="mt-6">
                <CommunityMembers 
                  communityId={community.id}
                  ownerId={community.owner_id}
                  owner={community.owner}
                />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
};

export default CommunityDetail;

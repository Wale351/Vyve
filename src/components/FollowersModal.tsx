import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FollowersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  initialTab?: 'followers' | 'following';
}

interface FollowUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

const useFollowersList = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['followers-list', profileId],
    queryFn: async (): Promise<FollowUser[]> => {
      if (!profileId) return [];

      // First get all follower IDs
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', profileId)
        .order('created_at', { ascending: false });

      if (followsError) throw followsError;
      if (!followsData || followsData.length === 0) return [];

      const followerIds = followsData.map(f => f.follower_id);

      // Then fetch profiles for those IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('public_profiles')
        .select('id, username, avatar_url')
        .in('id', followerIds);

      if (profilesError) throw profilesError;

      return (profilesData || []).filter((p): p is FollowUser => p.id !== null);
    },
    enabled: !!profileId,
  });
};

const useFollowingList = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['following-list', profileId],
    queryFn: async (): Promise<FollowUser[]> => {
      if (!profileId) return [];

      // First get all following IDs
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', profileId)
        .order('created_at', { ascending: false });

      if (followsError) throw followsError;
      if (!followsData || followsData.length === 0) return [];

      const followingIds = followsData.map(f => f.following_id);

      // Then fetch profiles for those IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('public_profiles')
        .select('id, username, avatar_url')
        .in('id', followingIds);

      if (profilesError) throw profilesError;

      return (profilesData || []).filter((p): p is FollowUser => p.id !== null);
    },
    enabled: !!profileId,
  });
};

const UserListItem = ({ user, onClick }: { user: FollowUser; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left rounded-lg"
  >
    <Avatar className="h-10 w-10">
      {user.avatar_url ? (
        <AvatarImage src={user.avatar_url} alt={user.username || ''} />
      ) : (
        <AvatarFallback className="bg-primary/20">
          <User className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="font-medium truncate">{user.username || 'Unknown'}</p>
    </div>
  </button>
);

const FollowersModal = ({ open, onOpenChange, profileId, initialTab = 'followers' }: FollowersModalProps) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(initialTab);
  
  const { data: followers = [], isLoading: followersLoading } = useFollowersList(open ? profileId : undefined);
  const { data: following = [], isLoading: followingLoading } = useFollowingList(open ? profileId : undefined);

  const handleUserClick = (username: string | null) => {
    if (!username) return;
    onOpenChange(false);
    navigate(`/profile/${username}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'followers' | 'following')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
            <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-4">
            <ScrollArea className="h-[300px]">
              {followersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : followers.length > 0 ? (
                <div className="space-y-1">
                  {followers.map((user) => (
                    <UserListItem 
                      key={user.id} 
                      user={user} 
                      onClick={() => handleUserClick(user.username)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No followers yet
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="following" className="mt-4">
            <ScrollArea className="h-[300px]">
              {followingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : following.length > 0 ? (
                <div className="space-y-1">
                  {following.map((user) => (
                    <UserListItem 
                      key={user.id} 
                      user={user} 
                      onClick={() => handleUserClick(user.username)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Not following anyone
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;

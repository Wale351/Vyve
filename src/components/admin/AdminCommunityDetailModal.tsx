import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import {
  X,
  Users,
  MessageSquare,
  AlertTriangle,
  History,
  Shield,
  Hexagon,
  Pin,
  Trash2,
  UserMinus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BadgeCheck,
  Crown,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AdminCommunity,
  useAdminCommunityPosts,
  useAdminCommunityMembers,
  useAdminCommunityReports,
  useAdminCommunityAuditLogs,
  useAdminDeletePost,
  useAdminPinPost,
  useAdminKickMember,
  useAdminReviewReport,
} from '@/hooks/useAdminCommunities';

interface AdminCommunityDetailModalProps {
  community: AdminCommunity;
  onClose: () => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    active: { variant: 'default', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
    pending: { variant: 'outline', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    suspended: { variant: 'destructive' },
  };
  const config = variants[status] || variants.pending;
  return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
};

// Overview Tab
const OverviewTab = ({ community }: { community: AdminCommunity }) => (
  <div className="space-y-6">
    {/* Basic Info */}
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Community Info</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <StatusBadge status={community.status} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Members</p>
          <p className="font-medium">{community.member_count}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Created</p>
          <p className="font-medium">{format(new Date(community.created_at), 'PPP')}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Owner</p>
          <Link 
            to={`/profile/${community.owner?.username}`}
            className="font-medium hover:text-primary flex items-center gap-1"
          >
            @{community.owner?.username}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>

    {/* Description */}
    {community.description && (
      <div className="space-y-2">
        <h3 className="font-semibold">Description</h3>
        <p className="text-muted-foreground">{community.description}</p>
      </div>
    )}

    {/* Rules */}
    {community.rules && (
      <div className="space-y-2">
        <h3 className="font-semibold">Rules</h3>
        <p className="text-muted-foreground whitespace-pre-wrap">{community.rules}</p>
      </div>
    )}

    {/* Gating Config */}
    <div className="space-y-2">
      <h3 className="font-semibold">Access Control</h3>
      <div className="flex flex-wrap gap-2">
        {community.is_nft_gated ? (
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            NFT Gated: {community.nft_contract_address?.slice(0, 10)}...
          </Badge>
        ) : null}
        {community.is_ens_gated ? (
          <Badge variant="outline" className="gap-1">
            <Hexagon className="h-3 w-3" />
            ENS Gated: {community.required_ens_suffix || 'Any'}
          </Badge>
        ) : null}
        {!community.is_nft_gated && !community.is_ens_gated && (
          <Badge variant="secondary">Open to all</Badge>
        )}
      </div>
    </div>
  </div>
);

// Posts Tab
const PostsTab = ({ communityId }: { communityId: string }) => {
  const { data: posts, isLoading } = useAdminCommunityPosts(communityId);
  const deletePost = useAdminDeletePost();
  const pinPost = useAdminPinPost();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        No posts yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post: any) => (
        <div key={post.id} className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author?.avatar_url} />
                <AvatarFallback>{post.author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link to={`/profile/${post.author?.username}`} className="font-medium hover:text-primary">
                    @{post.author?.username}
                  </Link>
                  {post.is_pinned && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Pin className="h-3 w-3" /> Pinned
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">{post.post_type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{post.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => pinPost.mutate({ postId: post.id, pinned: !post.is_pinned })}
              >
                <Pin className={`h-4 w-4 ${post.is_pinned ? 'text-primary' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => deletePost.mutate({ postId: post.id })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Members Tab
const MembersTab = ({ communityId, ownerId }: { communityId: string; ownerId: string }) => {
  const { data: members, isLoading } = useAdminCommunityMembers(communityId);
  const kickMember = useAdminKickMember();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!members?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        No members yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member: any) => {
        const isOwner = member.user_id === ownerId;
        return (
          <div key={member.id} className="p-3 rounded-lg bg-muted/50 border border-border/50 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.user?.avatar_url} />
              <AvatarFallback>{member.user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${member.user?.username}`} className="font-medium hover:text-primary">
                  @{member.user?.username}
                </Link>
                {member.user?.verified_creator && <BadgeCheck className="h-4 w-4 text-primary" />}
                {isOwner && (
                  <Badge className="gap-1 text-xs bg-primary/20 text-primary border-primary/30">
                    <Crown className="h-3 w-3" /> Owner
                  </Badge>
                )}
                {member.role === 'admin' && !isOwner && (
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
                {member.role === 'moderator' && (
                  <Badge variant="outline" className="text-xs">Mod</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
              </p>
            </div>
            {!isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => kickMember.mutate({ membershipId: member.id })}
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Reports Tab
const ReportsTab = ({ communityId }: { communityId: string }) => {
  const { data: reports, isLoading } = useAdminCommunityReports(communityId);
  const reviewReport = useAdminReviewReport();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!reports?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        No reports
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report.id} className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{report.target_type}</Badge>
                <Badge
                  variant={report.status === 'pending' ? 'destructive' : 'secondary'}
                >
                  {report.status}
                </Badge>
              </div>
              <p className="font-medium mb-1">{report.reason}</p>
              {report.description && (
                <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Reported by @{report.reporter?.username} •{' '}
                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </p>
            </div>
            {report.status === 'pending' && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-500 border-green-500/30"
                  onClick={() => reviewReport.mutate({ reportId: report.id, status: 'dismissed' })}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Dismiss
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30"
                  onClick={() => reviewReport.mutate({ reportId: report.id, status: 'actioned' })}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Action
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Audit Log Tab
const AuditLogTab = ({ communityId }: { communityId: string }) => {
  const { data: logs, isLoading } = useAdminCommunityAuditLogs(communityId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!logs?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
        No audit logs
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log: any) => (
        <div key={log.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">{log.action_type}</Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(log.created_at), 'PPp')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Target: {log.target_type}
          </p>
        </div>
      ))}
    </div>
  );
};

const AdminCommunityDetailModal = ({ community, onClose }: AdminCommunityDetailModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-background border border-border rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-4">
          <Avatar className="h-14 w-14 rounded-xl">
            {community.avatar_url ? (
              <AvatarImage src={community.avatar_url} className="rounded-xl" />
            ) : (
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xl">
                {community.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold truncate">{community.name}</h2>
              <StatusBadge status={community.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              by @{community.owner?.username} • {community.member_count} members
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-4 justify-start bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="overview" className="mt-0">
              <OverviewTab community={community} />
            </TabsContent>
            <TabsContent value="posts" className="mt-0">
              <PostsTab communityId={community.id} />
            </TabsContent>
            <TabsContent value="members" className="mt-0">
              <MembersTab communityId={community.id} ownerId={community.owner_id} />
            </TabsContent>
            <TabsContent value="reports" className="mt-0">
              <ReportsTab communityId={community.id} />
            </TabsContent>
            <TabsContent value="audit" className="mt-0">
              <AuditLogTab communityId={community.id} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCommunityDetailModal;

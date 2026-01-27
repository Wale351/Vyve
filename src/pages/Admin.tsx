import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Radio, 
  FileText, 
  Coins, 
  Search,
  Loader2,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Ban,
  Volume2,
  VolumeX,
  BadgeCheck,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useUserRole } from '@/hooks/useProfile';
import { 
  useAdminStats, 
  useAdminSearchUsers,
  useAdminUsersPaged,
  useAdminLiveStreams,
  useSetUserRole,
  useSuspendUser,
  useUnsuspendUser,
  useGlobalMuteUser,
  useGlobalUnmuteUser,
  useAdminEndStream,
  useAdminSetStreamHidden,
  useSetUserVerified,
} from '@/hooks/useAdmin';
import { 
  useAllApplications, 
  useApproveApplication, 
  useRejectApplication 
} from '@/hooks/useStreamerApplication';
import { usePendingVerifications, useReviewVerification } from '@/hooks/useVerification';
import AdminCommunities from '@/components/admin/AdminCommunities';

export default function Admin() {
  const { user, isAuthenticated, isInitialized } = useWalletAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole(user?.id);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('pending');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<{ type: string; data?: any } | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const usersPaged = useAdminUsersPaged(50);
  const { data: searchResults = [], isLoading: searchLoading } = useAdminSearchUsers(searchQuery);
  const { data: liveStreams = [], isLoading: streamsLoading } = useAdminLiveStreams();
  const { data: applications = [], isLoading: appsLoading } = useAllApplications(applicationFilter);
  const { data: verifications = [], isLoading: verificationsLoading } = usePendingVerifications();
  
  const pagedUsers = usersPaged.data?.pages?.flat() || [];
  // Use search results if searching, otherwise show paged users
  const displayedUsers = searchQuery.length >= 2 ? searchResults : pagedUsers;
  const usersLoading = searchQuery.length >= 2 ? searchLoading : usersPaged.isLoading;

  const setUserRole = useSetUserRole();
  const suspendUser = useSuspendUser();
  const unsuspendUser = useUnsuspendUser();
  const globalMute = useGlobalMuteUser();
  const globalUnmute = useGlobalUnmuteUser();
  const endStream = useAdminEndStream();
  const setStreamHidden = useAdminSetStreamHidden();
  const setVerified = useSetUserVerified();
  const approveApp = useApproveApplication();
  const rejectApp = useRejectApplication();
  const reviewVerification = useReviewVerification();

  // Wait for initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Check admin access - wait for both auth and role to load
  if (!isAuthenticated || !user?.id) {
    return <Navigate to="/" replace />;
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleAction = async () => {
    if (!actionDialog) return;

    try {
      switch (actionDialog.type) {
        case 'approve':
          await approveApp.mutateAsync({ applicationId: actionDialog.data.id, notes: actionNotes });
          break;
        case 'reject':
          await rejectApp.mutateAsync({ applicationId: actionDialog.data.id, notes: actionNotes });
          break;
        case 'suspend':
          await suspendUser.mutateAsync({ userId: actionDialog.data.id, reason: actionNotes });
          break;
        case 'mute':
          await globalMute.mutateAsync({ userId: actionDialog.data.id, reason: actionNotes });
          break;
        case 'end-stream':
          await endStream.mutateAsync(actionDialog.data.id);
          break;
        case 'approve-verification':
          await reviewVerification.mutateAsync({ 
            requestId: actionDialog.data.id, 
            status: 'approved', 
            notes: actionNotes 
          });
          break;
        case 'reject-verification':
          await reviewVerification.mutateAsync({ 
            requestId: actionDialog.data.id, 
            status: 'rejected', 
            notes: actionNotes,
            rejectionReason: actionNotes 
          });
          break;
      }
    } finally {
      setActionDialog(null);
      setActionNotes('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-14 md:h-16" />

      <div className="container px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage users, streams, and applications</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Users</span>
            </div>
            <p className="text-2xl font-bold">{statsLoading ? '-' : stats?.total_users}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Radio className="h-4 w-4" />
              <span className="text-xs">Streamers</span>
            </div>
            <p className="text-2xl font-bold">{statsLoading ? '-' : stats?.total_streamers}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Radio className="h-4 w-4 text-destructive" />
              <span className="text-xs">Live Now</span>
            </div>
            <p className="text-2xl font-bold">{statsLoading ? '-' : stats?.live_streams}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs">Pending Apps</span>
            </div>
            <p className="text-2xl font-bold">{statsLoading ? '-' : stats?.pending_applications}</p>
          </div>
          <div className="glass-card p-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Coins className="h-4 w-4" />
              <span className="text-xs">Total Tips</span>
            </div>
            <p className="text-2xl font-bold">{statsLoading ? '-' : `${stats?.total_tips_eth?.toFixed(2)} ETH`}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="w-full max-w-2xl bg-muted/50 p-1 rounded-xl overflow-x-auto">
            <TabsTrigger value="applications" className="flex-1 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Applications</span>
            </TabsTrigger>
            <TabsTrigger value="verifications" className="flex-1 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="communities" className="flex-1 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <UsersRound className="h-4 w-4" />
              <span className="hidden sm:inline">Communities</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="streams" className="flex-1 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Streams</span>
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={applicationFilter} onValueChange={setApplicationFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {appsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No applications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app: any) => (
                  <div key={app.id} className="glass-card p-4 md:p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={app.profiles?.avatar_url} />
                        <AvatarFallback>{app.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/profile/${app.username}`} className="font-semibold hover:text-primary">
                            @{app.username}
                          </Link>
                          <Badge variant={
                            app.status === 'pending' ? 'outline' :
                            app.status === 'approved' ? 'default' : 'destructive'
                          }>
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm mb-2"><strong>Why stream:</strong> {app.why_stream}</p>
                        <p className="text-sm mb-2"><strong>Content type:</strong> {app.content_type}</p>
                        <p className="text-sm"><strong>Frequency:</strong> {app.streaming_frequency}</p>
                        {app.prior_experience && (
                          <p className="text-sm mt-2"><strong>Experience:</strong> {app.prior_experience}</p>
                        )}
                      </div>
                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-success border-success/50"
                            onClick={() => setActionDialog({ type: 'approve', data: app })}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive border-destructive/50"
                            onClick={() => setActionDialog({ type: 'reject', data: app })}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="space-y-4">
            {verificationsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : verifications.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No pending verification requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifications.map((v: any) => (
                  <div key={v.id} className="glass-card p-4 md:p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={v.avatar_url} />
                        <AvatarFallback>{v.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/profile/${v.username}`} className="font-semibold hover:text-primary">
                            @{v.username}
                          </Link>
                          <Badge variant="outline">
                            {v.document_count} document{v.document_count !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted {new Date(v.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-success border-success/50"
                          onClick={() => setActionDialog({ type: 'approve-verification', data: v })}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive border-destructive/50"
                          onClick={() => setActionDialog({ type: 'reject-verification', data: v })}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities">
            <AdminCommunities />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : displayedUsers.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-muted-foreground">
                  {searchQuery.length >= 2 ? 'No users found' : 'No users yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedUsers.map((u: any) => (
                  <div key={u.id} className="glass-card p-4 flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.avatar_url} />
                      <AvatarFallback>{u.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link to={`/profile/${u.username}`} className="font-semibold hover:text-primary">
                          @{u.username}
                        </Link>
                        {u.verified_creator && <BadgeCheck className="h-4 w-4 text-primary" />}
                        <Badge variant="outline">{u.role}</Badge>
                        {u.suspended && <Badge variant="destructive">Suspended</Badge>}
                      </div>
                      {u.wallet_address && (
                        <p className="text-xs text-muted-foreground truncate mt-1">Wallet: {u.wallet_address}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Select 
                        value={u.role} 
                        onValueChange={(role) => setUserRole.mutate({ userId: u.id, role: role as any })}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="streamer">Streamer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={() => setVerified.mutate({ userId: u.id, verified: !u.verified_creator })}
                      >
                        <BadgeCheck className={`h-4 w-4 ${u.verified_creator ? 'text-primary' : ''}`} />
                      </Button>
                      {u.suspended ? (
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => unsuspendUser.mutate(u.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="text-destructive"
                          onClick={() => setActionDialog({ type: 'suspend', data: u })}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {searchQuery.length < 2 && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      disabled={!usersPaged.hasNextPage || usersPaged.isFetchingNextPage}
                      onClick={() => usersPaged.fetchNextPage()}
                    >
                      {usersPaged.isFetchingNextPage ? 'Loading…' : usersPaged.hasNextPage ? 'Load more' : 'All loaded'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Streams Tab */}
          <TabsContent value="streams" className="space-y-4">
            {streamsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : liveStreams.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No live streams</p>
              </div>
            ) : (
              <div className="space-y-4">
                {liveStreams.map((stream: any) => (
                  <div key={stream.id} className="glass-card p-4 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{stream.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by @{stream.profiles?.username} • {stream.viewer_count} viewers
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setStreamHidden.mutate({ streamId: stream.id, hidden: !stream.hidden })}
                      >
                        {stream.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => setActionDialog({ type: 'end-stream', data: stream })}
                      >
                        End Stream
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'approve' && 'Approve Application'}
              {actionDialog?.type === 'reject' && 'Reject Application'}
              {actionDialog?.type === 'suspend' && 'Suspend User'}
              {actionDialog?.type === 'mute' && 'Mute User Globally'}
              {actionDialog?.type === 'end-stream' && 'End Stream'}
              {actionDialog?.type === 'approve-verification' && 'Approve Verification'}
              {actionDialog?.type === 'reject-verification' && 'Reject Verification'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === 'approve' && 'This will grant the user streamer privileges.'}
              {actionDialog?.type === 'reject' && 'The user will be notified of the rejection.'}
              {actionDialog?.type === 'suspend' && 'The user will be unable to access the platform.'}
              {actionDialog?.type === 'mute' && 'The user will be unable to chat on any stream.'}
              {actionDialog?.type === 'end-stream' && 'This will immediately end the stream.'}
              {actionDialog?.type === 'approve-verification' && 'This will verify the user and grant them the verified badge.'}
              {actionDialog?.type === 'reject-verification' && 'The user will be notified of the rejection. Please provide a reason.'}
            </DialogDescription>
          </DialogHeader>
          {actionDialog?.type !== 'end-stream' && (
            <Textarea
              placeholder="Notes (optional)..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button 
              variant={actionDialog?.type === 'approve' || actionDialog?.type === 'approve-verification' ? 'default' : 'destructive'}
              onClick={handleAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

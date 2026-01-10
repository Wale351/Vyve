import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useUserRole } from '@/hooks/useProfile';
import {
  useAdminStats,
  usePendingApplications,
  useApproveApplication,
  useRejectApplication,
  useAdminSearchUsers,
  useSetUserRole,
  useSuspendUser,
  useUnsuspendUser,
  useSetUserVerified,
  useLiveStreams,
  useEndStream,
  useSetStreamHidden,
  useAuditLogs,
} from '@/hooks/useAdmin';
import {
  Users,
  Radio,
  FileText,
  Coins,
  Shield,
  Search,
  Check,
  X,
  Ban,
  BadgeCheck,
  Eye,
  EyeOff,
  Power,
  Loader2,
  Clock,
  Activity,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Admin() {
  const { user, isAuthenticated } = useWalletAuth();
  const { data: role, isLoading: roleLoading } = useUserRole(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Data hooks
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: pendingApps = [] } = usePendingApplications();
  const { data: searchResults = [] } = useAdminSearchUsers(searchQuery);
  const { data: liveStreams = [] } = useLiveStreams();
  const { data: auditLogs = [] } = useAuditLogs(50);
  
  // Mutation hooks
  const approveApp = useApproveApplication();
  const rejectApp = useRejectApplication();
  const setRole = useSetUserRole();
  const suspendUser = useSuspendUser();
  const unsuspendUser = useUnsuspendUser();
  const setVerified = useSetUserVerified();
  const endStream = useEndStream();
  const setStreamHidden = useSetStreamHidden();
  
  // Loading state
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
  
  // Access control - only admins
  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-14 md:h-16" />
      
      <div className="container px-4 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-display font-bold">Admin Dashboard</h1>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications" className="relative">
              Applications
              {pendingApps.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {pendingApps.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="streams">Streams</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                title="Total Users"
                value={stats?.total_users || 0}
                icon={Users}
                loading={statsLoading}
              />
              <StatCard
                title="Streamers"
                value={stats?.total_streamers || 0}
                icon={Radio}
                loading={statsLoading}
              />
              <StatCard
                title="Admins"
                value={stats?.total_admins || 0}
                icon={Shield}
                loading={statsLoading}
              />
              <StatCard
                title="Live Now"
                value={stats?.live_streams || 0}
                icon={Activity}
                loading={statsLoading}
                highlight
              />
              <StatCard
                title="Pending Apps"
                value={stats?.pending_applications || 0}
                icon={FileText}
                loading={statsLoading}
                highlight={stats?.pending_applications ? stats.pending_applications > 0 : false}
              />
              <StatCard
                title="Tips Volume"
                value={`${(stats?.total_tips_volume || 0).toFixed(2)} ETH`}
                icon={Coins}
                loading={statsLoading}
              />
            </div>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setSelectedTab('applications')}>
                  Review Applications ({pendingApps.length})
                </Button>
                <Button variant="outline" onClick={() => setSelectedTab('streams')}>
                  Moderate Streams ({liveStreams.length})
                </Button>
                <Button variant="outline" onClick={() => setSelectedTab('users')}>
                  Search Users
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>Review and approve streamer applications</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingApps.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending applications</p>
                ) : (
                  <div className="space-y-4">
                    {pendingApps.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        application={app}
                        onApprove={(notes) => approveApp.mutate({ applicationId: app.id, notes })}
                        onReject={(notes) => rejectApp.mutate({ applicationId: app.id, notes })}
                        isPending={approveApp.isPending || rejectApp.isPending}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Search and manage users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchQuery.length >= 2 && (
                  <div className="space-y-2">
                    {searchResults.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No users found</p>
                    ) : (
                      searchResults.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onSetRole={(role) => setRole.mutate({ userId: user.id, role })}
                          onSuspend={(reason) => suspendUser.mutate({ userId: user.id, reason })}
                          onUnsuspend={() => unsuspendUser.mutate(user.id)}
                          onSetVerified={(verified) => setVerified.mutate({ userId: user.id, verified })}
                          isPending={setRole.isPending || suspendUser.isPending || unsuspendUser.isPending || setVerified.isPending}
                        />
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Streams Tab */}
          <TabsContent value="streams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Streams</CardTitle>
                <CardDescription>Monitor and moderate live streams</CardDescription>
              </CardHeader>
              <CardContent>
                {liveStreams.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No live streams</p>
                ) : (
                  <div className="space-y-3">
                    {liveStreams.map((stream) => (
                      <StreamCard
                        key={stream.id}
                        stream={stream}
                        onEndStream={() => endStream.mutate(stream.id)}
                        onToggleHidden={() => setStreamHidden.mutate({ streamId: stream.id, hidden: !stream.hidden })}
                        isPending={endStream.isPending || setStreamHidden.isPending}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Recent admin actions</CardDescription>
              </CardHeader>
              <CardContent>
                {auditLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No logs yet</p>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-sm">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={log.admin?.avatar_url || ''} />
                          <AvatarFallback>{log.admin?.username?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p>
                            <span className="font-medium">{log.admin?.username || 'Admin'}</span>
                            {' '}
                            <span className="text-muted-foreground">{formatActionType(log.action_type)}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon: Icon, loading, highlight }: {
  title: string;
  value: number | string;
  icon: typeof Users;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary/50 bg-primary/5' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationCard({ application, onApprove, onReject, isPending }: {
  application: any;
  onApprove: (notes?: string) => void;
  onReject: (notes?: string) => void;
  isPending: boolean;
}) {
  const [notes, setNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={application.profile?.avatar_url || ''} />
            <AvatarFallback>{application.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <Link to={`/profile/${application.user_id}`} className="font-medium hover:text-primary">
              {application.username}
            </Link>
            <p className="text-xs text-muted-foreground">
              Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      </div>
      
      <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? 'Hide Details' : 'Show Details'}
      </Button>
      
      {showDetails && (
        <div className="space-y-3 text-sm bg-muted/30 p-3 rounded-lg">
          <div>
            <p className="font-medium text-muted-foreground">Bio</p>
            <p>{application.bio}</p>
          </div>
          {application.why_stream && (
            <div>
              <p className="font-medium text-muted-foreground">Why they want to stream</p>
              <p>{application.why_stream}</p>
            </div>
          )}
          {application.content_type && (
            <div>
              <p className="font-medium text-muted-foreground">Content Type</p>
              <p>{application.content_type}</p>
            </div>
          )}
          {application.streaming_frequency && (
            <div>
              <p className="font-medium text-muted-foreground">Streaming Frequency</p>
              <p>{application.streaming_frequency}</p>
            </div>
          )}
          {application.prior_experience && (
            <div>
              <p className="font-medium text-muted-foreground">Prior Experience</p>
              <p>{application.prior_experience}</p>
            </div>
          )}
          {application.socials && Object.keys(application.socials).length > 0 && (
            <div>
              <p className="font-medium text-muted-foreground">Socials</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(application.socials).map(([platform, url]) => (
                  url && (
                    <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {platform}
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <Textarea
        placeholder="Admin notes (optional)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />
      
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => onApprove(notes)}
          disabled={isPending}
          className="gap-1"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Approve
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onReject(notes)}
          disabled={isPending}
          className="gap-1"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          Reject
        </Button>
      </div>
    </div>
  );
}

function UserCard({ user, onSetRole, onSuspend, onUnsuspend, onSetVerified, isPending }: {
  user: any;
  onSetRole: (role: 'viewer' | 'streamer' | 'admin') => void;
  onSuspend: (reason?: string) => void;
  onUnsuspend: () => void;
  onSetVerified: (verified: boolean) => void;
  isPending: boolean;
}) {
  const [suspendReason, setSuspendReason] = useState('');
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.avatar_url || ''} />
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <Link to={`/profile/${user.id}`} className="font-medium hover:text-primary flex items-center gap-1">
            {user.username}
            {user.verified_creator && <BadgeCheck className="h-4 w-4 text-primary" />}
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={user.role === 'admin' ? 'default' : user.role === 'streamer' ? 'secondary' : 'outline'} className="text-xs">
              {user.role}
            </Badge>
            {user.suspended && <Badge variant="destructive" className="text-xs">Suspended</Badge>}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Select value={user.role} onValueChange={(value) => onSetRole(value as any)} disabled={isPending}>
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
          variant="ghost"
          size="icon"
          onClick={() => onSetVerified(!user.verified_creator)}
          disabled={isPending}
          title={user.verified_creator ? 'Remove verification' : 'Verify user'}
        >
          <BadgeCheck className={`h-4 w-4 ${user.verified_creator ? 'text-primary' : 'text-muted-foreground'}`} />
        </Button>
        
        {user.suspended ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUnsuspend()}
            disabled={isPending}
          >
            Unsuspend
          </Button>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isPending}>
                <Ban className="h-4 w-4 text-destructive" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Suspend User</DialogTitle>
                <DialogDescription>
                  This will prevent the user from accessing the platform.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Reason for suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
              <DialogFooter>
                <Button variant="destructive" onClick={() => onSuspend(suspendReason)}>
                  Suspend
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function StreamCard({ stream, onEndStream, onToggleHidden, isPending }: {
  stream: any;
  onEndStream: () => void;
  onToggleHidden: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={stream.streamer?.avatar_url || ''} />
          <AvatarFallback>{stream.streamer?.username?.[0]?.toUpperCase() || 'S'}</AvatarFallback>
        </Avatar>
        <div>
          <Link to={`/watch/${stream.id}`} className="font-medium hover:text-primary">
            {stream.title}
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{stream.streamer?.username}</span>
            <span>•</span>
            <span>{stream.viewer_count} viewers</span>
            {stream.hidden && <Badge variant="outline" className="text-xs">Hidden</Badge>}
            {stream.flagged && <Badge variant="destructive" className="text-xs">Flagged</Badge>}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleHidden}
          disabled={isPending}
          title={stream.hidden ? 'Show in discovery' : 'Hide from discovery'}
        >
          {stream.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onEndStream}
          disabled={isPending}
          className="gap-1"
        >
          <Power className="h-4 w-4" />
          End
        </Button>
      </div>
    </div>
  );
}

function formatActionType(action: string): string {
  const actions: Record<string, string> = {
    approve_application: 'approved a streamer application',
    reject_application: 'rejected a streamer application',
    set_role: 'changed a user\'s role',
    suspend_user: 'suspended a user',
    unsuspend_user: 'unsuspended a user',
    verify_user: 'verified a user',
    unverify_user: 'removed verification from a user',
    end_stream: 'ended a stream',
    flag_stream: 'flagged a stream',
    hide_stream: 'hid a stream from discovery',
    unhide_stream: 'made a stream visible in discovery',
  };
  return actions[action] || action.replace(/_/g, ' ');
}

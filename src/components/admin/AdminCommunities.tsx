import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
  Trash2,
  Eye,
  Shield,
  Hexagon,
  MoreHorizontal,
  AlertTriangle,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useAdminCommunities,
  useAdminCommunityStats,
  useApproveCommunity,
  useSuspendCommunity,
  useUnsuspendCommunity,
  useDeleteCommunity,
  AdminCommunity,
} from '@/hooks/useAdminCommunities';
import AdminCommunityDetailModal from './AdminCommunityDetailModal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  title: string;
  description: string;
  confirmText: string;
  variant?: 'default' | 'destructive';
  showNotes?: boolean;
}

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  variant = 'default',
  showNotes = false,
}: ConfirmDialogProps) => {
  const [notes, setNotes] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        {showNotes && (
          <textarea
            className="w-full p-3 rounded-lg bg-muted/50 border border-border/50 mb-4 resize-none"
            placeholder="Notes (optional)..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm(notes);
              setNotes('');
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    active: { variant: 'default', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
    pending: { variant: 'outline', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    suspended: { variant: 'destructive' },
  };

  const config = variants[status] || variants.pending;

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
};

const CommunityRow = ({
  community,
  onViewDetails,
}: {
  community: AdminCommunity;
  onViewDetails: (community: AdminCommunity) => void;
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'approve' | 'suspend' | 'unsuspend' | 'delete';
  } | null>(null);

  const approveMutation = useApproveCommunity();
  const suspendMutation = useSuspendCommunity();
  const unsuspendMutation = useUnsuspendCommunity();
  const deleteMutation = useDeleteCommunity();

  const handleAction = (notes?: string) => {
    if (!confirmDialog) return;

    switch (confirmDialog.type) {
      case 'approve':
        approveMutation.mutate({ communityId: community.id, notes });
        break;
      case 'suspend':
        suspendMutation.mutate({ communityId: community.id, reason: notes });
        break;
      case 'unsuspend':
        unsuspendMutation.mutate(community.id);
        break;
      case 'delete':
        deleteMutation.mutate({ communityId: community.id, reason: notes });
        break;
    }
  };

  const isGated = community.is_nft_gated || community.is_ens_gated;

  return (
    <>
      <div className="glass-card p-4 flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="h-12 w-12 rounded-lg">
          {community.avatar_url ? (
            <AvatarImage src={community.avatar_url} className="rounded-lg" />
          ) : (
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              {community.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold truncate">{community.name}</span>
            <StatusBadge status={community.status} />
            {isGated && (
              <Badge variant="outline" className="gap-1 text-xs">
                {community.is_nft_gated && <Shield className="h-3 w-3" />}
                {community.is_ens_gated && <Hexagon className="h-3 w-3" />}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              to={`/profile/${community.owner?.username}`}
              className="hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              @{community.owner?.username || 'Unknown'}
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {community.member_count}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(community.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(community)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {community.status === 'pending' && (
                <DropdownMenuItem onClick={() => setConfirmDialog({ type: 'approve' })}>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Approve
                </DropdownMenuItem>
              )}
              {community.status === 'active' && (
                <DropdownMenuItem onClick={() => setConfirmDialog({ type: 'suspend' })}>
                  <Ban className="h-4 w-4 mr-2 text-yellow-500" />
                  Suspend
                </DropdownMenuItem>
              )}
              {community.status === 'suspended' && (
                <DropdownMenuItem onClick={() => setConfirmDialog({ type: 'unsuspend' })}>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Unsuspend
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmDialog({ type: 'delete' })}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={confirmDialog?.type === 'approve'}
        onClose={() => setConfirmDialog(null)}
        onConfirm={handleAction}
        title="Approve Community"
        description={`Are you sure you want to approve "${community.name}"? This will make it visible to all users.`}
        confirmText="Approve"
        showNotes
      />
      <ConfirmDialog
        open={confirmDialog?.type === 'suspend'}
        onClose={() => setConfirmDialog(null)}
        onConfirm={handleAction}
        title="Suspend Community"
        description={`Are you sure you want to suspend "${community.name}"? Members will only be able to view content, not interact.`}
        confirmText="Suspend"
        variant="destructive"
        showNotes
      />
      <ConfirmDialog
        open={confirmDialog?.type === 'unsuspend'}
        onClose={() => setConfirmDialog(null)}
        onConfirm={handleAction}
        title="Unsuspend Community"
        description={`Are you sure you want to unsuspend "${community.name}"? This will restore full functionality.`}
        confirmText="Unsuspend"
      />
      <ConfirmDialog
        open={confirmDialog?.type === 'delete'}
        onClose={() => setConfirmDialog(null)}
        onConfirm={handleAction}
        title="Delete Community"
        description={`Are you sure you want to permanently delete "${community.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        showNotes
      />
    </>
  );
};

const AdminCommunities = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatedFilter, setGatedFilter] = useState<'all' | 'gated' | 'ungated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<AdminCommunity | null>(null);

  const { data: stats, isLoading: statsLoading } = useAdminCommunityStats();
  const { data: communities, isLoading } = useAdminCommunities({
    status: statusFilter,
    search: searchQuery,
    gated: gatedFilter,
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{statsLoading ? '-' : stats?.total_communities}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{statsLoading ? '-' : stats?.active_communities}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{statsLoading ? '-' : stats?.pending_communities}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{statsLoading ? '-' : stats?.pending_reports}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gatedFilter} onValueChange={(v) => setGatedFilter(v as any)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Gating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="gated">Gated</SelectItem>
            <SelectItem value="ungated">Ungated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Communities List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : communities && communities.length > 0 ? (
        <div className="space-y-3">
          {communities.map((community) => (
            <CommunityRow
              key={community.id}
              community={community}
              onViewDetails={setSelectedCommunity}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No communities found</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCommunity && (
        <AdminCommunityDetailModal
          community={selectedCommunity}
          onClose={() => setSelectedCommunity(null)}
        />
      )}
    </div>
  );
};

export default AdminCommunities;

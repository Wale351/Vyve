import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useStreamerApplications,
  useApproveApplication,
  useRejectApplication,
} from '@/hooks/useAdmin';
import { Check, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminApplications = () => {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const { data: applications, isLoading } = useStreamerApplications(statusFilter);
  const approveApplication = useApproveApplication();
  const rejectApplication = useRejectApplication();

  const [reviewModal, setReviewModal] = useState<{
    type: 'approve' | 'reject';
    applicationId: string;
    username: string;
  } | null>(null);
  const [notes, setNotes] = useState('');

  const handleAction = async () => {
    if (!reviewModal) return;

    if (reviewModal.type === 'approve') {
      await approveApplication.mutateAsync({
        applicationId: reviewModal.applicationId,
        notes: notes || undefined,
      });
    } else {
      await rejectApplication.mutateAsync({
        applicationId: reviewModal.applicationId,
        notes: notes || undefined,
      });
    }

    setReviewModal(null);
    setNotes('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead>Primary Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              {statusFilter === 'pending' && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : applications?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No {statusFilter} applications found
                </TableCell>
              </TableRow>
            ) : (
              applications?.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.username}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{app.bio}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{app.game?.name || 'Not specified'}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(app.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  {statusFilter === 'pending' && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => setReviewModal({
                            type: 'approve',
                            applicationId: app.id,
                            username: app.username,
                          })}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setReviewModal({
                            type: 'reject',
                            applicationId: app.id,
                            username: app.username,
                          })}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!reviewModal} onOpenChange={() => { setReviewModal(null); setNotes(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewModal?.type === 'approve' ? 'Approve' : 'Reject'} Application
            </DialogTitle>
            <DialogDescription>
              {reviewModal?.type === 'approve'
                ? `Approving "${reviewModal?.username}" will grant them streamer access and mark them as verified.`
                : `Rejecting "${reviewModal?.username}" will deny their streamer request. You can add a note explaining why.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={reviewModal?.type === 'reject' ? 'Reason for rejection...' : 'Any notes...'}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewModal(null); setNotes(''); }}>
              Cancel
            </Button>
            <Button
              variant={reviewModal?.type === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={approveApplication.isPending || rejectApplication.isPending}
            >
              {(approveApplication.isPending || rejectApplication.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {reviewModal?.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApplications;

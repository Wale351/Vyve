import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminAuditLogs } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminAuditLog = () => {
  const { data: logs, isLoading } = useAdminAuditLogs();

  const getActionBadge = (action: string) => {
    if (action.includes('suspend') || action.includes('reject') || action.includes('delete')) {
      return <Badge variant="destructive">{action}</Badge>;
    }
    if (action.includes('approve') || action.includes('verify') || action.includes('unsuspend')) {
      return <Badge className="bg-green-600">{action}</Badge>;
    }
    return <Badge variant="secondary">{action}</Badge>;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        All admin actions are logged here for accountability and auditing purposes.
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Target Type</TableHead>
              <TableHead>Target ID</TableHead>
              <TableHead>Metadata</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No audit logs yet
                </TableCell>
              </TableRow>
            ) : (
              logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{getActionBadge(log.action_type)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.target_type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.target_id?.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <code className="text-xs text-muted-foreground">
                      {JSON.stringify(log.metadata)}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminAuditLog;

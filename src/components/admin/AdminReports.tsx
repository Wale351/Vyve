import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminReports } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

const AdminReports = () => {
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const { data: reports, isLoading } = useAdminReports(statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>;
      case 'resolved':
        return <Badge className="bg-green-600">Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="secondary">Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTargetTypeBadge = (type: string) => {
    switch (type) {
      case 'user':
        return <Badge variant="outline">User</Badge>;
      case 'stream':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Stream</Badge>;
      case 'message':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Message</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : reports?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No {statusFilter} reports found
                </TableCell>
              </TableRow>
            ) : (
              reports?.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{getTargetTypeBadge(report.target_type)}</TableCell>
                  <TableCell className="font-medium">{report.reason}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {report.description || '-'}
                    </p>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(report.created_at), 'MMM d, HH:mm')}
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

export default AdminReports;

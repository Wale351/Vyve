import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useAdminStreams,
  useAdminEndStream,
  useAdminSetStreamHidden,
} from '@/hooks/useAdmin';
import { MoreHorizontal, StopCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminStreams = () => {
  const { data: streams, isLoading } = useAdminStreams();
  const endStream = useAdminEndStream();
  const setStreamHidden = useAdminSetStreamHidden();
  const [confirmAction, setConfirmAction] = useState<{
    type: 'end' | 'hide' | 'unhide';
    streamId: string;
    title: string;
  } | null>(null);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    
    switch (confirmAction.type) {
      case 'end':
        await endStream.mutateAsync(confirmAction.streamId);
        break;
      case 'hide':
        await setStreamHidden.mutateAsync({ streamId: confirmAction.streamId, hidden: true });
        break;
      case 'unhide':
        await setStreamHidden.mutateAsync({ streamId: confirmAction.streamId, hidden: false });
        break;
    }
    setConfirmAction(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Streamer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Viewers</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : streams?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No streams found
                </TableCell>
              </TableRow>
            ) : (
              streams?.map((stream) => (
                <TableRow key={stream.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium line-clamp-1">{stream.title}</p>
                      {stream.hidden && (
                        <Badge variant="outline" className="text-xs text-orange-500">Hidden</Badge>
                      )}
                      {stream.flagged && (
                        <Badge variant="destructive" className="text-xs ml-1">Flagged</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {stream.streamer?.username || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {stream.is_live ? (
                      <Badge className="bg-red-500">LIVE</Badge>
                    ) : (
                      <Badge variant="secondary">Ended</Badge>
                    )}
                  </TableCell>
                  <TableCell>{stream.viewer_count || 0}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {stream.started_at ? format(new Date(stream.started_at), 'MMM d, HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {stream.is_live && (
                          <DropdownMenuItem
                            onClick={() => setConfirmAction({ type: 'end', streamId: stream.id, title: stream.title })}
                            className="text-destructive"
                          >
                            <StopCircle className="h-4 w-4 mr-2" />
                            Force End
                          </DropdownMenuItem>
                        )}
                        {stream.hidden ? (
                          <DropdownMenuItem
                            onClick={() => setConfirmAction({ type: 'unhide', streamId: stream.id, title: stream.title })}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Unhide
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setConfirmAction({ type: 'hide', streamId: stream.id, title: stream.title })}
                          >
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction?.type === 'end' ? 'force end' : confirmAction?.type} stream "{confirmAction?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminStreams;

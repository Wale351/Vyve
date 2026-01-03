import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminChatMessages, useAdminDeleteMessage, useAdminGlobalMute } from '@/hooks/useAdmin';
import { Trash2, VolumeX, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminChat = () => {
  const { data: messages, isLoading } = useAdminChatMessages();
  const deleteMessage = useAdminDeleteMessage();
  const globalMute = useAdminGlobalMute();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmMute, setConfirmMute] = useState<{ userId: string; username: string } | null>(null);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteMessage.mutateAsync(confirmDelete);
    setConfirmDelete(null);
  };

  const handleMute = async () => {
    if (!confirmMute) return;
    await globalMute.mutateAsync({ userId: confirmMute.userId, reason: 'Admin action', durationHours: 24 });
    setConfirmMute(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="w-[50%]">Message</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : messages?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No chat messages found
                </TableCell>
              </TableRow>
            ) : (
              messages?.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {msg.sender?.avatar_url ? (
                          <AvatarImage src={msg.sender.avatar_url} />
                        ) : (
                          <AvatarFallback className="text-xs">
                            {msg.sender?.username?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-sm">{msg.sender?.username || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2">{msg.message}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(msg.created_at), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setConfirmDelete(msg.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setConfirmMute({ userId: msg.sender_id, username: msg.sender?.username || 'User' })}
                      >
                        <VolumeX className="h-4 w-4 text-orange-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmMute} onOpenChange={() => setConfirmMute(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mute User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to globally mute "{confirmMute?.username}" for 24 hours?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMute}>Mute</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminChat;

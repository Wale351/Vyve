import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  useAdminUsers,
  useSuspendUser,
  useUnsuspendUser,
  useSetUserVerified,
} from '@/hooks/useAdmin';
import { Search, MoreHorizontal, Shield, ShieldOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const maskWallet = (wallet: string) => {
  if (!wallet || wallet.length < 10) return wallet;
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
};

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'unsuspend' | 'verify' | 'unverify';
    userId: string;
    username: string;
  } | null>(null);

  const { data: users, isLoading } = useAdminUsers(search);
  const suspendUser = useSuspendUser();
  const unsuspendUser = useUnsuspendUser();
  const setUserVerified = useSetUserVerified();

  const handleConfirm = async () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case 'suspend':
        await suspendUser.mutateAsync({ userId: confirmAction.userId });
        break;
      case 'unsuspend':
        await unsuspendUser.mutateAsync(confirmAction.userId);
        break;
      case 'verify':
        await setUserVerified.mutateAsync({ userId: confirmAction.userId, verified: true });
        break;
      case 'unverify':
        await setUserVerified.mutateAsync({ userId: confirmAction.userId, verified: false });
        break;
    }
    setConfirmAction(null);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'streamer':
        return <Badge className="bg-purple-600">Streamer</Badge>;
      default:
        return <Badge variant="secondary">Viewer</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
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
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {user.avatar_url ? (
                          <AvatarImage src={user.avatar_url} />
                        ) : (
                          <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        {user.verified_creator && (
                          <Badge variant="outline" className="text-xs">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {maskWallet(user.wallet_address)}
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    {user.suspended ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.verified_creator ? (
                          <DropdownMenuItem
                            onClick={() => setConfirmAction({ type: 'unverify', userId: user.id, username: user.username })}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Unverify
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setConfirmAction({ type: 'verify', userId: user.id, username: user.username })}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify
                          </DropdownMenuItem>
                        )}
                        {user.suspended ? (
                          <DropdownMenuItem
                            onClick={() => setConfirmAction({ type: 'unsuspend', userId: user.id, username: user.username })}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Unsuspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setConfirmAction({ type: 'suspend', userId: user.id, username: user.username })}
                            className="text-destructive"
                          >
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Suspend
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
              Are you sure you want to {confirmAction?.type} user "{confirmAction?.username}"?
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

export default AdminUsers;

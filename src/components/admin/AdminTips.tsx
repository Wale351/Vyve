import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminTips } from '@/hooks/useAdmin';
import { ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminTips = () => {
  const { data: tips, isLoading } = useAdminTips();

  const formatEth = (amount: number | string) => {
    return Number(amount).toFixed(6);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Read-only view of all platform transactions. Tips cannot be modified.
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sender</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Transaction</TableHead>
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
            ) : tips?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No tips found
                </TableCell>
              </TableRow>
            ) : (
              tips?.map((tip) => (
                <TableRow key={tip.id}>
                  <TableCell>{tip.sender?.username || 'Unknown'}</TableCell>
                  <TableCell>{tip.receiver?.username || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {formatEth(tip.amount_eth)} ETH
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://basescan.org/tx/${tip.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline font-mono text-sm"
                    >
                      {tip.tx_hash.slice(0, 10)}…
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(tip.created_at), 'MMM d, HH:mm')}
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

export default AdminTips;

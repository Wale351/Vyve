import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStats } from '@/hooks/useAdmin';
import { Users, Radio, Coins, UserPlus, FileText, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminOverview = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Total Streamers', value: stats?.total_streamers || 0, icon: Radio, color: 'text-purple-500' },
    { label: 'Active Streams', value: stats?.active_streams || 0, icon: Radio, color: 'text-green-500' },
    { label: 'Total Tips (ETH)', value: Number(stats?.total_tips_eth || 0).toFixed(4), icon: Coins, color: 'text-yellow-500' },
    { label: 'New Users (24h)', value: stats?.new_users_24h || 0, icon: UserPlus, color: 'text-cyan-500' },
    { label: 'New Users (7d)', value: stats?.new_users_7d || 0, icon: UserPlus, color: 'text-indigo-500' },
    { label: 'Pending Applications', value: stats?.pending_applications || 0, icon: FileText, color: 'text-orange-500' },
    { label: 'Open Reports', value: stats?.open_reports || 0, icon: Clock, color: 'text-red-500' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminOverview;

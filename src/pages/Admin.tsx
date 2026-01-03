import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { Loader2, Shield } from 'lucide-react';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminStreams from '@/components/admin/AdminStreams';
import AdminChat from '@/components/admin/AdminChat';
import AdminTips from '@/components/admin/AdminTips';
import AdminReports from '@/components/admin/AdminReports';
import AdminApplications from '@/components/admin/AdminApplications';
import AdminAuditLog from '@/components/admin/AdminAuditLog';

const Admin = () => {
  const { user, isAuthenticated, isInitialized } = useWalletAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin(user?.id);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isInitialized || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-14 md:h-16" />

      <div className="container max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Platform moderation & management</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="streams">Streams</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><AdminOverview /></TabsContent>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="streams"><AdminStreams /></TabsContent>
          <TabsContent value="chat"><AdminChat /></TabsContent>
          <TabsContent value="tips"><AdminTips /></TabsContent>
          <TabsContent value="reports"><AdminReports /></TabsContent>
          <TabsContent value="applications"><AdminApplications /></TabsContent>
          <TabsContent value="audit"><AdminAuditLog /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

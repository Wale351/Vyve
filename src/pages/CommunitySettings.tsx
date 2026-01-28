import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, Settings, Trash2, Shield, Hexagon, 
  Loader2, AlertTriangle, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import CommunityImageUpload from '@/components/communities/CommunityImageUpload';
import { useCommunity } from '@/hooks/useCommunities';
import { useUpdateCommunity, useDeleteCommunity } from '@/hooks/useCommunitySettings';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  short_description: z.string().max(100).optional(),
  rules: z.string().max(2000).optional(),
  is_nft_gated: z.boolean(),
  nft_contract_address: z.string().optional(),
  is_ens_gated: z.boolean(),
  required_ens_suffix: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CommunitySettings = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useWalletAuth();
  const { data: community, isLoading } = useCommunity(slug || '');
  const updateCommunity = useUpdateCommunity();
  const deleteCommunity = useDeleteCommunity();
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      short_description: '',
      rules: '',
      is_nft_gated: false,
      nft_contract_address: '',
      is_ens_gated: false,
      required_ens_suffix: '',
    },
  });

  // Load community data into form
  useEffect(() => {
    if (community) {
      form.reset({
        name: community.name,
        description: community.description || '',
        short_description: community.short_description || '',
        rules: community.rules || '',
        is_nft_gated: community.is_nft_gated || false,
        nft_contract_address: community.nft_contract_address || '',
        is_ens_gated: community.is_ens_gated || false,
        required_ens_suffix: community.required_ens_suffix || '',
      });
      setBannerUrl(community.banner_url);
      setAvatarUrl(community.avatar_url);
    }
  }, [community, form]);

  const watchNftGated = form.watch('is_nft_gated');
  const watchEnsGated = form.watch('is_ens_gated');

  const isOwner = community?.owner_id === user?.id;

  const onSubmit = async (data: FormData) => {
    if (!community) return;

    try {
      await updateCommunity.mutateAsync({
        communityId: community.id,
        data: {
          ...data,
          banner_url: bannerUrl,
          avatar_url: avatarUrl,
        },
      });
      toast.success('Community updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update community');
    }
  };

  const handleDelete = async () => {
    if (!community) return;

    try {
      await deleteCommunity.mutateAsync(community.id);
      toast.success('Community deleted');
      navigate('/communities');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete community');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-24 px-4 max-w-2xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!community || !isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-4 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to edit this community.
          </p>
          <Button asChild>
            <Link to="/communities">Back to Communities</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-24 px-4 max-w-4xl mx-auto lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-4 -ml-2"
          >
            <Link to={`/communities/${slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Community Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your community's settings and appearance
          </p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Two column layout for desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Images */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Community Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <FormLabel>Banner Image</FormLabel>
                        <CommunityImageUpload
                          userId={user?.id || ''}
                          value={bannerUrl}
                          onChange={setBannerUrl}
                          type="banner"
                        />
                      </div>
                      <div className="space-y-2">
                        <FormLabel>Avatar Image</FormLabel>
                        <CommunityImageUpload
                          userId={user?.id || ''}
                          value={avatarUrl}
                          onChange={setAvatarUrl}
                          type="avatar"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Basic Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Community Name</FormLabel>
                            <FormControl>
                              <Input className="bg-muted/50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="short_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Description</FormLabel>
                            <FormControl>
                              <Input className="bg-muted/50" {...field} />
                            </FormControl>
                            <FormDescription>Shown on community cards</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Description</FormLabel>
                            <FormControl>
                              <Textarea className="bg-muted/50 min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rules"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Community Rules</FormLabel>
                            <FormControl>
                              <Textarea className="bg-muted/50 min-h-[80px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Access Control */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Access Control</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="is_nft_gated"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Shield className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <FormLabel>NFT Gated</FormLabel>
                                <FormDescription>Require NFT ownership</FormDescription>
                              </div>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {watchNftGated && (
                        <FormField
                          control={form.control}
                          name="nft_contract_address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NFT Contract Address</FormLabel>
                              <FormControl>
                                <Input placeholder="0x..." className="bg-muted/50 font-mono text-sm" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="is_ens_gated"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-secondary/20">
                                <Hexagon className="h-5 w-5 text-secondary-foreground" />
                              </div>
                              <div>
                                <FormLabel>ENS/Base Name Gated</FormLabel>
                                <FormDescription>Require ENS or Base name</FormDescription>
                              </div>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {watchEnsGated && (
                        <FormField
                          control={form.control}
                          name="required_ens_suffix"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Required ENS Suffix</FormLabel>
                              <FormControl>
                                <Input placeholder=".eth" className="bg-muted/50" {...field} />
                              </FormControl>
                              <FormDescription>Leave empty for any ENS/Base name</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-destructive/30">
                    <CardHeader>
                      <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                      <CardDescription>Irreversible and destructive actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="destructive" className="w-full gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Community
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              Delete Community
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              community and all associated posts, polls, and member data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Forever
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Save Button - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end pt-4 border-t border-border/50"
            >
              <Button
                type="submit"
                disabled={updateCommunity.isPending}
                className="gap-2 min-w-32"
              >
                {updateCommunity.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </motion.div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default CommunitySettings;

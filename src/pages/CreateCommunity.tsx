import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Users, Shield, Hexagon, 
  Loader2, Info
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Header from '@/components/Header';
import CommunityImageUpload from '@/components/communities/CommunityImageUpload';
import { useCreateCommunity } from '@/hooks/useCommunities';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be less than 50 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  short_description: z.string().max(100, 'Short description must be less than 100 characters').optional(),
  rules: z.string().max(2000, 'Rules must be less than 2000 characters').optional(),
  is_nft_gated: z.boolean().default(false),
  nft_contract_address: z.string().optional(),
  is_ens_gated: z.boolean().default(false),
  required_ens_suffix: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CreateCommunity = () => {
  const navigate = useNavigate();
  const { user } = useWalletAuth();
  const createCommunity = useCreateCommunity();
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

  const watchNftGated = form.watch('is_nft_gated');
  const watchEnsGated = form.watch('is_ens_gated');

  const onSubmit = async (data: FormData) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a community');
      return;
    }

    try {
      const community = await createCommunity.mutateAsync({
        name: data.name,
        description: data.description,
        short_description: data.short_description,
        rules: data.rules,
        is_nft_gated: data.is_nft_gated,
        nft_contract_address: data.nft_contract_address,
        is_ens_gated: data.is_ens_gated,
        required_ens_suffix: data.required_ens_suffix,
        banner_url: bannerUrl || undefined,
        avatar_url: avatarUrl || undefined,
        owner_id: user.id,
      });

      toast.success('Community created successfully!');
      navigate(`/communities/${community.slug}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create community');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-24 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Create Community</h1>
          </div>
          <p className="text-muted-foreground">
            Build your community hub and connect with your audience
          </p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Community Images</CardTitle>
                  <CardDescription>
                    Add a banner and avatar to make your community stand out
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <FormLabel>Banner Image</FormLabel>
                    <CommunityImageUpload
                      userId={user?.id || ''}
                      value={bannerUrl}
                      onChange={setBannerUrl}
                      type="banner"
                      disabled={!user?.id}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Avatar Image</FormLabel>
                    <CommunityImageUpload
                      userId={user?.id || ''}
                      value={avatarUrl}
                      onChange={setAvatarUrl}
                      type="avatar"
                      disabled={!user?.id}
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
                  <CardDescription>
                    Set up your community's identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="My Awesome Community" 
                            className="bg-muted/50"
                            {...field} 
                          />
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
                          <Input 
                            placeholder="A brief tagline for your community" 
                            className="bg-muted/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Shown on community cards (max 100 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell people what your community is about..."
                            className="bg-muted/50 min-h-[100px]"
                            {...field} 
                          />
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
                          <Textarea 
                            placeholder="Set guidelines for your community members..."
                            className="bg-muted/50 min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Access Control */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Access Control</CardTitle>
                  <CardDescription>
                    Optionally restrict who can join your community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* NFT Gating */}
                  <div className="space-y-4">
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
                              <FormLabel className="font-medium">NFT Gated</FormLabel>
                              <FormDescription>
                                Require members to hold a specific NFT
                              </FormDescription>
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
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
                              <Input 
                                placeholder="0x..." 
                                className="bg-muted/50 font-mono text-sm"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* ENS Gating */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="is_ens_gated"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <Hexagon className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <FormLabel className="font-medium">ENS/Base Name Gated</FormLabel>
                              <FormDescription>
                                Require members to have an ENS or Base name
                              </FormDescription>
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
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
                            <FormLabel className="flex items-center gap-2">
                              Required ENS Suffix
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>e.g., ".eth" or ".base.eth"</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder=".eth" 
                                className="bg-muted/50"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Leave empty to accept any ENS/Base name
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/communities')}
                className="sm:flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCommunity.isPending}
                className="sm:flex-1 gap-2"
              >
                {createCommunity.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Community
              </Button>
            </motion.div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default CreateCommunity;

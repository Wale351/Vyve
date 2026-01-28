import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Users, Shield, Hexagon, Loader2, ArrowRight, ArrowLeft,
  Check, Sparkles, ImagePlus, FileText, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Header from '@/components/Header';
import CommunityImageUpload from '@/components/communities/CommunityImageUpload';
import { useCreateCommunity } from '@/hooks/useCommunities';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

const steps = [
  { id: 'basics', title: 'Basics', icon: FileText, description: 'Name & description' },
  { id: 'visuals', title: 'Visuals', icon: ImagePlus, description: 'Banner & avatar' },
  { id: 'access', title: 'Access', icon: Lock, description: 'Who can join' },
  { id: 'review', title: 'Review', icon: Check, description: 'Final check' },
];

const CreateCommunity = () => {
  const navigate = useNavigate();
  const { user } = useWalletAuth();
  const createCommunity = useCreateCommunity();
  const [currentStep, setCurrentStep] = useState(0);
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

  const watchName = form.watch('name');
  const watchDescription = form.watch('description');
  const watchNftGated = form.watch('is_nft_gated');
  const watchEnsGated = form.watch('is_ens_gated');

  const progress = ((currentStep + 1) / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return watchName.length >= 3 && watchDescription.length >= 10;
      case 1:
        return true; // Images are optional
      case 2:
        return true; // Access control is optional
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      const isValid = await form.trigger(['name', 'description', 'short_description']);
      if (!isValid) return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="basics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Let's start with the basics</h2>
              <p className="text-muted-foreground">Give your community a name and tell people what it's about</p>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Community Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a memorable name" 
                      className="h-12 text-lg bg-muted/50"
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
                  <FormLabel className="text-base">Tagline</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="A short catchy phrase" 
                      className="h-12 bg-muted/50"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>This appears on community cards</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell people what your community is about, what content you create, and why they should join..."
                      className="min-h-[120px] bg-muted/50 text-base"
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
                  <FormLabel className="text-base">Community Rules</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Set expectations for how members should behave..."
                      className="min-h-[80px] bg-muted/50"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="visuals"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
                <ImagePlus className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Make it stand out</h2>
              <p className="text-muted-foreground">Add visuals to help your community get noticed</p>
            </div>

            <div className="space-y-6">
              <div>
                <FormLabel className="text-base">Banner Image</FormLabel>
                <p className="text-sm text-muted-foreground mb-3">
                  Recommended: 1200x400px or 3:1 aspect ratio
                </p>
                <CommunityImageUpload
                  userId={user?.id || ''}
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  type="banner"
                  disabled={!user?.id}
                />
              </div>

              <div>
                <FormLabel className="text-base">Avatar / Logo</FormLabel>
                <p className="text-sm text-muted-foreground mb-3">
                  Recommended: 400x400px square image
                </p>
                <CommunityImageUpload
                  userId={user?.id || ''}
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  type="avatar"
                  disabled={!user?.id}
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="access"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Who can join?</h2>
              <p className="text-muted-foreground">Optionally gate your community with token requirements</p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="is_nft_gated"
                render={({ field }) => (
                  <Card className={cn(
                    "transition-all cursor-pointer hover:border-primary/50",
                    field.value && "border-primary bg-primary/5"
                  )}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-xl transition-colors",
                          field.value ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Shield className={cn(
                            "h-6 w-6 transition-colors",
                            field.value ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <h3 className="font-semibold">NFT Gated</h3>
                          <p className="text-sm text-muted-foreground">
                            Members must hold a specific NFT to join
                          </p>
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </CardContent>
                  </Card>
                )}
              />

              <AnimatePresence>
                {watchNftGated && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FormField
                      control={form.control}
                      name="nft_contract_address"
                      render={({ field }) => (
                        <FormItem className="pl-4 border-l-2 border-primary/30 ml-6">
                          <FormLabel>Contract Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0x..." 
                              className="font-mono text-sm bg-muted/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <FormField
                control={form.control}
                name="is_ens_gated"
                render={({ field }) => (
                  <Card className={cn(
                    "transition-all cursor-pointer hover:border-blue-500/50",
                    field.value && "border-blue-500 bg-blue-500/5"
                  )}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-xl transition-colors",
                          field.value ? "bg-blue-500/20" : "bg-muted"
                        )}>
                          <Hexagon className={cn(
                            "h-6 w-6 transition-colors",
                            field.value ? "text-blue-500" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <h3 className="font-semibold">ENS/Base Name Gated</h3>
                          <p className="text-sm text-muted-foreground">
                            Members must have an ENS or Base name
                          </p>
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </CardContent>
                  </Card>
                )}
              />

              <AnimatePresence>
                {watchEnsGated && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FormField
                      control={form.control}
                      name="required_ens_suffix"
                      render={({ field }) => (
                        <FormItem className="pl-4 border-l-2 border-blue-500/30 ml-6">
                          <FormLabel>Required Suffix (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder=".eth or .base.eth" 
                              className="bg-muted/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>Leave empty to accept any name</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {!watchNftGated && !watchEnsGated && (
                <p className="text-center text-muted-foreground py-4">
                  Your community will be open for anyone to join
                </p>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Looking good!</h2>
              <p className="text-muted-foreground">Review your community before launching</p>
            </div>

            {/* Preview Card */}
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-primary/30 to-secondary/30">
                {bannerUrl && (
                  <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <CardContent className="pt-0 -mt-8">
                <div className="flex items-end gap-4 mb-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-4 border-background overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary-foreground">
                        {watchName.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{watchName || 'Community Name'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {form.watch('short_description') || 'Your tagline here'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">0 members</span>
                  </div>

                  {(watchNftGated || watchEnsGated) && (
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {watchNftGated && 'NFT Gated'}
                        {watchNftGated && watchEnsGated && ' + '}
                        {watchEnsGated && 'ENS Gated'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {watchDescription || 'No description provided'}
              </p>
            </div>

            {form.watch('rules') && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Community Rules</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {form.watch('rules')}
                </p>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-24 px-4 max-w-2xl mx-auto">
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Create Community</h1>
              <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-colors",
                  index <= currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Step labels */}
          <div className="hidden sm:flex items-center justify-between text-xs">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-1.5 transition-colors",
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                )}
              >
                <step.icon className="h-3.5 w-3.5" />
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mt-8 pt-6 border-t border-border/50"
            >
              <Button
                type="button"
                variant="ghost"
                onClick={currentStep === 0 ? () => navigate('/communities') : handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 0 ? 'Cancel' : 'Back'}
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createCommunity.isPending}
                  className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  {createCommunity.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Launch Community
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default CreateCommunity;

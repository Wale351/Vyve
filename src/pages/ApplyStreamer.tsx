import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Radio, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Sparkles,
  Users,
  Coins,
  MessageSquare,
  LogIn,
} from 'lucide-react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useOwnProfile, useUserRole } from '@/hooks/useProfile';
import { useMyApplication, useSubmitApplication } from '@/hooks/useStreamerApplication';
import { useGames } from '@/hooks/useGames';
import WalletConnectButton from '@/components/WalletConnectButton';

export default function ApplyStreamer() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthenticating } = useWalletAuth();
  const { data: profile, isLoading: profileLoading } = useOwnProfile(user?.id);
  const { data: role, isLoading: roleLoading } = useUserRole(user?.id);
  const { data: application, isLoading: appLoading } = useMyApplication(user?.id);
  const { data: games = [] } = useGames();
  const submitApplication = useSubmitApplication();

  const [formData, setFormData] = useState({
    why_stream: '',
    content_type: '',
    streaming_frequency: '',
    prior_experience: '',
    primary_game_id: '',
    twitter: '',
    discord: '',
    youtube: '',
  });

  const isLoading = profileLoading || roleLoading || appLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !profile) return;

    await submitApplication.mutateAsync({
      userId: user.id,
      username: profile.username,
      bio: profile.bio || '',
      formData: {
        why_stream: formData.why_stream,
        content_type: formData.content_type,
        streaming_frequency: formData.streaming_frequency,
        prior_experience: formData.prior_experience,
        primary_game_id: formData.primary_game_id || undefined,
        socials: {
          twitter: formData.twitter || undefined,
          discord: formData.discord || undefined,
          youtube: formData.youtube || undefined,
        },
      },
    });
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12 md:py-20 flex items-center justify-center">
          <div className="glass-card max-w-md p-8 text-center">
            <LogIn className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to apply as a streamer.
            </p>
            <WalletConnectButton 
              variant="premium" 
              size="lg"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Connect Wallet'}
            </WalletConnectButton>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Already a streamer
  if (role === 'streamer' || role === 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12 md:py-20 flex items-center justify-center">
          <div className="glass-card max-w-md p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">You're Already a Streamer!</h1>
            <p className="text-muted-foreground mb-6">
              You have full access to go live and stream.
            </p>
            <Link to="/go-live">
              <Button variant="premium" className="gap-2">
                <Radio className="h-4 w-4" />
                Go Live
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Has pending application
  if (application?.status === 'pending') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12 md:py-20">
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-8 text-center mb-8">
              <Clock className="h-12 w-12 text-warning mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold mb-2">Application Pending</h1>
              <p className="text-muted-foreground mb-2">
                Your streamer application is being reviewed.
              </p>
              <p className="text-sm text-muted-foreground">
                Submitted on {new Date(application.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Tips while waiting */}
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-semibold mb-4">While you wait...</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/20">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Complete your profile</p>
                    <p className="text-xs text-muted-foreground">Add a bio and avatar to stand out</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/20">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Follow streamers</p>
                    <p className="text-xs text-muted-foreground">Build your network</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/20">
                  <Coins className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Send tips</p>
                    <p className="text-xs text-muted-foreground">Support other creators</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/20">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Join the chat</p>
                    <p className="text-xs text-muted-foreground">Engage with the community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Application rejected
  if (application?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12 md:py-20 flex items-center justify-center">
          <div className="glass-card max-w-md p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Application Not Approved</h1>
            <p className="text-muted-foreground mb-4">
              Unfortunately, your application wasn't approved at this time.
            </p>
            {application.admin_notes && (
              <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 mb-4">
                {application.admin_notes}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              You may apply again in the future.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show application form
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-14 md:h-16" />
      
      <div className="container px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Radio className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Become a Streamer</h1>
            <p className="text-muted-foreground">
              Apply to unlock streaming capabilities on Vyve
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="why_stream">Why do you want to stream on Vyve? *</Label>
              <Textarea
                id="why_stream"
                value={formData.why_stream}
                onChange={(e) => setFormData({ ...formData, why_stream: e.target.value })}
                placeholder="Tell us about your motivation..."
                className="min-h-24"
                required
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_type">What type of content will you stream? *</Label>
              <Select 
                value={formData.content_type} 
                onValueChange={(v) => setFormData({ ...formData, content_type: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="web3">Web3 / Crypto</SelectItem>
                  <SelectItem value="irl">IRL / Just Chatting</SelectItem>
                  <SelectItem value="creative">Creative / Art</SelectItem>
                  <SelectItem value="esports">Esports / Competitive</SelectItem>
                  <SelectItem value="education">Education / Tutorials</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="streaming_frequency">How often do you plan to stream? *</Label>
              <Select 
                value={formData.streaming_frequency} 
                onValueChange={(v) => setFormData({ ...formData, streaming_frequency: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="several_weekly">Several times a week</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Every two weeks</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prior_experience">Prior streaming experience</Label>
              <Textarea
                id="prior_experience"
                value={formData.prior_experience}
                onChange={(e) => setFormData({ ...formData, prior_experience: e.target.value })}
                placeholder="Tell us about your experience on other platforms..."
                className="min-h-20"
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_game">Primary game/activity</Label>
              <Select 
                value={formData.primary_game_id} 
                onValueChange={(v) => setFormData({ ...formData, primary_game_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a game..." />
                </SelectTrigger>
                <SelectContent>
                  {games.map(game => (
                    <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Social links */}
            <div className="space-y-4">
              <Label>Social Links (optional)</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Twitter/X username"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                />
                <Input
                  placeholder="Discord username"
                  value={formData.discord}
                  onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                />
                <Input
                  placeholder="YouTube channel"
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="premium" 
              size="lg" 
              className="w-full gap-2"
              disabled={!formData.why_stream || !formData.content_type || !formData.streaming_frequency || submitApplication.isPending}
            >
              {submitApplication.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

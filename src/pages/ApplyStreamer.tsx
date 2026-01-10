import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useUserRole, useOwnProfile } from '@/hooks/useProfile';
import { useApplicationStatus, useSubmitApplication } from '@/hooks/useStreamerApplication';
import { useGames } from '@/hooks/useGames';
import {
  Radio,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Lightbulb,
  Users,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ApplyStreamer() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useWalletAuth();
  const { data: role, isLoading: roleLoading } = useUserRole(user?.id);
  const { data: profile } = useOwnProfile(user?.id);
  const { data: applicationStatus, isLoading: statusLoading } = useApplicationStatus(user?.id);
  const { data: games = [] } = useGames();
  const submitApplication = useSubmitApplication();
  
  // Form state
  const [formData, setFormData] = useState({
    why_stream: '',
    content_type: '',
    streaming_frequency: '',
    prior_experience: '',
    twitter: '',
    discord: '',
    youtube: '',
    twitch: '',
    primary_game_id: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !profile) return;
    
    await submitApplication.mutateAsync({
      userId: user.id,
      data: {
        username: profile.username,
        bio: profile.bio || '',
        why_stream: formData.why_stream,
        content_type: formData.content_type,
        streaming_frequency: formData.streaming_frequency,
        prior_experience: formData.prior_experience || undefined,
        socials: {
          twitter: formData.twitter || undefined,
          discord: formData.discord || undefined,
          youtube: formData.youtube || undefined,
          twitch: formData.twitch || undefined,
        },
        primary_game_id: formData.primary_game_id || undefined,
      },
    });
    
    navigate(`/profile/${user.id}`);
  };
  
  // Loading state
  if (roleLoading || statusLoading) {
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
  
  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }
  
  // Already a streamer or admin
  if (role === 'streamer' || role === 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-bold mb-2">You're already a streamer!</h2>
              <p className="text-muted-foreground mb-4">
                You can start streaming anytime.
              </p>
              <Link to="/go-live">
                <Button variant="premium" className="gap-2">
                  <Radio className="h-4 w-4" />
                  Go Live
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Has pending application
  if (applicationStatus?.has_pending) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6">
              <CardContent className="pt-6 text-center">
                <Clock className="h-16 w-16 mx-auto mb-4 text-amber-500" />
                <h2 className="text-xl font-bold mb-2">Application Pending</h2>
                <p className="text-muted-foreground mb-4">
                  Your streamer application is being reviewed. We'll notify you once a decision is made.
                </p>
                {applicationStatus.latest_created_at && (
                  <p className="text-sm text-muted-foreground">
                    Submitted {formatDistanceToNow(new Date(applicationStatus.latest_created_at), { addSuffix: true })}
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Tips while waiting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  While You Wait
                </CardTitle>
                <CardDescription>
                  Tips to improve your chances and prepare for streaming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TipItem
                  icon={Users}
                  title="Complete Your Profile"
                  description="Add a bio, profile picture, and make sure your profile looks professional."
                />
                <TipItem
                  icon={Heart}
                  title="Engage with the Community"
                  description="Follow streamers, participate in chats, and be an active community member."
                />
                <TipItem
                  icon={TrendingUp}
                  title="Support Other Creators"
                  description="Tip your favorite streamers and show you're invested in the platform."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  // Recently rejected
  if (applicationStatus?.latest_status === 'rejected') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Application Not Approved</h2>
              <p className="text-muted-foreground mb-4">
                Your previous application wasn't approved. You can submit a new application.
              </p>
              <Button onClick={() => window.location.reload()}>
                Submit New Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Application form
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-14 md:h-16" />
      
      <div className="container px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Radio className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Become a Streamer</h1>
            <p className="text-muted-foreground">
              Tell us about yourself and why you want to stream on Vyve
            </p>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Why stream */}
                <div className="space-y-2">
                  <Label htmlFor="why_stream">Why do you want to stream on Vyve? *</Label>
                  <Textarea
                    id="why_stream"
                    value={formData.why_stream}
                    onChange={(e) => setFormData({ ...formData, why_stream: e.target.value })}
                    placeholder="Tell us about your motivation and goals..."
                    rows={4}
                    required
                    maxLength={1000}
                  />
                </div>
                
                {/* Content type */}
                <div className="space-y-2">
                  <Label htmlFor="content_type">What type of content will you stream? *</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="esports">Esports / Competitive</SelectItem>
                      <SelectItem value="irl">IRL / Just Chatting</SelectItem>
                      <SelectItem value="creative">Creative / Art</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="variety">Variety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Primary game */}
                <div className="space-y-2">
                  <Label htmlFor="primary_game">Primary Game/Activity</Label>
                  <Select
                    value={formData.primary_game_id}
                    onValueChange={(value) => setFormData({ ...formData, primary_game_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your main game (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {games.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Streaming frequency */}
                <div className="space-y-2">
                  <Label htmlFor="frequency">How often do you plan to stream? *</Label>
                  <Select
                    value={formData.streaming_frequency}
                    onValueChange={(value) => setFormData({ ...formData, streaming_frequency: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
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
                
                {/* Prior experience */}
                <div className="space-y-2">
                  <Label htmlFor="prior_experience">Prior streaming experience (optional)</Label>
                  <Textarea
                    id="prior_experience"
                    value={formData.prior_experience}
                    onChange={(e) => setFormData({ ...formData, prior_experience: e.target.value })}
                    placeholder="Have you streamed before? Tell us about it..."
                    rows={3}
                    maxLength={500}
                  />
                </div>
                
                {/* Social links */}
                <div className="space-y-4">
                  <Label>Social Links (optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="text-sm text-muted-foreground">Twitter/X</Label>
                      <Input
                        id="twitter"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discord" className="text-sm text-muted-foreground">Discord</Label>
                      <Input
                        id="discord"
                        value={formData.discord}
                        onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                        placeholder="username#0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube" className="text-sm text-muted-foreground">YouTube</Label>
                      <Input
                        id="youtube"
                        value={formData.youtube}
                        onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitch" className="text-sm text-muted-foreground">Twitch</Label>
                      <Input
                        id="twitch"
                        value={formData.twitch}
                        onChange={(e) => setFormData({ ...formData, twitch: e.target.value })}
                        placeholder="https://twitch.tv/..."
                      />
                    </div>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  variant="premium"
                  size="lg"
                  className="w-full gap-2"
                  disabled={submitApplication.isPending || !formData.why_stream || !formData.content_type || !formData.streaming_frequency}
                >
                  {submitApplication.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Radio className="h-4 w-4" />
                  )}
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TipItem({ icon: Icon, title, description }: {
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="p-2 rounded-lg bg-primary/10 h-fit">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

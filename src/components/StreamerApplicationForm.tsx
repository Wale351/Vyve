import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGames } from '@/hooks/useGames';
import { useOwnApplication, useSubmitApplication } from '@/hooks/useAdmin';
import { useOwnProfile } from '@/hooks/useProfile';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { Loader2, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const StreamerApplicationForm = () => {
  const { user } = useWalletAuth();
  const { data: profile } = useOwnProfile(user?.id);
  const { data: games } = useGames();
  const { data: existingApplication, isLoading: appLoading } = useOwnApplication(user?.id);
  const submitApplication = useSubmitApplication();

  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState('');
  const [gameId, setGameId] = useState('');
  const [experience, setExperience] = useState('');
  const [socials, setSocials] = useState({ twitch: '', youtube: '', twitter: '' });
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    if (!profile?.username || !bio || !agreed) return;

    await submitApplication.mutateAsync({
      username: profile.username,
      bio,
      primary_game_id: gameId || undefined,
      socials: {
        ...socials,
        experience,
      },
    });

    setOpen(false);
    setBio('');
    setGameId('');
    setExperience('');
    setSocials({ twitch: '', youtube: '', twitter: '' });
    setAgreed(false);
  };

  if (appLoading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  // Show application status if exists
  if (existingApplication) {
    const statusConfig = {
      pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending Review' },
      approved: { icon: CheckCircle, color: 'text-green-500', label: 'Approved' },
      rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejected' },
    }[existingApplication.status] || { icon: Clock, color: 'text-muted-foreground', label: existingApplication.status };

    const StatusIcon = statusConfig.icon;

    return (
      <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
          <span className="font-medium">Streamer Application</span>
          <Badge variant={existingApplication.status === 'approved' ? 'default' : existingApplication.status === 'rejected' ? 'destructive' : 'secondary'}>
            {statusConfig.label}
          </Badge>
        </div>
        {existingApplication.status === 'rejected' && existingApplication.admin_notes && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Note:</span> {existingApplication.admin_notes}
          </p>
        )}
        {existingApplication.status === 'approved' && (
          <p className="text-sm text-green-600">
            Congratulations! You can now go live and stream to your audience.
          </p>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Apply to Stream
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Streamer Application</DialogTitle>
          <DialogDescription>
            Apply to become a verified streamer. Your application will be reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Username (read-only) */}
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={profile?.username || ''} disabled className="bg-muted/50" />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="app-bio">What do you plan to stream? *</Label>
            <Textarea
              id="app-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              placeholder="Tell us about your streaming plans and content..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
          </div>

          {/* Primary Game */}
          <div className="space-y-2">
            <Label>Primary Activity</Label>
            <Select value={gameId} onValueChange={setGameId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an activity" />
              </SelectTrigger>
              <SelectContent>
                {games?.map((game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">Streaming Experience (optional)</Label>
            <Input
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g., 2 years on Twitch with 500 avg viewers"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-2">
            <Label>Social Links (optional)</Label>
            <div className="space-y-2">
              <Input
                value={socials.twitch}
                onChange={(e) => setSocials(s => ({ ...s, twitch: e.target.value }))}
                placeholder="Twitch URL"
              />
              <Input
                value={socials.youtube}
                onChange={(e) => setSocials(s => ({ ...s, youtube: e.target.value }))}
                placeholder="YouTube URL"
              />
              <Input
                value={socials.twitter}
                onChange={(e) => setSocials(s => ({ ...s, twitter: e.target.value }))}
                placeholder="X (Twitter) URL"
              />
            </div>
          </div>

          {/* Agreement */}
          <div className="flex items-start gap-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <label htmlFor="agree" className="text-sm text-muted-foreground">
              I agree to follow the community guidelines and stream appropriate content.
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!bio || !agreed || submitApplication.isPending}
          >
            {submitApplication.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Submit Application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreamerApplicationForm;

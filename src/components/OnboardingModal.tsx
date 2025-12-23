import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Loader2, User, Sparkles, ArrowRight, X } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useProfileUpdate, useAvatarUpload } from '@/hooks/useProfileUpdate';

const OnboardingModal = () => {
  const { showOnboarding, dismissOnboarding, completeOnboarding, profile, userId } = useOnboarding();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const profileUpdate = useProfileUpdate();
  const avatarUpload = useAvatarUpload();
  
  const isLoading = profileUpdate.isPending || avatarUpload.isPending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    if (!userId) return;

    try {
      // Upload avatar first if selected
      if (avatarFile) {
        await avatarUpload.mutateAsync({ userId, file: avatarFile });
      }

      // Update profile
      const updateData: { username?: string; bio?: string } = {};
      if (username.trim()) updateData.username = username.trim();
      if (bio.trim()) updateData.bio = bio.trim();

      if (Object.keys(updateData).length > 0) {
        await profileUpdate.mutateAsync({ userId, data: updateData });
      }

      completeOnboarding();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const displayInitial = username.charAt(0).toUpperCase() || profile?.username?.charAt(0)?.toUpperCase() || 'U';

  return (
    <Dialog open={showOnboarding} onOpenChange={(open) => !open && dismissOnboarding()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="font-display text-2xl">Welcome to Base Haven!</DialogTitle>
          <DialogDescription>
            Set up your profile to get started. You can always update these later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer group"
            >
              <Avatar className="w-24 h-24 border-2 border-border">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Avatar preview" />
                ) : profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Current avatar" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl">
                    {displayInitial}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-6 w-6" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">Click to upload avatar (max 2MB)</p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Display Name</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 50))}
              placeholder="Enter a display name..."
              className="bg-muted/30"
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              placeholder="Tell others about yourself..."
              className="bg-muted/30 resize-none"
              rows={3}
              maxLength={200}
            />
            {bio.length > 150 && (
              <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={dismissOnboarding}
            className="flex-1"
            disabled={isLoading}
          >
            Skip for now
          </Button>
          <Button
            variant="premium"
            onClick={handleComplete}
            className="flex-1 gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Get Started
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;

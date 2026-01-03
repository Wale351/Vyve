import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useOwnProfile, useCanUpdateProfileImage, useUserRole } from '@/hooks/useProfile';
import { useProfileUpdate, useProfileImageUpload, useRequestStreamerRole } from '@/hooks/useProfileUpdate';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import StreamerApplicationForm from '@/components/StreamerApplicationForm';
import { 
  Camera, 
  Loader2, 
  Save, 
  User, 
  Shield, 
  Bell,
  Palette,
  Lock,
  BellRing,
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { user, isAuthenticated, isInitialized } = useWalletAuth();
  const { data: profile, isLoading: profileLoading } = useOwnProfile(user?.id);
  const { data: role } = useUserRole(user?.id);
  const { data: imageUpdateInfo } = useCanUpdateProfileImage(user?.id);
  
  const [editBio, setEditBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileUpdate = useProfileUpdate();
  const imageUpload = useProfileImageUpload();
  const requestStreamer = useRequestStreamerRole();
  const isUpdating = profileUpdate.isPending || imageUpload.isPending;

  // Initialize form when profile loads
  useState(() => {
    if (profile?.bio) {
      setEditBio(profile.bio);
    }
  });

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, WebP, or GIF)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Max file size is 5MB');
        return;
      }
      
      setAvatarFile(file);
      setHasChanges(true);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBioChange = (value: string) => {
    setEditBio(value);
    setHasChanges(value !== (profile?.bio || ''));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      if (avatarFile && imageUpdateInfo?.canUpdate) {
        await imageUpload.mutateAsync({ userId: user.id, file: avatarFile });
      }

      const updateData: { bio?: string | null } = {};
      if (editBio.trim() !== (profile?.bio || '')) {
        updateData.bio = editBio.trim() || null;
      }

      if (Object.keys(updateData).length > 0) {
        await profileUpdate.mutateAsync({ userId: user.id, data: updateData });
      }

      setAvatarPreview(null);
      setAvatarFile(null);
      setHasChanges(false);
      toast.success('Settings saved!');
    } catch (error) {
      // Error handling done in mutation hooks
    }
  };

  const handleRequestStreamer = async () => {
    if (!user?.id) return;
    await requestStreamer.mutateAsync(user.id);
  };

  const displayAvatar = avatarPreview || profile?.avatar_url;

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />
      
      <div className="container max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Customize your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {imageUpdateInfo?.canUpdate ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative cursor-pointer group"
                    >
                      <Avatar className="w-20 h-20 border-2 border-border">
                        {displayAvatar ? (
                          <AvatarImage src={displayAvatar} alt="Avatar" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl">
                            {profile?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="h-6 w-6" />
                      </div>
                    </div>
                  ) : (
                    <Avatar className="w-20 h-20 border-2 border-border">
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt="Avatar" />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl">
                          {profile?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="font-medium">{profile?.username}</p>
                  {!imageUpdateInfo?.canUpdate && imageUpdateInfo?.nextUpdateDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Avatar can be changed on {imageUpdateInfo.nextUpdateDate.toLocaleDateString()}
                    </p>
                  )}
                  {imageUpdateInfo?.canUpdate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to change profile picture
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Username (read-only) */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Username</Label>
                <Input 
                  value={profile?.username || ''} 
                  disabled 
                  className="bg-muted/30"
                />
                <p className="text-xs text-muted-foreground">Username cannot be changed</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editBio || profile?.bio || ''}
                  onChange={(e) => handleBioChange(e.target.value.slice(0, 500))}
                  placeholder="Tell others about yourself..."
                  className="bg-muted/30 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {(editBio || profile?.bio || '').length}/500
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Streamer Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Creator Status
              </CardTitle>
              <CardDescription>
                Apply to become a verified streamer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {role === 'streamer' || role === 'admin' ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">You're a Streamer!</p>
                    <p className="text-sm text-muted-foreground">You can go live and stream to your audience</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Become a Streamer</p>
                    <p className="text-sm text-muted-foreground">
                      Apply to unlock streaming and get verified. Applications are reviewed by our team.
                    </p>
                  </div>
                  <StreamerApplicationForm />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <NotificationsCard />

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full ml-2">Coming Soon</span>
              </CardTitle>
              <CardDescription>
                Customize the look and feel of Vyve
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy & Security
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full ml-2">Coming Soon</span>
              </CardTitle>
              <CardDescription>
                Manage your privacy settings
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Save Button */}
          {hasChanges && (
            <div className="sticky bottom-4 flex justify-end">
              <Button
                variant="premium"
                size="lg"
                onClick={handleSave}
                disabled={isUpdating}
                className="shadow-lg"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Separate component for notifications to use the hook
const NotificationsCard = () => {
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    permission,
    toggleSubscription 
  } = usePushNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Manage your notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BellRing className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                {!isSupported 
                  ? "Not supported in this browser"
                  : permission === 'denied'
                  ? "Blocked in browser settings"
                  : "Get notified when streamers you follow go live"}
              </p>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={toggleSubscription}
            disabled={!isSupported || isLoading || permission === 'denied'}
          />
        </div>
        
        {permission === 'denied' && (
          <p className="text-xs text-destructive">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Settings;

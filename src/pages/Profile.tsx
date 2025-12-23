import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useProfile, useProfileTipsReceived, useOwnProfile } from '@/hooks/useProfile';
import { useStreamerStreams } from '@/hooks/useStreams';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useProfileUpdate, useAvatarUpload } from '@/hooks/useProfileUpdate';
import { 
  Users, 
  Coins, 
  Radio, 
  Copy, 
  Check,
  Calendar,
  Loader2,
  Camera,
  Pencil,
  X,
  Save
} from 'lucide-react';
import { useState as useLocalState } from 'react';
import { toast } from 'sonner';

const Profile = () => {
  const { profileId } = useParams();
  const { user } = useWalletAuth();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if viewing own profile
  const isOwnProfile = user?.id === profileId;

  // Fetch public profile data
  const { data: profile, isLoading: profileLoading } = useProfile(profileId);
  
  // Fetch own profile with wallet address if viewing own profile
  const { data: ownProfile } = useOwnProfile(isOwnProfile ? profileId : undefined);
  
  const { data: totalTips = 0 } = useProfileTipsReceived(profile?.id);
  const { data: streams = [], isLoading: streamsLoading } = useStreamerStreams(profile?.id);

  const profileUpdate = useProfileUpdate();
  const avatarUpload = useAvatarUpload();
  const isUpdating = profileUpdate.isPending || avatarUpload.isPending;

  const copyAddress = async () => {
    if (ownProfile?.wallet_address) {
      await navigator.clipboard.writeText(ownProfile.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied!');
    }
  };

  const startEditing = () => {
    setEditUsername(profile?.username || '');
    setEditBio(profile?.bio || '');
    setAvatarPreview(null);
    setAvatarFile(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a JPEG, PNG, WebP, or GIF image');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 2MB');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      // Upload avatar first if selected
      if (avatarFile) {
        await avatarUpload.mutateAsync({ userId: user.id, file: avatarFile });
      }

      // Update profile data
      const updateData: { username?: string; bio?: string } = {};
      if (editUsername.trim() !== profile?.username) {
        updateData.username = editUsername.trim() || null;
      }
      if (editBio.trim() !== profile?.bio) {
        updateData.bio = editBio.trim() || null;
      }

      if (Object.keys(updateData).length > 0) {
        await profileUpdate.mutateAsync({ userId: user.id, data: updateData });
      }

      setIsEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (error) {
      // Error handling is done in mutation hooks
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <div className="glass-card p-12 max-w-md mx-auto">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-display font-bold mb-2">Profile Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This profile doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button variant="premium">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile.username || 'Anonymous';
  const displayAvatar = avatarPreview || profile.avatar_url;
  const liveStreams = streams.filter(s => s.is_live);
  const pastStreams = streams.filter(s => !s.is_live);
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      <div className="container py-8">
        {/* Profile Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              {isEditing ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer group"
                >
                  <Avatar className="w-32 h-32 border-2 border-border">
                    {displayAvatar ? (
                      <AvatarImage src={displayAvatar} alt="Avatar" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary via-primary/80 to-secondary text-primary-foreground font-bold text-4xl">
                        {(editUsername || displayName).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-8 w-8" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <Avatar className="w-32 h-32 border-2 border-border shadow-xl">
                  {profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={displayName} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary via-primary/80 to-secondary text-primary-foreground font-bold text-4xl">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="username">Display Name</Label>
                        <Input
                          id="username"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value.slice(0, 50))}
                          placeholder="Enter a display name..."
                          className="bg-muted/30"
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value.slice(0, 200))}
                          placeholder="Tell others about yourself..."
                          className="bg-muted/30 resize-none"
                          rows={3}
                          maxLength={200}
                        />
                        {editBio.length > 150 && (
                          <p className="text-xs text-muted-foreground text-right">{editBio.length}/200</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-display font-bold mb-2">{displayName}</h1>
                      
                      {/* Only show wallet address to profile owner */}
                      {isOwnProfile && ownProfile?.wallet_address && (
                        <button
                          onClick={copyAddress}
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm mb-4"
                        >
                          <span>{ownProfile.wallet_address.slice(0, 6)}...{ownProfile.wallet_address.slice(-4)}</span>
                          {copied ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {joinDate}</span>
                      </div>
                    </>
                  )}
                </div>

                {isOwnProfile && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelEditing}
                          disabled={isUpdating}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="premium"
                          onClick={handleSave}
                          disabled={isUpdating}
                          className="gap-2"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="subtle"
                          onClick={startEditing}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Profile
                        </Button>
                        <Link to="/go-live">
                          <Button variant="premium" className="gap-2">
                            <Radio className="h-4 w-4" />
                            Go Live
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {!isEditing && profile.bio && (
                <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              {!isEditing && (
                <div className="flex gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Radio className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{streams.length}</p>
                      <p className="text-xs text-muted-foreground">Streams</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Coins className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{totalTips.toFixed(3)} ETH</p>
                      <p className="text-xs text-muted-foreground">Tips Received</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="space-y-8">
          {/* Live Streams */}
          {liveStreams.length > 0 && (
            <section>
              <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                Live Now
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveStreams.map(stream => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            </section>
          )}

          {/* Past Streams */}
          <section>
            <h2 className="text-xl font-display font-semibold mb-4">Past Streams</h2>
            {streamsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pastStreams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastStreams.map(stream => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {isOwnProfile 
                    ? "You haven't streamed yet. Start your first stream!"
                    : "No past streams yet."}
                </p>
                {isOwnProfile && (
                  <Link to="/go-live" className="mt-4 inline-block">
                    <Button variant="premium">
                      Start Streaming
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;

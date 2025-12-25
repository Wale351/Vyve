import { useState, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import ProfileBadges from '@/components/ProfileBadges';
import FollowButton from '@/components/FollowButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  useProfile, 
  useProfileTipsReceived, 
  useOwnProfile,
  useFollowerCount,
  useFollowingCount,
  useCanUpdateProfileImage,
} from '@/hooks/useProfile';
import { useStreamerStreams } from '@/hooks/useStreams';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useProfileUpdate, useProfileImageUpload, useRequestStreamerStatus } from '@/hooks/useProfileUpdate';
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
  Save,
  UserPlus,
  Shield,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { address: profileId } = useParams();
  const { user, isAuthenticated } = useWalletAuth();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = user?.id === profileId;
  const { data: profile, isLoading: profileLoading } = useProfile(profileId);
  const { data: ownProfile } = useOwnProfile(isOwnProfile ? profileId : undefined);
  const { data: totalTips = 0 } = useProfileTipsReceived(profileId);
  const { data: streams = [], isLoading: streamsLoading } = useStreamerStreams(profileId);
  const { data: followerCount = 0 } = useFollowerCount(profileId);
  const { data: followingCount = 0 } = useFollowingCount(profileId);
  const { data: imageUpdateInfo } = useCanUpdateProfileImage(isOwnProfile ? profileId : undefined);

  const profileUpdate = useProfileUpdate();
  const imageUpload = useProfileImageUpload();
  const requestStreamer = useRequestStreamerStatus();
  const isUpdating = profileUpdate.isPending || imageUpload.isPending;

  const copyAddress = async () => {
    if (ownProfile?.wallet_address) {
      await navigator.clipboard.writeText(ownProfile.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied!');
    }
  };

  const startEditing = () => {
    setEditDisplayName(profile?.display_name || '');
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
        toast.error('Please upload a valid image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Max file size is 5MB');
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
      if (avatarFile && imageUpdateInfo?.canUpdate) {
        await imageUpload.mutateAsync({ userId: user.id, file: avatarFile });
      }

      const updateData: { display_name?: string | null; bio?: string | null } = {};
      if (editDisplayName.trim() !== (profile?.display_name || '')) {
        updateData.display_name = editDisplayName.trim() || null;
      }
      if (editBio.trim() !== (profile?.bio || '')) {
        updateData.bio = editBio.trim() || null;
      }

      if (Object.keys(updateData).length > 0) {
        await profileUpdate.mutateAsync({ userId: user.id, data: updateData });
      }

      setIsEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (error) {
      // Error handling done in mutation hooks
    }
  };

  const handleRequestStreamer = async () => {
    if (!user?.id) return;
    await requestStreamer.mutateAsync(user.id);
  };

  // Redirect if no profile exists (should not happen with mandatory onboarding)
  if (!profileLoading && !profile && isAuthenticated && isOwnProfile) {
    return <Navigate to="/" replace />;
  }

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
        <div className="container px-4 py-12 md:py-16 text-center">
          <div className="glass-card p-8 md:p-12 max-w-md mx-auto">
            <Users className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-muted-foreground" />
            <h1 className="text-xl md:text-2xl font-display font-bold mb-2">Profile Not Found</h1>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
              This profile doesn't exist.
            </p>
            <Link to="/">
              <Button variant="premium">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username;
  const displayAvatar = avatarPreview || profile.profile_image_url;
  const liveStreams = streams.filter(s => s.is_live);
  const pastStreams = streams.filter(s => !s.is_live);
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      <div className="container px-4 py-4 md:py-8">
        {/* Profile Header */}
        <div className="glass-card p-4 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-4 md:gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              {isEditing && imageUpdateInfo?.canUpdate ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer group"
                >
                  <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-border">
                    {displayAvatar ? (
                      <AvatarImage src={displayAvatar} alt="Avatar" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary via-primary/80 to-secondary text-primary-foreground font-bold text-2xl md:text-4xl">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-6 w-6 md:h-8 md:w-8" />
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
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-border shadow-xl">
                  {profile.profile_image_url ? (
                    <AvatarImage src={profile.profile_image_url} alt={displayName} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary via-primary/80 to-secondary text-primary-foreground font-bold text-2xl md:text-4xl">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
              
              {/* Verification badge overlay */}
              {profile.verification_status === 'verified' && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                  <BadgeCheck className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-3 md:space-y-4 max-w-md mx-auto md:mx-0">
                  {/* Username (read-only) */}
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Username (cannot change)</Label>
                    <p className="text-lg font-semibold">@{profile.username}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm">Display Name</Label>
                    <Input
                      id="displayName"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value.slice(0, 50))}
                      placeholder="Enter a display name..."
                      className="bg-muted/30 h-10"
                      maxLength={50}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value.slice(0, 500))}
                      placeholder="Tell others about yourself..."
                      className="bg-muted/30 resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    {editBio.length > 400 && (
                      <p className="text-xs text-muted-foreground text-right">{editBio.length}/500</p>
                    )}
                  </div>
                  
                  {/* Image update notice */}
                  {!imageUpdateInfo?.canUpdate && imageUpdateInfo?.nextUpdateDate && (
                    <p className="text-xs text-muted-foreground">
                      Profile image can be changed on {imageUpdateInfo.nextUpdateDate.toLocaleDateString()}
                    </p>
                  )}
                  
                  {/* Edit actions */}
                  <div className="flex gap-2 justify-center md:justify-start pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      variant="premium"
                      size="sm"
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
                  </div>
                </div>
              ) : (
                <>
                  {/* Name and badges */}
                  <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap mb-1">
                    <h1 className="text-2xl md:text-3xl font-display font-bold">{displayName}</h1>
                    <ProfileBadges profile={profile} tipsReceived={totalTips} />
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-2">@{profile.username}</p>
                  
                  {/* Wallet address - only visible to owner */}
                  {isOwnProfile && ownProfile?.wallet_address && (
                    <button
                      onClick={copyAddress}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono text-xs md:text-sm mb-2 md:mb-4 mx-auto md:mx-0"
                    >
                      <span>{ownProfile.wallet_address.slice(0, 6)}...{ownProfile.wallet_address.slice(-4)}</span>
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}

                  <div className="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                    <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span>Joined {joinDate}</span>
                  </div>

                  {profile.bio && (
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mb-4 md:mb-0">
                      {profile.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 md:gap-6 mt-4 md:mt-6 justify-center md:justify-start flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                        <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm md:text-base">{followerCount}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">Followers</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                        <UserPlus className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm md:text-base">{followingCount}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">Following</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                        <Radio className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm md:text-base">{streams.length}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">Streams</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                        <Coins className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm md:text-base">{totalTips.toFixed(3)} ETH</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">Tips</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 md:mt-6 justify-center md:justify-start flex-wrap">
                    {isOwnProfile ? (
                      <>
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={startEditing}
                          className="gap-2"
                        >
                          <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          Edit
                        </Button>
                        
                        {profile.role === 'viewer' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRequestStreamer}
                            disabled={requestStreamer.isPending}
                            className="gap-2"
                          >
                            {requestStreamer.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Shield className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            )}
                            Become Streamer
                          </Button>
                        )}
                        
                        {profile.role === 'streamer' && (
                          <Link to="/go-live">
                            <Button variant="premium" size="sm" className="gap-2">
                              <Radio className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              Go Live
                            </Button>
                          </Link>
                        )}
                      </>
                    ) : (
                      <FollowButton profileId={profileId!} />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="space-y-6 md:space-y-8">
          {/* Live Streams */}
          {liveStreams.length > 0 && (
            <section>
              <h2 className="text-lg md:text-xl font-display font-semibold mb-3 md:mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                Live Now
              </h2>
              <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {liveStreams.map(stream => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            </section>
          )}

          {/* Past Streams */}
          {profile.role === 'streamer' && (
            <section>
              <h2 className="text-lg md:text-xl font-display font-semibold mb-3 md:mb-4">Past Streams</h2>
              {streamsLoading ? (
                <div className="flex items-center justify-center py-8 md:py-12">
                  <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
                </div>
              ) : pastStreams.length > 0 ? (
                <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                  {pastStreams.map(stream => (
                    <StreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-8 md:p-12 text-center">
                  <Radio className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-muted-foreground/50" />
                  <p className="text-sm md:text-base text-muted-foreground">
                    {isOwnProfile 
                      ? "No streams yet. Start your first!"
                      : "No past streams."}
                  </p>
                  {isOwnProfile && (
                    <Link to="/go-live" className="mt-4 inline-block">
                      <Button variant="premium" size="sm">
                        Start Streaming
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

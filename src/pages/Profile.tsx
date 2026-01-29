import { useState, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import ProfileBadges from '@/components/ProfileBadges';
import FollowButton from '@/components/FollowButton';
import NotificationToggle from '@/components/NotificationToggle';
import FollowersModal from '@/components/FollowersModal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  useProfile, 
  useProfileByWallet,
  useProfileByUsername,
  useProfileTipsReceived, 
  useOwnProfile,
  useFollowerCount,
  useFollowingCount,
  useCanUpdateProfileImage,
} from '@/hooks/useProfile';
import { useStreamerStreams, useStreamerRecordings } from '@/hooks/useStreams';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import VODCard from '@/components/VODCard';
import { useProfileUpdate, useProfileImageUpload, useRequestStreamerRole } from '@/hooks/useProfileUpdate';
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
  const { identifier } = useParams();
  const { user, isAuthenticated } = useWalletAuth();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect if the param is a wallet address (starts with 0x), UUID, or username
  const identifierLower = identifier?.toLowerCase();
  const isWalletAddress = !!identifierLower?.startsWith('0x');
  const isUUID = !!identifier?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  
  // Fetch profile by wallet address, ID, or username
  const { data: profileByWallet, isLoading: walletLoading } = useProfileByWallet(
    isWalletAddress ? identifierLower : undefined
  );
  const { data: profileById, isLoading: idLoading } = useProfile(
    isUUID ? identifier : undefined
  );
  const { data: profileByUsername, isLoading: usernameLoading } = useProfileByUsername(
    !isWalletAddress && !isUUID ? identifier : undefined
  );
  
  const profile = isWalletAddress ? profileByWallet : (isUUID ? profileById : profileByUsername);
  const profileLoading = isWalletAddress ? walletLoading : (isUUID ? idLoading : usernameLoading);
  const profileId = profile?.id;

  const isOwnProfile = user?.id === profileId;
  const { data: ownProfile } = useOwnProfile(isOwnProfile ? profileId : undefined);
  const { data: totalTips = 0 } = useProfileTipsReceived(profileId);
  const { data: streams = [], isLoading: streamsLoading } = useStreamerStreams(profileId);
  const { data: recordings = [], isLoading: recordingsLoading } = useStreamerRecordings(profileId);
  const { data: followerCount = 0 } = useFollowerCount(profileId);
  const { data: followingCount = 0 } = useFollowingCount(profileId);
  const { data: imageUpdateInfo } = useCanUpdateProfileImage(isOwnProfile ? profileId : undefined);

  const profileUpdate = useProfileUpdate();
  const imageUpload = useProfileImageUpload();
  const requestStreamer = useRequestStreamerRole();
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

      const updateData: { bio?: string | null } = {};
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

  // Check if viewing own profile by wallet address
  const isViewingOwnWallet = isWalletAddress && 
    user?.user_metadata?.wallet_address?.toLowerCase() === identifierLower;
  
  // Redirect if no profile exists for own wallet (should trigger onboarding instead)
  if (!profileLoading && !profile && isAuthenticated && isViewingOwnWallet) {
    return <Navigate to="/" replace />;
  }

  if (profileLoading) {
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
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

  const displayName = profile.username;
  const displayAvatar = avatarPreview || profile.avatar_url;
  const liveStreams = streams.filter(s => s.is_live);
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />
      
      <div className="container px-4 py-6 md:py-10 max-w-2xl mx-auto">
        {/* Compact Profile Header */}
        <motion.div 
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Avatar with subtle glow */}
          <div className="relative mb-4">
            {isEditing && imageUpdateInfo?.canUpdate ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer group"
              >
                <Avatar className="w-24 h-24 md:w-28 md:h-28 border-2 border-border/30">
                  {displayAvatar ? (
                    <AvatarImage src={displayAvatar} alt="Avatar" className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold text-2xl md:text-3xl">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5" />
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
              <Avatar className="w-24 h-24 md:w-28 md:h-28 border-2 border-border/30">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={displayName} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold text-2xl md:text-3xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            
            {profile.verified_creator && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                <BadgeCheck className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Name */}
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-display font-bold">{displayName}</h1>
            <ProfileBadges profile={profile} tipsReceived={totalTips} />
          </div>
          
          {/* Wallet address - only visible to owner */}
          {isOwnProfile && ownProfile?.wallet_address && (
            <button
              onClick={copyAddress}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-mono text-xs mb-2"
            >
              <span>{ownProfile.wallet_address.slice(0, 6)}...{ownProfile.wallet_address.slice(-4)}</span>
              {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            </button>
          )}

          {/* Join date */}
          <p className="text-xs text-muted-foreground mb-3">Joined {joinDate}</p>

          {/* Bio */}
          {profile.bio && !isEditing && (
            <p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed mb-4">
              {profile.bio}
            </p>
          )}

          {/* Stats - Horizontal compact */}
          <div className="flex items-center gap-6 text-center mb-5">
            <button 
              onClick={() => { setFollowersModalTab('followers'); setFollowersModalOpen(true); }}
              className="hover:opacity-70 transition-opacity"
            >
              <p className="font-semibold text-sm">{followerCount}</p>
              <p className="text-[11px] text-muted-foreground">followers</p>
            </button>
            
            <button 
              onClick={() => { setFollowersModalTab('following'); setFollowersModalOpen(true); }}
              className="hover:opacity-70 transition-opacity"
            >
              <p className="font-semibold text-sm">{followingCount}</p>
              <p className="text-[11px] text-muted-foreground">following</p>
            </button>
            
            <div>
              <p className="font-semibold text-sm">{streams.length}</p>
              <p className="text-[11px] text-muted-foreground">streams</p>
            </div>
            
            <div>
              <p className="font-semibold text-sm">{totalTips.toFixed(3)}</p>
              <p className="text-[11px] text-muted-foreground">ETH tips</p>
            </div>
          </div>

          {/* Edit mode */}
          {isEditing ? (
            <div className="w-full max-w-sm space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs text-muted-foreground">Bio</Label>
                <Textarea
                  id="bio"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value.slice(0, 500))}
                  placeholder="Tell others about yourself..."
                  className="bg-muted/30 resize-none text-sm"
                  rows={3}
                  maxLength={500}
                />
                {editBio.length > 400 && (
                  <p className="text-[10px] text-muted-foreground text-right">{editBio.length}/500</p>
                )}
              </div>
              
              {!imageUpdateInfo?.canUpdate && imageUpdateInfo?.nextUpdateDate && (
                <p className="text-[10px] text-muted-foreground text-center">
                  Avatar can be changed on {imageUpdateInfo.nextUpdateDate.toLocaleDateString()}
                </p>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button variant="premium" size="sm" onClick={handleSave} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <Button variant="outline" size="sm" onClick={startEditing} className="text-xs">
                    Edit Profile
                  </Button>
                  
                  {profile.role === 'viewer' && (
                    <Link to="/apply/streamer">
                      <Button variant="outline" size="sm" className="text-xs">
                        Become Streamer
                      </Button>
                    </Link>
                  )}
                  
                  {(profile.role === 'streamer' || profile.role === 'admin') && (
                    <Link to="/go-live">
                      <Button variant="premium" size="sm" className="text-xs">
                        Go Live
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <FollowButton profileId={profileId!} />
                  <NotificationToggle streamerId={profileId!} />
                </>
              )}
            </div>
          )}
        </motion.div>

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

          {/* Recorded Streams (VODs) */}
          {(profile.role === 'streamer' || profile.role === 'admin') && (
            <section>
              <h2 className="text-lg md:text-xl font-display font-semibold mb-3 md:mb-4">Recordings</h2>
              {recordingsLoading ? (
                <div className="flex items-center justify-center py-8 md:py-12">
                  <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
                </div>
              ) : recordings.length > 0 ? (
                <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                  {recordings.map(stream => (
                    <VODCard key={stream.id} stream={stream} />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-8 md:p-12 text-center">
                  <Radio className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-muted-foreground/50" />
                  <p className="text-sm md:text-base text-muted-foreground">
                    {isOwnProfile 
                      ? "No recordings yet. Stream with recording enabled to create VODs!"
                      : "No recordings available."}
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

      {/* Followers/Following Modal */}
      {profileId && (
        <FollowersModal
          open={followersModalOpen}
          onOpenChange={setFollowersModalOpen}
          profileId={profileId}
          initialTab={followersModalTab}
        />
      )}
    </motion.div>
  );
};

export default Profile;

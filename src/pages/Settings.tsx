import { useState, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useOwnProfile, useCanUpdateProfileImage, useUserRole } from '@/hooks/useProfile';
import { useProfileUpdate, useProfileImageUpload } from '@/hooks/useProfileUpdate';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { 
  Camera, 
  Loader2, 
  Save, 
  User, 
  Shield, 
  Bell,
  BellRing,
  Radio,
  ChevronRight,
  Wallet,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useEthPrice, formatFiatValue } from '@/hooks/useEthPrice';
import { useTheme, accentColorOptions } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'KRW', name: 'Korean Won', symbol: '₩' },
];

const Settings = () => {
  const { user, isAuthenticated, isInitialized, walletAddress } = useWalletAuth();
  const { address } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { data: ethPrices } = useEthPrice();
  const { data: profile, isLoading: profileLoading } = useOwnProfile(user?.id);
  const { data: role } = useUserRole(user?.id);
  const { data: imageUpdateInfo } = useCanUpdateProfileImage(user?.id);
  
  const [editBio, setEditBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileUpdate = useProfileUpdate();
  const imageUpload = useProfileImageUpload();
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

  const displayAvatar = avatarPreview || profile?.avatar_url;
  
  // Calculate fiat value
  const ethAmount = ethBalance ? parseFloat(formatEther(ethBalance.value)) : 0;
  const currencyKey = displayCurrency.toLowerCase() as keyof typeof ethPrices;
  const fiatValue = ethPrices && ethPrices[currencyKey] 
    ? formatFiatValue(ethAmount, ethPrices[currencyKey], displayCurrency)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />
      
      <div className="container max-w-2xl px-4 py-8 md:py-12">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Wallet Section */}
          <motion.div variants={fadeInUp} className="bg-card rounded-2xl border border-border/40 overflow-hidden">
            <div className="p-5 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg">Wallet</h2>
                  <p className="text-sm text-muted-foreground">Your crypto balance</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              {/* ETH Balance */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Ξ</span>
                  </div>
                  <div>
                    <p className="font-medium">Ethereum</p>
                    <p className="text-xs text-muted-foreground">ETH</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold">
                    {ethBalance ? parseFloat(formatEther(ethBalance.value)).toFixed(4) : '0.0000'} ETH
                  </p>
                  {fiatValue && (
                    <p className="text-sm text-muted-foreground font-mono">
                      ≈ {fiatValue}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Section */}
          <motion.div variants={fadeInUp} className="bg-card rounded-2xl border border-border/40 overflow-hidden">
            <div className="p-5 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg">Profile</h2>
                  <p className="text-sm text-muted-foreground">Customize your public profile</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-5">
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
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-semibold">
                            {profile?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute inset-0 rounded-full bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="h-6 w-6" />
                      </div>
                    </div>
                  ) : (
                    <Avatar className="w-20 h-20 border-2 border-border">
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt="Avatar" />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-semibold">
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
                  {!imageUpdateInfo?.canUpdate && imageUpdateInfo?.nextUpdateDate ? (
                    <p className="text-xs text-muted-foreground mt-1">
                      Avatar can be changed on {imageUpdateInfo.nextUpdateDate.toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to change profile picture
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm text-muted-foreground">Bio</Label>
                <Textarea
                  id="bio"
                  value={editBio || profile?.bio || ''}
                  onChange={(e) => handleBioChange(e.target.value.slice(0, 500))}
                  placeholder="Tell others about yourself..."
                  className="bg-muted/30 border-border/50 resize-none min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {(editBio || profile?.bio || '').length}/500
                </p>
              </div>
            </div>
          </motion.div>

          {/* Streamer Section */}
          <motion.div variants={fadeInUp} className="bg-card rounded-2xl border border-border/40 overflow-hidden">
            <div className="p-5 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg">Creator Status</h2>
                  <p className="text-sm text-muted-foreground">Streaming permissions</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              {role === 'streamer' || role === 'admin' ? (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Radio className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-success">You're a Streamer!</p>
                    <p className="text-sm text-muted-foreground">You can go live and stream to your audience</p>
                  </div>
                  <Link to="/go-live">
                    <Button variant="subtle" size="sm" className="gap-1">
                      Go Live <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Become a Streamer</p>
                    <p className="text-sm text-muted-foreground">Unlock the ability to go live</p>
                  </div>
                  <Link to="/apply/streamer">
                    <Button variant="premium" size="sm">
                      Apply
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div variants={fadeInUp}>
            <NotificationsCard />
          </motion.div>

          {/* Appearance Section */}
          <motion.div variants={fadeInUp}>
            <AppearanceCard />
          </motion.div>

          {/* Display Currency Section */}
          <motion.div variants={fadeInUp} className="bg-card rounded-2xl border border-border/40 overflow-hidden">
            <div className="p-5 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg">Display Currency</h2>
                  <p className="text-sm text-muted-foreground">Choose your preferred fiat currency</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Show values in</p>
                <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIAT_CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          {hasChanges && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-6 flex justify-end"
            >
              <Button
                variant="premium"
                size="lg"
                onClick={handleSave}
                disabled={isUpdating}
                className="shadow-xl"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </motion.div>
          )}
        </motion.div>
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
    <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
      <div className="p-5 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg">Notifications</h2>
            <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <BellRing className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                {!isSupported 
                  ? "Not supported in this browser"
                  : permission === 'denied'
                  ? "Blocked in browser settings"
                  : "Get notified when streamers go live"}
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
          <p className="text-xs text-destructive mt-3">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </div>
    </div>
  );
};

// Appearance settings component
const AppearanceCard = () => {
  const { accentColor, setAccentColor } = useTheme();

  return (
    <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
      <div className="p-5 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg">Appearance</h2>
            <p className="text-sm text-muted-foreground">Customize your app experience</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Accent Color</Label>
            <div className="flex gap-3">
              {accentColorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAccentColor(option.value)}
                  className={cn(
                    'w-10 h-10 rounded-xl transition-all duration-200',
                    option.class,
                    accentColor === option.value 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' 
                      : 'opacity-60 hover:opacity-100 hover:scale-105'
                  )}
                  title={option.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
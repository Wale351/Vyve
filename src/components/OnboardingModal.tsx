import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Loader2, AlertCircle, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useCreateProfile, useProfileImageUpload } from '@/hooks/useProfileUpdate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const OnboardingModal = () => {
  const { showOnboarding, completeOnboarding, userId, walletAddress } = useOnboarding();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const createProfile = useCreateProfile();
  const imageUpload = useProfileImageUpload();
  
  const isLoading = createProfile.isPending || imageUpload.isPending;

  const validateUsernameFormat = (value: string) => {
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 30) return 'Username must be 30 characters or less';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  };

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameError(null);
      return;
    }

    const formatError = validateUsernameFormat(username);
    if (formatError) {
      setUsernameError(formatError);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .maybeSingle();

        setUsernameError(data ? 'Username is already taken' : null);
      } catch (err) {
        console.error('Error checking username:', err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a JPEG, PNG, WebP, or GIF image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Maximum file size is 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    if (!userId || !walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!avatarFile) {
      toast.error('Please upload a profile picture');
      return;
    }
    const formatError = validateUsernameFormat(username);
    if (formatError) {
      toast.error(formatError);
      return;
    }
    if (usernameError) {
      toast.error(usernameError);
      return;
    }

    try {
      const avatarUrl = await imageUpload.mutateAsync({ userId, file: avatarFile });
      await createProfile.mutateAsync({ 
        userId, 
        walletAddress,
        username: username.trim(),
        bio: bio.trim() || undefined,
        avatarUrl,
      });
      completeOnboarding();
    } catch (error) {
      // Error handling done in mutation hooks
    }
  };

  const displayInitial = username.charAt(0).toUpperCase() || 'U';
  const canSubmit = avatarFile && username.trim() && !usernameError && !isCheckingUsername;

  return (
    <Dialog open={showOnboarding} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="font-display text-2xl">Welcome to Vyve!</DialogTitle>
          <DialogDescription>
            Create your profile to get started. Your username is permanent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-3">
            <div onClick={() => fileInputRef.current?.click()} className="relative cursor-pointer group">
              <Avatar className="w-24 h-24 border-2 border-border">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Avatar preview" />
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
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} className="hidden" />
            <div className="text-center">
              <p className="text-sm font-medium">Profile Picture <span className="text-destructive">*</span></p>
              <p className="text-xs text-muted-foreground">Max 5MB</p>
            </div>
            {!avatarFile && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />Required</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" /><span>Permanent</span></div>
            </div>
            <div className="relative">
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().slice(0, 30))} placeholder="Choose a unique username..." className={`bg-muted/30 ${usernameError ? 'border-destructive' : ''}`} maxLength={30} />
              {isCheckingUsername && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            {usernameError && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{usernameError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value.slice(0, 500))} placeholder="Tell others about yourself..." className="bg-muted/30 resize-none" rows={3} maxLength={500} />
          </div>
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-warning flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Important:</strong> Your username cannot be changed after profile creation.</span>
          </p>
        </div>

        <Button variant="premium" onClick={handleComplete} className="w-full gap-2" disabled={!canSubmit || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Create Profile</span><ArrowRight className="h-4 w-4" /></>}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;

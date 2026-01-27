import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateProfileData {
  bio?: string | null;
}

export const useProfileUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateProfileData }) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated!');
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    },
  });
};

export const useProfileImageUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 5MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache buster to force refresh
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithCacheBuster })
        .eq('id', userId);

      if (updateError) throw updateError;

      return urlWithCacheBuster;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile image updated!');
    },
    onError: (error: Error) => {
      console.error('Profile image upload error:', error);
      if (error.message.includes('30 days')) {
        toast.error(error.message);
      } else {
        toast.error(error.message || 'Failed to upload profile image');
      }
    },
  });
};

// Create or complete profile (handles both new profiles and completing existing skeleton profiles)
export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      walletAddress, 
      username, 
      bio,
      avatarUrl,
      hasBaseName,
      baseName,
    }: { 
      userId: string; 
      walletAddress: string;
      username: string;
      bio?: string;
      avatarUrl: string;
      hasBaseName?: boolean;
      baseName?: string;
    }) => {
      // First, check if profile already exists (skeleton from wallet-auth)
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .maybeSingle();

      if (existing && existing.username) {
        // Profile already has a username - this shouldn't happen in normal flow
        throw new Error('Profile already exists with a username.');
      }

      const profileData = {
        username,
        bio: bio || null,
        avatar_url: avatarUrl,
        avatar_last_updated_at: new Date().toISOString(),
        has_base_name: hasBaseName || false,
        base_name: baseName || null,
      };

      if (existing) {
        // Profile exists but incomplete - update it
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', userId);

        if (error) {
          if (error.code === '23505' && error.message.includes('username')) {
            throw new Error('Username is already taken. Please choose a different one.');
          }
          throw error;
        }
      } else {
        // No profile exists - insert new one
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            wallet_address: walletAddress,
            ...profileData,
          });

        if (error) {
          if (error.code === '23505') {
            if (error.message.includes('username')) {
              throw new Error('Username is already taken. Please choose a different one.');
            }
            if (error.message.includes('wallet_address')) {
              throw new Error('A profile already exists for this wallet.');
            }
          }
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile created!');
    },
    onError: (error: Error) => {
      console.error('Profile creation error:', error);
      toast.error(error.message || 'Failed to create profile');
    },
  });
};

// Request streamer role (uses RPC to grant role securely)
export const useRequestStreamerRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('grant_streamer_role', { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      toast.success('You are now a streamer!');
    },
    onError: (error) => {
      console.error('Request streamer error:', error);
      toast.error('Failed to update status');
    },
  });
};

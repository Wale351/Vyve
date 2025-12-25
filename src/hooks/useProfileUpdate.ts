import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateProfileData {
  bio?: string;
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated!');
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    },
  });
};

export const useAvatarUpload = () => {
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
      const fileName = `${userId}/avatar.${fileExt}`;

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

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithCacheBuster })
        .eq('id', userId);

      if (updateError) throw updateError;

      return urlWithCacheBuster;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar updated!');
    },
    onError: (error: Error) => {
      console.error('Avatar upload error:', error);
      if (error.message.includes('30 days')) {
        toast.error(error.message);
      } else {
        toast.error(error.message || 'Failed to upload avatar');
      }
    },
  });
};

// Create initial profile
export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      walletAddress, 
      username, 
      bio,
      avatarUrl 
    }: { 
      userId: string; 
      walletAddress: string;
      username: string;
      bio?: string;
      avatarUrl: string;
    }) => {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          wallet_address: walletAddress,
          username,
          bio: bio || null,
          avatar_url: avatarUrl,
          avatar_last_updated_at: new Date().toISOString(),
        });

      if (error) {
        // Handle specific error cases
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

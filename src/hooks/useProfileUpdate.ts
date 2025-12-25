import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateProfileData {
  display_name?: string | null;
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
        .update({ profile_image_url: urlWithCacheBuster })
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

// Create initial profile
export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      walletAddress, 
      username, 
      bio,
      profileImageUrl 
    }: { 
      userId: string; 
      walletAddress: string;
      username: string;
      bio?: string;
      profileImageUrl: string;
    }) => {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          wallet_address: walletAddress,
          username,
          bio: bio || null,
          profile_image_url: profileImageUrl,
          last_profile_image_update: new Date().toISOString(),
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

// Request streamer status
export const useRequestStreamerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // For now, just update to streamer role directly
      // In production, this might set a pending status for admin approval
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'streamer' })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('You are now a streamer!');
    },
    onError: (error) => {
      console.error('Request streamer error:', error);
      toast.error('Failed to update status');
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VerificationRequest {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  status: string;
  submitted_at: string;
  document_count: number;
}

export const usePendingVerifications = () => {
  return useQuery({
    queryKey: ['pending-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_pending_verifications');
      if (error) throw error;
      return (data || []) as VerificationRequest[];
    },
  });
};

export const useVerificationDocuments = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['verification-documents', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useReviewVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      notes, 
      rejectionReason 
    }: { 
      requestId: string; 
      status: string; 
      notes?: string; 
      rejectionReason?: string;
    }) => {
      const { error } = await supabase.rpc('admin_review_verification', {
        p_request_id: requestId,
        p_status: status,
        p_notes: notes || null,
        p_rejection_reason: rejectionReason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-search-users'] });
      toast.success('Verification updated');
    },
    onError: (error) => {
      console.error('Review verification error:', error);
      toast.error('Failed to update verification');
    },
  });
};

export const useGetSignedUrl = () => {
  return useMutation({
    mutationFn: async (path: string) => {
      const { data, error } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(path, 300); // 5 min expiry
      if (error) throw error;
      return data.signedUrl;
    },
  });
};

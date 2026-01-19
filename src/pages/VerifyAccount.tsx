import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ShieldCheck, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UploadedDoc {
  type: string;
  file: File;
  preview?: string;
}

const VerifyAccount = () => {
  const { user, isAuthenticated } = useWalletAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [currentDocType, setCurrentDocType] = useState('government_id');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has an existing verification request
  const { data: existingRequest, isLoading: requestLoading } = useQuery({
    queryKey: ['my-verification-request', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Check if user is already verified
  const { data: profile } = useQuery({
    queryKey: ['my-profile-verified', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('verified_creator')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image or PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    // Check if this doc type already exists
    if (documents.some(d => d.type === currentDocType)) {
      toast.error('You already added a document of this type');
      return;
    }

    const preview = file.type.startsWith('image/') 
      ? URL.createObjectURL(file) 
      : undefined;

    setDocuments([...documents, { type: currentDocType, file, preview }]);
    toast.success('Document added');
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (index: number) => {
    const newDocs = [...documents];
    if (newDocs[index].preview) {
      URL.revokeObjectURL(newDocs[index].preview!);
    }
    newDocs.splice(index, 1);
    setDocuments(newDocs);
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    if (documents.length === 0) {
      toast.error('Please add at least one document');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create verification request
      const { data: request, error: reqError } = await supabase
        .from('verification_requests')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (reqError) throw reqError;

      // Upload documents
      for (const doc of documents) {
        const ext = doc.file.name.split('.').pop();
        const path = `${user.id}/${request.id}/${doc.type}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('verification-documents')
          .upload(path, doc.file);

        if (uploadError) throw uploadError;

        // Create document record
        const { error: docError } = await supabase
          .from('verification_documents')
          .insert({
            user_id: user.id,
            document_type: doc.type,
            document_url: path,
          });

        if (docError) throw docError;
      }

      queryClient.invalidateQueries({ queryKey: ['my-verification-request'] });
      toast.success('Verification request submitted!');
      setDocuments([]);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit verification request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requestLoading) {
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

  // Already verified
  if (profile?.verified_creator) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12 md:py-20 flex items-center justify-center">
          <div className="glass-card max-w-md p-8 md:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-3">Already Verified</h1>
            <p className="text-muted-foreground">
              Your account is verified. You have the verified creator badge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Existing pending request
  if (existingRequest?.status === 'pending') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12 md:py-20 flex items-center justify-center">
          <div className="glass-card max-w-md p-8 md:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-3">Verification Pending</h1>
            <p className="text-muted-foreground mb-4">
              Your verification request is being reviewed. This usually takes 1-3 business days.
            </p>
            <p className="text-xs text-muted-foreground">
              Submitted {new Date(existingRequest.submitted_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Rejected request
  if (existingRequest?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12 md:py-20 flex items-center justify-center">
          <div className="glass-card max-w-md p-8 md:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-3">Verification Rejected</h1>
            <p className="text-muted-foreground mb-4">
              {existingRequest.rejection_reason || 'Your verification request was not approved.'}
            </p>
            <Button 
              variant="premium"
              onClick={() => queryClient.setQueryData(['my-verification-request', user?.id], null)}
            >
              Submit New Request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const docTypeLabels: Record<string, string> = {
    government_id: 'Government ID',
    selfie: 'Selfie with ID',
    proof_of_address: 'Proof of Address',
    social_media: 'Social Media Verification',
  };

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      <div className="h-14 md:h-16" />

      <div className="container px-4 py-8 md:py-12">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Get Verified
            </h1>
            <p className="text-muted-foreground">
              Submit documents to verify your identity
            </p>
          </div>

          <div className="glass-card p-6 md:p-8 space-y-6">
            {/* Info */}
            <div className="bg-muted/30 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Required documents:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Government-issued ID (passport, driver's license)</li>
                  <li>Selfie holding your ID</li>
                </ul>
              </div>
            </div>

            {/* Document selector */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={currentDocType} onValueChange={setCurrentDocType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government_id">Government ID</SelectItem>
                    <SelectItem value="selfie">Selfie with ID</SelectItem>
                    <SelectItem value="proof_of_address">Proof of Address</SelectItem>
                    <SelectItem value="social_media">Social Media Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={documents.some(d => d.type === currentDocType)}
                >
                  <Upload className="h-4 w-4" />
                  Upload {docTypeLabels[currentDocType]}
                </Button>
              </div>
            </div>

            {/* Uploaded documents */}
            {documents.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Documents</Label>
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                      {doc.preview ? (
                        <img src={doc.preview} alt="" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{docTypeLabels[doc.type]}</p>
                        <p className="text-xs text-muted-foreground truncate">{doc.file.name}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeDocument(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              variant="premium"
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || documents.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Submit Verification Request
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;


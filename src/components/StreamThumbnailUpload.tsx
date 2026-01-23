import * as React from 'react';
import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StreamThumbnailUploadProps {
  userId: string;
  value: string | null;
  onChange: (url: string | null) => void;
}

const StreamThumbnailUpload = ({ userId, value, onChange }: StreamThumbnailUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, WebP, or GIF image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload to Supabase
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('stream-thumbnails')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('stream-thumbnails')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success('Thumbnail uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload thumbnail');
      setPreview(value);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        id="thumbnail-upload"
      />

      {preview ? (
        <div className="relative group">
          <div className="aspect-video rounded-xl overflow-hidden bg-muted/30 border border-border/50">
            <img
              src={preview}
              alt="Stream thumbnail preview"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="thumbnail-upload"
          className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border/50 bg-muted/20 cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <>
              <div className="p-3 rounded-full bg-muted/50 mb-3">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Upload thumbnail
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                JPG, PNG, WebP or GIF (max 5MB)
              </p>
            </>
          )}
        </label>
      )}

      <p className="text-xs text-muted-foreground">
        Recommended: 16:9 aspect ratio (1280×720 or higher)
      </p>
    </div>
  );
};

export default StreamThumbnailUpload;

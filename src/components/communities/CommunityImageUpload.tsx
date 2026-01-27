import * as React from 'react';
import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommunityImageUploadProps {
  userId: string;
  value: string | null;
  onChange: (url: string | null) => void;
  type: 'banner' | 'avatar';
  disabled?: boolean;
}

const CommunityImageUpload = ({ 
  userId, 
  value, 
  onChange, 
  type,
  disabled = false 
}: CommunityImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `community-${type}-upload`;

  const isBanner = type === 'banner';
  const aspectClass = isBanner ? 'aspect-[3/1]' : 'aspect-square';
  const sizeHint = isBanner ? '1500×500 recommended' : '400×400 recommended';

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
      const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('community-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('community-images')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success(`${isBanner ? 'Banner' : 'Avatar'} uploaded!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${isBanner ? 'banner' : 'avatar'}`);
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

  // Sync preview with value prop
  React.useEffect(() => {
    setPreview(value);
  }, [value]);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        id={inputId}
        disabled={disabled || isUploading}
      />

      {preview ? (
        <div className="relative group">
          <div className={cn(
            "rounded-xl overflow-hidden bg-muted/30 border border-border/50",
            aspectClass,
            isBanner ? 'w-full' : 'w-32'
          )}>
            <img
              src={preview}
              alt={`Community ${type} preview`}
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          {!disabled && (
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
          )}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-colors",
            aspectClass,
            isBanner ? 'w-full' : 'w-32',
            (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <>
              <div className={cn(
                "rounded-full bg-muted/50 mb-2",
                isBanner ? 'p-3' : 'p-2'
              )}>
                {isBanner ? (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Upload className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className={cn(
                "font-medium text-muted-foreground",
                isBanner ? 'text-sm' : 'text-xs'
              )}>
                {isBanner ? 'Upload banner' : 'Upload'}
              </p>
            </>
          )}
        </label>
      )}

      <p className="text-xs text-muted-foreground">
        {sizeHint}
      </p>
    </div>
  );
};

export default CommunityImageUpload;

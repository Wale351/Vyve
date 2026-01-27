import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Scissors, Loader2 } from 'lucide-react';
import { useCreateClip } from '@/hooks/useClips';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { toast } from 'sonner';

interface ClipButtonProps {
  streamId: string;
  playbackId?: string;
  currentTime?: number;
  isLive?: boolean;
}

export default function ClipButton({ streamId, playbackId, currentTime = 0, isLive }: ClipButtonProps) {
  const { user, isAuthenticated } = useWalletAuth();
  const createClip = useCreateClip();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);

  const handleCreateClip = async () => {
    if (!user?.id) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a clip title');
      return;
    }

    // Calculate start time (go back 'duration' seconds from current time)
    const startTime = Math.max(0, currentTime - duration);

    await createClip.mutateAsync({
      streamId,
      userId: user.id,
      title: title.trim(),
      startTime,
      duration,
      playbackId,
    });

    setOpen(false);
    setTitle('');
    setDuration(30);
  };

  // Show button for all users but disabled if not authenticated
  const isDisabled = !isAuthenticated || !isLive;

  const getTitle = () => {
    if (!isAuthenticated) return 'Connect wallet to create clips';
    if (!isLive) return 'Clips available when stream is live';
    return 'Create clip';
  };

  return (
    <>
      <Button
        variant="subtle"
        size="sm"
        onClick={() => {
          if (!isAuthenticated) {
            toast.error('Please connect your wallet to create clips');
            return;
          }
          setOpen(true);
        }}
        className="gap-1.5"
        disabled={isDisabled}
        title={getTitle()}
      >
        <Scissors className="h-4 w-4" />
        <span className="hidden sm:inline">Clip</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />
              Create Clip
            </DialogTitle>
            <DialogDescription>
              Capture the last {duration} seconds of this stream
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clip-title">Clip Title</Label>
              <Input
                id="clip-title"
                placeholder="Epic moment!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Duration</Label>
                <span className="text-sm text-muted-foreground">{duration}s</span>
              </div>
              <Slider
                value={[duration]}
                onValueChange={(v) => setDuration(v[0])}
                min={15}
                max={60}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Clips the last {duration} seconds from the current playback position
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateClip}
              disabled={createClip.isPending || !title.trim()}
            >
              {createClip.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Clip'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

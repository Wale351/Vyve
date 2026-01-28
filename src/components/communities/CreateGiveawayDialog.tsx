import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateGiveaway } from '@/hooks/useCommunityGiveaways';

interface CreateGiveawayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
}

const CreateGiveawayDialog = ({ open, onOpenChange, communityId }: CreateGiveawayDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prizeAmount, setPrizeAmount] = useState('');
  const [prizeType, setPrizeType] = useState('ETH');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');
  const createGiveaway = useCreateGiveaway();

  const handleSubmit = () => {
    if (!title.trim()) return;

    createGiveaway.mutate(
      {
        communityId,
        title: title.trim(),
        description: description.trim() || undefined,
        prizeAmount: prizeAmount ? parseFloat(prizeAmount) : undefined,
        prizeType: prizeType || undefined,
        endsAt: hasEndDate && endDate ? new Date(endDate) : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrizeAmount('');
    setPrizeType('ETH');
    setHasEndDate(false);
    setEndDate('');
  };

  const canSubmit = title.trim().length >= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Giveaway</DialogTitle>
          <DialogDescription>
            Create a giveaway for your community members to enter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Giveaway Title *</Label>
            <Input
              id="title"
              placeholder="e.g., 1 ETH Giveaway!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the giveaway and any rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-muted/50 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prizeAmount">Prize Amount</Label>
              <Input
                id="prizeAmount"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.1"
                value={prizeAmount}
                onChange={(e) => setPrizeAmount(e.target.value)}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prizeType">Prize Type</Label>
              <Select value={prizeType} onValueChange={setPrizeType}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="NFT">NFT</SelectItem>
                  <SelectItem value="TOKEN">Token</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="has-end-date">Set end date</Label>
              <Switch
                id="has-end-date"
                checked={hasEndDate}
                onCheckedChange={setHasEndDate}
              />
            </div>
            {hasEndDate && (
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="bg-muted/50"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createGiveaway.isPending}
          >
            {createGiveaway.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Giveaway'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGiveawayDialog;

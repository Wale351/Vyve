import { useState } from 'react';
import { Loader2, Gift, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { cn } from '@/lib/utils';

interface CreateGiveawayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
}

type GiveawayType = 'raffle' | 'action';
type PrizeType = 'eth' | 'nft' | 'other';

const CreateGiveawayDialog = ({ open, onOpenChange, communityId }: CreateGiveawayDialogProps) => {
  const [giveawayType, setGiveawayType] = useState<GiveawayType>('raffle');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prizeAmount, setPrizeAmount] = useState('');
  const [prizeType, setPrizeType] = useState<PrizeType>('eth');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');
  
  // Action-specific fields
  const [actionDescription, setActionDescription] = useState('');
  const [actionLink, setActionLink] = useState('');
  
  const createGiveaway = useCreateGiveaway();

  const handleSubmit = () => {
    if (!title.trim()) return;

    const fullDescription = giveawayType === 'action' && actionDescription
      ? `${description.trim()}\n\n**Action Required:** ${actionDescription}${actionLink ? `\n🔗 ${actionLink}` : ''}`
      : description.trim();

    createGiveaway.mutate(
      {
        communityId,
        title: title.trim(),
        description: fullDescription || undefined,
        prizeAmount: prizeAmount ? parseFloat(prizeAmount) : undefined,
        prizeType: prizeType,
        endsAt: hasEndDate && endDate ? new Date(endDate) : undefined,
        giveawayType,
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
    setGiveawayType('raffle');
    setTitle('');
    setDescription('');
    setPrizeAmount('');
    setPrizeType('eth');
    setHasEndDate(false);
    setEndDate('');
    setActionDescription('');
    setActionLink('');
  };

  const canSubmit = title.trim().length >= 3 && (giveawayType === 'raffle' || actionDescription.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Create Giveaway
          </DialogTitle>
          <DialogDescription>
            Choose a giveaway type and configure the details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Giveaway Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Giveaway Type</Label>
            <RadioGroup
              value={giveawayType}
              onValueChange={(v) => setGiveawayType(v as GiveawayType)}
              className="grid grid-cols-2 gap-3"
            >
              <label
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  giveawayType === 'raffle'
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value="raffle" className="sr-only" />
                <Gift className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <p className="font-medium text-sm">Raffle</p>
                  <p className="text-xs text-muted-foreground">Random winner selection</p>
                </div>
              </label>
              
              <label
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  giveawayType === 'action'
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value="action" className="sr-only" />
                <CheckCircle className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <p className="font-medium text-sm">Action</p>
                  <p className="text-xs text-muted-foreground">Complete task to enter</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Giveaway Title *</Label>
            <Input
              id="title"
              placeholder={giveawayType === 'raffle' ? "e.g., Weekly ETH Raffle!" : "e.g., Follow & Win NFT!"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the giveaway and any rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-muted/50 min-h-[70px]"
            />
          </div>

          {/* Action-specific fields */}
          {giveawayType === 'action' && (
            <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="actionDescription">Action Required *</Label>
                <Textarea
                  id="actionDescription"
                  placeholder="e.g., Follow @vyve on Twitter and retweet the pinned post"
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                  className="bg-background min-h-[60px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="actionLink">Action Link (optional)</Label>
                <Input
                  id="actionLink"
                  placeholder="https://twitter.com/..."
                  value={actionLink}
                  onChange={(e) => setActionLink(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
          )}

          {/* Prize Details */}
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
              <Select value={prizeType} onValueChange={(v) => setPrizeType(v as PrizeType)}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eth">ETH</SelectItem>
                  <SelectItem value="nft">NFT</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* End Date Toggle */}
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

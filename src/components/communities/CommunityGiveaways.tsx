import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Gift, Clock, Users, Plus, Loader2, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommunityGiveaways, useEnterGiveaway, type Giveaway } from '@/hooks/useCommunityGiveaways';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import CreateGiveawayDialog from './CreateGiveawayDialog';
import { cn } from '@/lib/utils';

interface CommunityGiveawaysProps {
  communityId: string;
  isOwner: boolean;
}

interface GiveawayCardProps {
  giveaway: Giveaway;
  communityId: string;
  isAuthenticated: boolean;
}

const GiveawayCard = ({ giveaway, communityId, isAuthenticated }: GiveawayCardProps) => {
  const enterMutation = useEnterGiveaway();
  const isEnded = giveaway.endsAt ? new Date(giveaway.endsAt) < new Date() : false;
  const canEnter = isAuthenticated && !isEnded && !giveaway.hasEntered && giveaway.isActive;

  const handleEnter = () => {
    if (!canEnter) return;
    enterMutation.mutate({ giveawayId: giveaway.id, communityId });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{giveaway.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {giveaway.entries} {giveaway.entries === 1 ? 'entry' : 'entries'}
              </p>
            </div>
          </div>
          {giveaway.prizeAmount && giveaway.prizeType && (
            <Badge variant={giveaway.isActive ? "default" : "secondary"}>
              {giveaway.prizeAmount} {giveaway.prizeType}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {giveaway.description && (
          <p className="text-sm text-muted-foreground">{giveaway.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {isEnded 
                ? 'Ended' 
                : giveaway.endsAt
                  ? `Ends ${formatDistanceToNow(new Date(giveaway.endsAt), { addSuffix: true })}`
                  : 'No end date'}
            </span>
          </div>
          
          {!isEnded && giveaway.isActive && (
            <Button 
              size="sm" 
              disabled={!canEnter || enterMutation.isPending}
              onClick={handleEnter}
              className={cn(giveaway.hasEntered && "bg-green-600 hover:bg-green-600")}
            >
              {enterMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : giveaway.hasEntered ? (
                <>
                  <Trophy className="h-4 w-4 mr-1" />
                  Entered
                </>
              ) : (
                'Enter Giveaway'
              )}
            </Button>
          )}

          {isEnded && giveaway.winnerId && (
            <Badge variant="secondary" className="gap-1">
              <Trophy className="h-3 w-3" />
              Winner Selected
            </Badge>
          )}
        </div>
        
        {!isAuthenticated && !isEnded && giveaway.isActive && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Connect wallet to enter
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const GiveawaysSkeleton = () => (
  <div className="space-y-4">
    {[1, 2].map((i) => (
      <Card key={i} className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const CommunityGiveaways = ({ communityId, isOwner }: CommunityGiveawaysProps) => {
  const { data: giveaways, isLoading } = useCommunityGiveaways(communityId);
  const { isAuthenticated } = useWalletAuth();
  const [createGiveawayOpen, setCreateGiveawayOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Giveaways
        </h3>
        {isOwner && (
          <Button variant="outline" size="sm" onClick={() => setCreateGiveawayOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Create Giveaway
          </Button>
        )}
      </div>

      {isLoading ? (
        <GiveawaysSkeleton />
      ) : giveaways && giveaways.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {giveaways.map((giveaway, index) => (
              <motion.div
                key={giveaway.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <GiveawayCard
                  giveaway={giveaway}
                  communityId={communityId}
                  isAuthenticated={isAuthenticated}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No giveaways yet</p>
          {isOwner && (
            <Button
              variant="link"
              className="mt-2"
              onClick={() => setCreateGiveawayOpen(true)}
            >
              Create the first giveaway
            </Button>
          )}
        </div>
      )}

      {/* Create Giveaway Dialog */}
      <CreateGiveawayDialog
        open={createGiveawayOpen}
        onOpenChange={setCreateGiveawayOpen}
        communityId={communityId}
      />
    </div>
  );
};

export default CommunityGiveaways;

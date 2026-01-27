import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { BarChart3, Gift, Clock, CheckCircle2, Users, Plus, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCommunityPolls, useVoteOnPoll, type Poll } from '@/hooks/useCommunityPolls';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import CreatePollDialog from './CreatePollDialog';
import CommunityGiveaways from './CommunityGiveaways';

interface CommunityPollsProps {
  communityId: string;
  isOwner: boolean;
}

interface PollCardProps {
  poll: Poll;
  communityId: string;
  isAuthenticated: boolean;
}

const PollCard = ({ poll, communityId, isAuthenticated }: PollCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(poll.userVotedIndex);
  const voteMutation = useVoteOnPoll();
  const isEnded = poll.endsAt ? new Date(poll.endsAt) < new Date() : false;
  const hasVoted = poll.userVotedIndex !== null;
  const canVote = isAuthenticated && !isEnded && !hasVoted && poll.isActive;

  const handleVote = (index: number) => {
    if (!canVote) return;
    setSelectedOption(index);
    voteMutation.mutate({ 
      pollId: poll.id, 
      optionIndex: index,
      communityId 
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base">{poll.question}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}</span>
              <span>•</span>
              {isEnded ? (
                <span className="text-destructive">Ended</span>
              ) : poll.endsAt ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Ends {formatDistanceToNow(new Date(poll.endsAt), { addSuffix: true })}
                </span>
              ) : (
                <span className="text-primary">Open</span>
              )}
            </div>
          </div>
          <Badge variant={isEnded ? "secondary" : poll.isActive ? "default" : "secondary"}>
            {isEnded ? 'Closed' : poll.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {poll.options.map((option, index) => {
          const percentage = poll.totalVotes > 0 
            ? Math.round((option.votes / poll.totalVotes) * 100) 
            : 0;
          const isSelected = selectedOption === index || poll.userVotedIndex === index;
          const maxVotes = Math.max(...poll.options.map(o => o.votes));
          const isWinner = isEnded && option.votes === maxVotes && maxVotes > 0;
          const isVoting = voteMutation.isPending && selectedOption === index;

          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={!canVote || voteMutation.isPending}
              className={cn(
                "relative w-full p-3 rounded-lg text-left transition-all",
                "border border-border/50",
                canVote && "hover:border-primary/50 hover:bg-muted/30 cursor-pointer",
                isSelected && "border-primary bg-primary/5",
                isWinner && "border-accent bg-accent/5",
                (!canVote || voteMutation.isPending) && "cursor-default"
              )}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  {isVoting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : isSelected ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : null}
                  <span className={cn("text-sm", isSelected && "font-medium")}>{option.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">{percentage}%</span>
              </div>
              {(hasVoted || isEnded) && (
                <div 
                  className={cn(
                    "absolute inset-0 rounded-lg opacity-20 transition-all",
                    isWinner ? "bg-accent" : "bg-primary"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              )}
            </button>
          );
        })}
        
        {!isAuthenticated && !isEnded && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Connect wallet to vote
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const PollsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2].map((i) => (
      <Card key={i} className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((j) => (
            <Skeleton key={j} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    ))}
  </div>
);

const CommunityPolls = ({ communityId, isOwner }: CommunityPollsProps) => {
  const { data: polls, isLoading } = useCommunityPolls(communityId);
  const { isAuthenticated } = useWalletAuth();
  const [createPollOpen, setCreatePollOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Polls Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Polls
          </h3>
          {isOwner && (
            <Button variant="outline" size="sm" onClick={() => setCreatePollOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create Poll
            </Button>
          )}
        </div>

        {isLoading ? (
          <PollsSkeleton />
        ) : polls && polls.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {polls.map((poll, index) => (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <PollCard 
                    poll={poll} 
                    communityId={communityId}
                    isAuthenticated={isAuthenticated}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No polls yet</p>
            {isOwner && (
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => setCreatePollOpen(true)}
              >
                Create the first poll
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Giveaways Section */}
      <CommunityGiveaways communityId={communityId} isOwner={isOwner} />

      {/* Create Poll Dialog */}
      <CreatePollDialog
        open={createPollOpen}
        onOpenChange={setCreatePollOpen}
        communityId={communityId}
      />
    </div>
  );
};

export default CommunityPolls;

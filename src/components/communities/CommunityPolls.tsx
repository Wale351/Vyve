import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { BarChart3, Gift, Clock, CheckCircle2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CommunityPollsProps {
  communityId: string;
  isOwner: boolean;
}

// Mock data - would be replaced with real data from hooks
const mockPolls = [
  {
    id: '1',
    question: 'What game should I stream next?',
    options: [
      { label: 'Valorant', votes: 45 },
      { label: 'League of Legends', votes: 32 },
      { label: 'Minecraft', votes: 28 },
      { label: 'Fortnite', votes: 15 },
    ],
    totalVotes: 120,
    endsAt: new Date(Date.now() + 86400000).toISOString(),
    isActive: true,
    userVoted: 0,
  },
  {
    id: '2',
    question: 'Best streaming time for weekends?',
    options: [
      { label: 'Morning (9am - 12pm)', votes: 22 },
      { label: 'Afternoon (2pm - 5pm)', votes: 48 },
      { label: 'Evening (7pm - 10pm)', votes: 65 },
      { label: 'Late night (11pm+)', votes: 18 },
    ],
    totalVotes: 153,
    endsAt: new Date(Date.now() - 86400000).toISOString(),
    isActive: false,
    userVoted: 2,
  },
];

const mockGiveaways = [
  {
    id: '1',
    title: 'Monthly ETH Giveaway',
    description: 'Win 0.1 ETH! Enter by being an active community member.',
    prizeType: 'eth',
    prizeAmount: 0.1,
    entries: 89,
    endsAt: new Date(Date.now() + 172800000).toISOString(),
    isActive: true,
    hasEntered: false,
  },
];

const PollCard = ({ poll }: { poll: typeof mockPolls[0] }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(poll.userVoted);
  const isEnded = new Date(poll.endsAt) < new Date();
  const hasVoted = poll.userVoted !== undefined && poll.userVoted !== null;

  const handleVote = (index: number) => {
    if (isEnded || hasVoted) return;
    setSelectedOption(index);
    // Would call mutation here
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{poll.question}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{poll.totalVotes} votes</span>
              <span>•</span>
              {isEnded ? (
                <span className="text-yellow-500">Ended</span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Ends {formatDistanceToNow(new Date(poll.endsAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <Badge variant={isEnded ? "secondary" : "default"}>
            {isEnded ? 'Closed' : 'Active'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {poll.options.map((option, index) => {
          const percentage = poll.totalVotes > 0 
            ? Math.round((option.votes / poll.totalVotes) * 100) 
            : 0;
          const isSelected = selectedOption === index;
          const isWinner = isEnded && percentage === Math.max(...poll.options.map(o => Math.round((o.votes / poll.totalVotes) * 100)));

          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={isEnded || hasVoted}
              className={cn(
                "relative w-full p-3 rounded-lg text-left transition-all",
                "border border-border/50 hover:border-primary/30",
                isSelected && "border-primary bg-primary/5",
                isWinner && "border-green-500/50 bg-green-500/5",
                (isEnded || hasVoted) && "cursor-default"
              )}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  <span className={cn("text-sm", isSelected && "font-medium")}>{option.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">{percentage}%</span>
              </div>
              <Progress 
                value={percentage} 
                className={cn(
                  "absolute inset-0 h-full rounded-lg opacity-20",
                  isWinner && "[&>div]:bg-green-500"
                )}
              />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};

const GiveawayCard = ({ giveaway }: { giveaway: typeof mockGiveaways[0] }) => {
  const isEnded = new Date(giveaway.endsAt) < new Date();

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{giveaway.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {giveaway.entries} entries
              </p>
            </div>
          </div>
          <Badge variant={giveaway.isActive ? "default" : "secondary"}>
            {giveaway.prizeAmount} ETH
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{giveaway.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {isEnded 
                ? 'Ended' 
                : `Ends ${formatDistanceToNow(new Date(giveaway.endsAt), { addSuffix: true })}`}
            </span>
          </div>
          
          {!isEnded && (
            <Button size="sm" disabled={giveaway.hasEntered}>
              {giveaway.hasEntered ? 'Entered' : 'Enter Giveaway'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CommunityPolls = ({ communityId, isOwner }: CommunityPollsProps) => {
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
            <Button variant="outline" size="sm">
              Create Poll
            </Button>
          )}
        </div>

        {mockPolls.length > 0 ? (
          <div className="space-y-4">
            {mockPolls.map((poll, index) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PollCard poll={poll} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No polls yet
          </div>
        )}
      </div>

      {/* Giveaways Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Giveaways
          </h3>
          {isOwner && (
            <Button variant="outline" size="sm">
              Create Giveaway
            </Button>
          )}
        </div>

        {mockGiveaways.length > 0 ? (
          <div className="space-y-4">
            {mockGiveaways.map((giveaway, index) => (
              <motion.div
                key={giveaway.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GiveawayCard giveaway={giveaway} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No giveaways yet
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPolls;

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Gift, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CommunityGiveawaysProps {
  communityId: string;
  isOwner: boolean;
}

// Placeholder for future giveaway implementation
const CommunityGiveaways = ({ communityId, isOwner }: CommunityGiveawaysProps) => {
  // TODO: Implement useCommunityGiveaways hook with real data
  const giveaways: Array<{
    id: string;
    title: string;
    description: string;
    prizeAmount: number;
    entries: number;
    endsAt: string;
    isActive: boolean;
    hasEntered: boolean;
  }> = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Giveaways
        </h3>
        {isOwner && (
          <Button variant="outline" size="sm" disabled>
            Create Giveaway
          </Button>
        )}
      </div>

      {giveaways.length > 0 ? (
        <div className="space-y-4">
          {giveaways.map((giveaway, index) => {
            const isEnded = new Date(giveaway.endsAt) < new Date();

            return (
              <motion.div
                key={giveaway.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
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
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
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
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No giveaways yet</p>
        </div>
      )}
    </div>
  );
};

export default CommunityGiveaways;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock, Bell, Radio, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStreamerSchedule, useCancelScheduledStream } from '@/hooks/useScheduledStreams';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import ScheduleStreamModal from '@/components/ScheduleStreamModal';

interface CommunityScheduleProps {
  communityId: string;
  ownerId: string;
}

const CommunitySchedule = ({ communityId, ownerId }: CommunityScheduleProps) => {
  const { user } = useWalletAuth();
  const { data: scheduledStreams, isLoading } = useStreamerSchedule(ownerId);
  const cancelStream = useCancelScheduledStream();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const isOwner = user?.id === ownerId;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-32 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const upcomingStreams = scheduledStreams?.filter(
    (s) => !s.is_cancelled && new Date(s.scheduled_for) > new Date()
  ) || [];

  return (
    <div className="space-y-4">
      {/* Owner Controls */}
      {isOwner && (
        <div className="flex justify-end">
          <Button onClick={() => setScheduleModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Stream
          </Button>
        </div>
      )}

      {upcomingStreams.length > 0 ? (
        upcomingStreams.map((stream, index) => (
          <motion.div
            key={stream.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-32 rounded-lg overflow-hidden bg-muted shrink-0">
                    {stream.thumbnail_url ? (
                      <img 
                        src={stream.thumbnail_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : stream.games?.thumbnail_url ? (
                      <img 
                        src={stream.games.thumbnail_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Radio className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-1 left-1 text-[10px]">
                      Upcoming
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-semibold line-clamp-1">{stream.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(stream.scheduled_for), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{format(new Date(stream.scheduled_for), 'h:mm a')}</span>
                      </div>
                      {stream.games?.name && (
                        <Badge variant="secondary" className="text-xs">
                          {stream.games.name}
                        </Badge>
                      )}
                    </div>

                    {stream.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {stream.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="hidden sm:flex items-center gap-2">
                    {isOwner ? (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => cancelStream.mutate(stream.id)}
                        disabled={cancelStream.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Remind Me
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-medium mb-2">No upcoming streams</h3>
          <p className="text-sm text-muted-foreground">
            {isOwner 
              ? 'Schedule your next stream to let your community know!' 
              : 'The streamer hasn\'t scheduled any upcoming streams yet.'}
          </p>
          {isOwner && (
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => setScheduleModalOpen(true)}
            >
              Schedule a stream
            </Button>
          )}
        </div>
      )}

      {/* Schedule Stream Modal */}
      <ScheduleStreamModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
      />
    </div>
  );
};

export default CommunitySchedule;

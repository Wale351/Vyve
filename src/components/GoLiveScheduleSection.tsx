import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStreamerSchedule, useCancelScheduledStream } from '@/hooks/useScheduledStreams';
import ScheduleStreamModal from '@/components/ScheduleStreamModal';
import { toast } from 'sonner';

interface GoLiveScheduleSectionProps {
  userId: string;
}

export default function GoLiveScheduleSection({ userId }: GoLiveScheduleSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const { data: scheduledStreams = [], isLoading } = useStreamerSchedule(userId);
  const cancelStream = useCancelScheduledStream();

  const handleCancel = async (streamId: string) => {
    try {
      await cancelStream.mutateAsync(streamId);
      toast.success('Stream cancelled');
    } catch {
      toast.error('Failed to cancel stream');
    }
  };

  return (
    <div className="glass-card p-4 md:p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-base md:text-lg">Scheduled Streams</h3>
        </div>
        <Button 
          variant="subtle" 
          size="sm" 
          className="gap-1.5"
          onClick={() => setShowModal(true)}
        >
          <Plus className="h-4 w-4" />
          Schedule
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : scheduledStreams.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No upcoming streams scheduled</p>
          <p className="text-xs mt-1">Plan ahead and let viewers know when you'll be live</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledStreams.map((stream) => (
            <div
              key={stream.id}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-border/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{stream.title}</h4>
                  {stream.games && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {stream.games.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(stream.scheduled_for), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(stream.scheduled_for), 'h:mm a')}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => handleCancel(stream.id)}
                disabled={cancelStream.isPending}
              >
                {cancelStream.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      <ScheduleStreamModal open={showModal} onOpenChange={setShowModal} />
    </div>
  );
}

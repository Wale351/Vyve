import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useUpcomingStreams } from '@/hooks/useScheduledStreams';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format, differenceInSeconds } from 'date-fns';

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const update = () => {
      const diff = differenceInSeconds(targetDate, new Date());
      
      if (diff <= 0) {
        setTimeLeft('Starting soon');
        return;
      }
      
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };
    
    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [targetDate]);
  
  return <span className="font-mono text-xs text-primary">{timeLeft}</span>;
}

export default function UpcomingStreamsWidget() {
  const { data: streams, isLoading } = useUpcomingStreams(5);
  
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Upcoming</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!streams?.length) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Upcoming</h3>
        </div>
        <p className="text-xs text-muted-foreground text-center py-3">
          No scheduled streams
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-card rounded-xl border border-border/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Upcoming</h3>
        </div>
        <span className="text-xs text-muted-foreground">{streams.length} scheduled</span>
      </div>
      
      <div className="space-y-3">
        {streams.map(stream => (
          <div key={stream.id} className="group">
            <div className="flex items-start gap-3">
              <Link to={stream.profiles?.username ? `/profile/${stream.profiles.username}` : '#'}>
                <Avatar className="w-9 h-9 border border-border">
                  {stream.profiles?.avatar_url ? (
                    <AvatarImage src={stream.profiles.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {stream.profiles?.username?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {stream.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Link
                    to={stream.profiles?.username ? `/profile/${stream.profiles.username}` : '#'}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {stream.profiles?.username || 'Unknown'}
                  </Link>
                  {stream.games && (
                    <>
                      <span className="text-muted-foreground/50">·</span>
                      <Link
                        to={`/games/${stream.games.slug}`}
                        className="text-xs text-primary/70 hover:text-primary"
                      >
                        {stream.games.name}
                      </Link>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {format(new Date(stream.scheduled_for), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <Countdown targetDate={new Date(stream.scheduled_for)} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
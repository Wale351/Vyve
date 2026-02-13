import { Play, Radio, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StreamCard from '@/components/StreamCard';
import type { StreamWithProfile } from '@/hooks/useStreams';

interface LiveStreamsGridProps {
  streams: StreamWithProfile[];
  isLoading: boolean;
}

export default function LiveStreamsGrid({ streams, isLoading }: LiveStreamsGridProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-4">
        <Play className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Live Streams</h2>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">Loading...</p>
        </div>
      ) : streams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {streams.map((stream) => (
            <div key={stream.id}>
              <StreamCard stream={stream} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-lg border border-border/30 bg-card">
          <Play className="h-6 w-6 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-1">No Live Streams</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Be the first to go live.
          </p>
          <Link to="/go-live">
            <Button variant="default" size="sm" className="gap-2">
              <Radio className="h-3.5 w-3.5" />
              Start Streaming
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

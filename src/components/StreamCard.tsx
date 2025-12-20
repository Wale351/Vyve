import { Link } from 'react-router-dom';
import { Stream, formatViewerCount, formatDuration } from '@/lib/mockData';
import { Users, Clock } from 'lucide-react';

interface StreamCardProps {
  stream: Stream;
}

const StreamCard = ({ stream }: StreamCardProps) => {
  return (
    <Link
      to={`/watch/${stream.id}`}
      className="group block glass-card overflow-hidden glow-hover"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={stream.thumbnailUrl}
          alt={stream.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        
        {/* Live badge */}
        {stream.isLive && (
          <div className="absolute top-3 left-3 live-badge">
            Live
          </div>
        )}
        
        {/* Viewer count */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-background/70 backdrop-blur-sm rounded-md text-xs">
          <Users className="h-3 w-3 text-primary" />
          <span>{formatViewerCount(stream.viewerCount)}</span>
        </div>
        
        {/* Duration */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-background/70 backdrop-blur-sm rounded-md text-xs">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>{formatDuration(stream.startedAt)}</span>
        </div>
        
        {/* Game tag */}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-primary/20 border border-primary/30 rounded-md text-xs text-primary">
          {stream.game}
        </div>
      </div>
      
      {/* Info */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {stream.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {stream.streamerName}
        </p>
      </div>
    </Link>
  );
};

export default StreamCard;

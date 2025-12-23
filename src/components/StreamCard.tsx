import { Link } from 'react-router-dom';
import { StreamWithProfile } from '@/hooks/useStreams';
import { formatViewerCount, formatDuration, formatAddress } from '@/lib/mockData';
import { Users, Clock, Play } from 'lucide-react';
import { useState } from 'react';

interface StreamCardProps {
  stream: StreamWithProfile;
}

const StreamCard = ({ stream }: StreamCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const streamerName = stream.profiles?.username || 'Anonymous';
  const thumbnailUrl = `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80`;
  
  return (
    <Link
      to={`/watch/${stream.id}`}
      className="group block stream-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-t-2xl">
        <img
          src={thumbnailUrl}
          alt={stream.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        
        {/* Live badge */}
        {stream.is_live && (
          <div className="absolute top-3 left-3">
            <div className="live-badge flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse-subtle" />
              LIVE
            </div>
          </div>
        )}
        
        {/* Viewer count */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg text-xs font-medium">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{formatViewerCount(stream.viewer_count || 0)}</span>
        </div>
        
        {/* Play button on hover */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Play className="h-6 w-6 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
        
        {/* Bottom info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          {stream.game_category && (
            <div className="px-2.5 py-1 bg-primary/20 backdrop-blur-sm rounded-lg text-xs text-primary font-medium">
              {stream.game_category}
            </div>
          )}
          
          {stream.started_at && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-background/80 backdrop-blur-sm rounded-lg text-xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{formatDuration(new Date(stream.started_at))}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Info section */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Streamer avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-md">
              {streamerName.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
              {stream.title}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
              {streamerName}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StreamCard;

import { Link } from 'react-router-dom';
import { StreamWithProfile } from '@/hooks/useStreams';
import { formatViewerCount, formatDuration } from '@/lib/formatters';
import { Users, Clock, Play, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface StreamCardProps {
  stream: StreamWithProfile;
}

const StreamCard = ({ stream }: StreamCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const streamerName = stream.profiles?.username || 'Anonymous';
  const streamerAvatar = stream.profiles?.avatar_url;
  const isVerified = stream.profiles?.verified_creator;
  const thumbnailUrl = `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80`;
  
  return (
    <Link
      to={`/watch/${stream.id}`}
      className="group block stream-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail - 16:9 aspect ratio */}
      <div className="relative aspect-video overflow-hidden rounded-t-xl md:rounded-t-2xl">
        <img
          src={thumbnailUrl}
          alt={stream.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        
        {/* Live badge */}
        {stream.is_live && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3">
            <div className="live-badge flex items-center gap-1 text-[10px] md:text-xs px-2 py-0.5 md:px-2.5 md:py-1">
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-destructive-foreground animate-pulse-subtle" />
              LIVE
            </div>
          </div>
        )}
        
        {/* Viewer count */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 px-2 py-1 md:px-2.5 md:py-1.5 bg-background/80 backdrop-blur-sm rounded-md md:rounded-lg text-[10px] md:text-xs font-medium">
          <Users className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
          <span>{formatViewerCount(stream.viewer_count || 0)}</span>
        </div>
        
        {/* Play button on hover - hidden on touch devices */}
        <div 
          className={`absolute inset-0 hidden md:flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Play className="h-5 w-5 lg:h-6 lg:w-6 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
        
        {/* Bottom info */}
        <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3 flex items-center justify-between gap-2">
          {stream.game_category && (
            <div className="px-2 py-0.5 md:px-2.5 md:py-1 bg-primary/20 backdrop-blur-sm rounded-md md:rounded-lg text-[10px] md:text-xs text-primary font-medium truncate max-w-[50%]">
              {stream.game_category}
            </div>
          )}
          
          {stream.started_at && (
            <div className="flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 bg-background/80 backdrop-blur-sm rounded-md md:rounded-lg text-[10px] md:text-xs ml-auto">
              <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
              <span>{formatDuration(new Date(stream.started_at))}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Info section */}
      <div className="p-3 md:p-4">
        <div className="flex items-start gap-2.5 md:gap-3">
          {/* Streamer avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-primary/20">
              {streamerAvatar ? (
                <AvatarImage src={streamerAvatar} alt={streamerName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-secondary/80 text-primary-foreground font-semibold text-xs md:text-sm">
                  {streamerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-sm md:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
              {stream.title}
            </h3>
            <div className="mt-0.5 flex items-center gap-1">
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                {streamerName}
              </p>
              {isVerified && (
                <CheckCircle className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary flex-shrink-0" />
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StreamCard;

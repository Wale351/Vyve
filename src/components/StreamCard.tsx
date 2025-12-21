import { Link } from 'react-router-dom';
import { StreamWithProfile } from '@/hooks/useStreams';
import { formatViewerCount, formatDuration, formatAddress } from '@/lib/mockData';
import { Users, Clock, Play, Heart, Zap } from 'lucide-react';
import { useState } from 'react';

interface StreamCardProps {
  stream: StreamWithProfile;
}

const StreamCard = ({ stream }: StreamCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const streamerName = stream.profiles?.username || formatAddress(stream.profiles?.wallet_address || '');
  const thumbnailUrl = `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80`;
  
  return (
    <Link
      to={`/watch/${stream.id}`}
      className="group block gaming-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={stream.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Neon border glow on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 30px hsl(var(--neon-cyan) / 0.3)'
          }}
        />
        
        {/* Live badge with pulse animation */}
        {stream.is_live && (
          <div className="absolute top-3 left-3">
            <div className="relative">
              <div className="live-badge flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-foreground opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive-foreground"></span>
                </span>
                LIVE
              </div>
            </div>
          </div>
        )}
        
        {/* Viewer count with glow */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-background/80 backdrop-blur-md rounded-lg text-xs border border-border/30">
          <Users className="h-3 w-3 text-primary" />
          <span className="font-medium">{formatViewerCount(stream.viewer_count || 0)}</span>
        </div>
        
        {/* Quick actions on hover */}
        <div 
          className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button 
            className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center text-primary-foreground transform transition-all duration-300 hover:scale-110"
            style={{ boxShadow: '0 0 30px hsl(var(--primary) / 0.5)' }}
            onClick={(e) => e.preventDefault()}
          >
            <Play className="h-6 w-6 ml-1" fill="currentColor" />
          </button>
        </div>
        
        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
          {/* Game tag */}
          {stream.game_category && (
            <div className="px-2.5 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-lg text-xs text-primary font-medium flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              {stream.game_category}
            </div>
          )}
          
          {/* Duration */}
          {stream.started_at && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-background/80 backdrop-blur-md rounded-lg text-xs border border-border/30">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{formatDuration(new Date(stream.started_at))}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Info section */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Streamer avatar with glow */}
          <div className="relative flex-shrink-0">
            <div className="glow-avatar connected">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {streamerName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
              {stream.title}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
              {streamerName}
            </p>
          </div>
          
          {/* Like button */}
          <button 
            className="flex-shrink-0 p-2 rounded-lg hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="h-4 w-4 text-muted-foreground hover:text-secondary transition-colors" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default StreamCard;
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StreamWithProfile } from '@/hooks/useStreams';
import { formatViewerCount, formatDuration } from '@/lib/formatters';
import { Users, Clock, CheckCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface StreamCardProps {
  stream: StreamWithProfile;
}

const StreamCard = ({ stream }: StreamCardProps) => {
  const streamerName = stream.profiles?.username || 'Streamer';
  const streamerUsername = stream.profiles?.username;
  const streamerAvatar = stream.profiles?.avatar_url;
  const isVerified = stream.profiles?.verified_creator;
  
  const thumbnailUrl = stream.thumbnail_url || 
    stream.games?.thumbnail_url || 
    `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80`;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/watch/${stream.id}`}
        className="group block rounded-lg overflow-hidden border border-border/30 bg-card hover:border-border transition-colors"
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {stream.is_live && (
            <div className="absolute top-2 left-2">
              <div className="live-badge flex items-center gap-1 text-[10px]">
                <span className="w-1 h-1 rounded-full bg-destructive-foreground animate-pulse-subtle" />
                LIVE
              </div>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-card/80 backdrop-blur-sm rounded text-[10px] font-medium border border-border/30">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{formatViewerCount(stream.viewer_count || 0)}</span>
          </div>
          
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
            {stream.game_category && (
              <div className="px-2 py-0.5 bg-card/80 backdrop-blur-sm rounded text-[10px] text-foreground truncate max-w-[50%] border border-border/30">
                {stream.game_category}
              </div>
            )}
            
            {stream.started_at && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-card/80 backdrop-blur-sm rounded text-[10px] ml-auto border border-border/30">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{formatDuration(new Date(stream.started_at))}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-3">
          <div className="flex items-start gap-2.5">
            <Link 
              to={streamerUsername ? `/profile/${streamerUsername}` : '#'} 
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="w-8 h-8 border border-border">
                {streamerAvatar ? (
                  <AvatarImage src={streamerAvatar} alt={streamerName} />
                ) : (
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {streamerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
                {stream.title}
              </h3>
              <div className="mt-0.5 flex items-center gap-1">
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {streamerName}
                </p>
                {isVerified && (
                  <CheckCircle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default StreamCard;

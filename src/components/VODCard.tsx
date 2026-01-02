import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, User, Loader2 } from 'lucide-react';
import { StreamWithProfile } from '@/hooks/useStreams';
import { supabase } from '@/integrations/supabase/client';

interface VODCardProps {
  stream: StreamWithProfile;
}

const VODCard = ({ stream }: VODCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(stream.recording_url);
  const videoRef = useRef<HTMLVideoElement>(null);

  const streamerName = stream.profiles?.username || 'Unknown';
  const streamerAvatar = stream.profiles?.avatar_url;
  const streamDate = stream.ended_at 
    ? new Date(stream.ended_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : stream.started_at 
    ? new Date(stream.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  // Fetch recording URL if not available
  useEffect(() => {
    if (!recordingUrl && stream.livepeer_stream_id && !stream.is_live) {
      const fetchRecording = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke('fetch-recording', {
            body: { streamId: stream.id }
          });
          
          if (!error && data?.recording_url) {
            setRecordingUrl(data.recording_url);
          }
        } catch (err) {
          console.error('Failed to fetch recording:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchRecording();
    }
  }, [stream.id, stream.livepeer_stream_id, stream.is_live, recordingUrl]);

  return (
    <Link to={`/watch/${stream.id}?vod=true`}>
      <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="aspect-video relative bg-muted overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recordingUrl ? (
            <>
              <video 
                ref={videoRef}
                src={recordingUrl}
                className="w-full h-full object-cover"
                preload="metadata"
                muted
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="h-8 w-8 text-primary-foreground fill-current" />
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <Play className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* VOD Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
          >
            VOD
          </Badge>
          
          {/* Date */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
            <Clock className="h-3 w-3" />
            {streamDate}
          </div>
        </div>

        {/* Info */}
        <CardContent className="p-3">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9 border border-border flex-shrink-0">
              {streamerAvatar ? (
                <AvatarImage src={streamerAvatar} alt={streamerName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs">
                  {streamerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {stream.title}
              </h3>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {streamerName}
              </p>
              {stream.games?.name && (
                <p className="text-xs text-muted-foreground/70 truncate">
                  {stream.games.name}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default VODCard;
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import StreamCard from '@/components/StreamCard';
import { useGame } from '@/hooks/useGames';
import { useStreamsByGame } from '@/hooks/useStreams';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, ArrowLeft, Users, Radio, Loader2 } from 'lucide-react';

const GameDetail = () => {
  const { slug } = useParams();
  const { data: game, isLoading: gameLoading } = useGame(slug);
  const { data: streams = [], isLoading: streamsLoading } = useStreamsByGame(game?.id);
  
  const totalViewers = streams.reduce((acc, s) => acc + (s.viewer_count || 0), 0);
  
  if (gameLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <div className="glass-card p-12 max-w-md mx-auto">
            <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-display font-bold mb-2">Game Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This game doesn't exist in our directory.
            </p>
            <Link to="/games">
              <Button variant="premium">
                Browse Games
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      <div className="container py-8">
        {/* Back link */}
        <Link 
          to="/games" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Link>
        
        {/* Game header */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Thumbnail */}
            <div className="w-full md:w-48 aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex-shrink-0">
              {game.thumbnail_url ? (
                <img 
                  src={game.thumbnail_url} 
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gamepad2 className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <Badge variant="secondary" className="mb-2">{game.category}</Badge>
                  <h1 className="font-display text-3xl font-bold">{game.name}</h1>
                </div>
              </div>
              
              {game.description && (
                <p className="text-muted-foreground mb-6">{game.description}</p>
              )}
              
              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <Radio className="h-4 w-4 text-destructive" />
                  <span className="font-medium">{streams.length} Live</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{totalViewers.toLocaleString()} Viewers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Live streams */}
        <div>
          <h2 className="font-display text-xl font-bold mb-6">
            Live Streams for {game.name}
          </h2>
          
          {streamsLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading streams...</p>
            </div>
          ) : streams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {streams.map((stream, index) => (
                <div 
                  key={stream.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <StreamCard stream={stream} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card">
              <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">No Live Streams</h3>
              <p className="text-muted-foreground">
                No one is streaming {game.name} right now. Be the first!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetail;

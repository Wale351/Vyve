import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ProfileGate from '@/components/ProfileGate';
import AuthButton from '@/components/AuthButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Radio, Copy, Check, Loader2, AlertCircle, Settings, ArrowRight, Shield, LogIn, X, Plus, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useGames } from '@/hooks/useGames';

type Step = 'setup' | 'creating' | 'ready';

interface StreamData {
  id: string;
  stream_key: string;
  rtmp_url: string;
  playback_url: string;
}

const GoLive = () => {
  const navigate = useNavigate();
  const { authenticated, isAuthenticated, isAuthenticating, openLogin } = useWalletAuth();
  const { data: games = [] } = useGames();
  const [title, setTitle] = useState('');
  const [gameId, setGameId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState<Step>('setup');
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedRtmp, setCopiedRtmp] = useState(false);
  const [isGoingLive, setIsGoingLive] = useState(false);
  
  const selectedGame = games.find(g => g.id === gameId);

  const handleCreateStream = async () => {
    if (!title.trim()) {
      toast.error('Please enter a stream title');
      return;
    }

    if (title.length > 200) {
      toast.error('Title cannot exceed 200 characters');
      return;
    }

    if (description.length > 2000) {
      toast.error('Description cannot exceed 2000 characters');
      return;
    }

    setStep('creating');
    
    try {
      const { data, error } = await supabase.functions.invoke('create-stream', {
        body: {
          title: title.trim(),
          description: description.trim() || null,
          game_category: selectedGame?.name || null,
          game_id: gameId || null,
          tags: tags,
        },
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Stream creation error:', error);
        }
        toast.error('Failed to create stream. Please try again.');
        setStep('setup');
        return;
      }

      setStreamData({
        id: data.id,
        stream_key: data.stream_key,
        rtmp_url: data.rtmp_url,
        playback_url: data.playback_url,
      });
      setStep('ready');
      toast.success('Stream created!');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Unexpected error:', error);
      }
      toast.error('Failed to create stream.');
      setStep('setup');
    }
  };

  const handleGoLive = async () => {
    if (!streamData) return;
    
    setIsGoingLive(true);
    try {
      const { error } = await supabase.functions.invoke('update-stream-status', {
        body: {
          stream_id: streamData.id,
          is_live: true,
        },
      });

      if (error) {
        toast.error('Failed to go live.');
        return;
      }

      toast.success('You are now live!');
      navigate(`/watch/${streamData.id}`);
    } catch (error) {
      toast.error('Failed to go live.');
    } finally {
      setIsGoingLive(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'key' | 'rtmp') => {
    await navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedRtmp(true);
      setTimeout(() => setCopiedRtmp(false), 2000);
    }
    toast.success('Copied!');
  };

  const resetForm = () => {
    setStreamData(null);
    setTitle('');
    setGameId('');
    setTags([]);
    setTagInput('');
    setDescription('');
    setStep('setup');
  };
  
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && tags.length < 5 && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Not authenticated state
  if (!authenticated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background page-enter">
        <Header />
        <div className="h-14 md:h-16" />
        <div className="container px-4 py-12 md:py-20 flex items-center justify-center">
          <div className="glass-card max-w-sm md:max-w-md p-6 md:p-10 text-center w-full">
            <LogIn className="h-10 w-10 md:h-14 md:w-14 text-muted-foreground mx-auto mb-4 md:mb-6" />
            <h1 className="font-display text-xl md:text-2xl font-bold mb-2 md:mb-3">Sign In Required</h1>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
              Sign in to start streaming.
            </p>
            <AuthButton 
              variant="premium" 
              size="lg"
              disabled={isAuthenticating}
              className="gap-2 w-full sm:w-auto"
            >
              {isAuthenticating ? (
                <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4 md:h-5 md:w-5" />
              )}
              {isAuthenticating ? 'Signing In...' : 'Sign In'}
            </AuthButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />
      
      <ProfileGate fallbackMessage="You need to complete your profile before you can go live.">
      <div className="container px-4 py-6 md:py-12">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-10">
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
              Go Live
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Set up your stream
            </p>
          </div>

          {/* Progress steps - Simplified on mobile */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-10">
            <div className={`step-dot w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm ${step === 'setup' ? 'active' : step === 'creating' || step === 'ready' ? 'completed' : 'pending'}`}>
              {step === 'creating' || step === 'ready' ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : '1'}
            </div>
            <div className={`h-px w-8 md:w-16 rounded ${step === 'creating' || step === 'ready' ? 'bg-success' : 'bg-muted'}`} />
            <div className={`step-dot w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm ${step === 'creating' ? 'active' : step === 'ready' ? 'completed' : 'pending'}`}>
              {step === 'ready' ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : '2'}
            </div>
            <div className={`h-px w-8 md:w-16 rounded ${step === 'ready' ? 'bg-success' : 'bg-muted'}`} />
            <div className={`step-dot w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm ${step === 'ready' ? 'active' : 'pending'}`}>
              3
            </div>
          </div>

          {/* Main card */}
          <div className="glass-card overflow-hidden">
            {step === 'setup' && (
              <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                {/* Step header */}
                <div className="flex items-center gap-3 pb-4 md:pb-6 border-b border-border/30">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Settings className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-base md:text-lg">Stream Setup</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">Configure your stream</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4 md:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2 text-sm">
                      Stream Title
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                      placeholder="Enter your stream title..."
                      className="bg-muted/30 border-border/50 h-10 md:h-12 text-sm md:text-base"
                      maxLength={200}
                    />
                    {title.length > 150 && (
                      <p className="text-xs text-muted-foreground text-right">
                        {title.length}/200
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="game" className="flex items-center gap-2 text-sm">
                      <Gamepad2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      Activity
                    </Label>
                    <Select value={gameId} onValueChange={setGameId}>
                      <SelectTrigger className="bg-muted/30 border-border/50 h-10 md:h-12 text-sm md:text-base">
                        <SelectValue placeholder="Select an activity..." />
                      </SelectTrigger>
                      <SelectContent>
                        {games.map(game => (
                          <SelectItem key={game.id} value={game.id}>
                            <span className="flex items-center gap-2">
                              {game.name}
                              <span className="text-xs text-muted-foreground">({game.category})</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Tags (up to 5)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add a tag..."
                        className="bg-muted/30 border-border/50 h-9 md:h-10 text-sm"
                        maxLength={20}
                      />
                      <Button type="button" variant="subtle" size="icon" onClick={addTag} disabled={tags.length >= 5} className="h-9 w-9 md:h-10 md:w-10">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                      placeholder="Tell viewers about your stream..."
                      className="bg-muted/30 border-border/50 min-h-20 md:min-h-28 resize-none text-sm md:text-base"
                      maxLength={2000}
                    />
                    {description.length > 1800 && (
                      <p className="text-xs text-muted-foreground text-right">
                        {description.length}/2000
                      </p>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <Button 
                  onClick={handleCreateStream}
                  disabled={!title.trim()}
                  variant="premium"
                  size="lg"
                  className="w-full gap-2 mt-2 md:mt-4"
                >
                  Create Stream
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            )}

            {step === 'creating' && (
              <div className="p-10 md:p-16 text-center">
                <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary mx-auto mb-4 md:mb-6" />
                <h2 className="font-display text-xl md:text-2xl font-bold mb-2 md:mb-3">Creating Your Stream</h2>
                <p className="text-sm md:text-base text-muted-foreground">Setting up credentials...</p>
              </div>
            )}

            {step === 'ready' && (
              <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                {/* Success header */}
                <div className="text-center pb-4 md:pb-6 border-b border-border/30">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Check className="h-6 w-6 md:h-7 md:w-7 text-success" />
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-bold mb-1 md:mb-2">Stream Ready!</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Use these in OBS or your streaming software
                  </p>
                </div>

                {/* Credentials */}
                <div className="space-y-3 md:space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs md:text-sm">
                      <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      RTMP Server URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={streamData?.rtmp_url || ''}
                        readOnly
                        className="bg-muted/30 font-mono text-xs md:text-sm h-10 md:h-12"
                      />
                      <Button
                        variant="subtle"
                        size="icon"
                        className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0"
                        onClick={() => copyToClipboard(streamData?.rtmp_url || '', 'rtmp')}
                      >
                        {copiedRtmp ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs md:text-sm">
                      <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-secondary" />
                      Stream Key
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={streamData?.stream_key || ''}
                        readOnly
                        type="password"
                        className="bg-muted/30 font-mono text-xs md:text-sm h-10 md:h-12"
                      />
                      <Button
                        variant="subtle"
                        size="icon"
                        className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0"
                        onClick={() => copyToClipboard(streamData?.stream_key || '', 'key')}
                      >
                        {copiedKey ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Keep this key secret!
                    </p>
                  </div>
                </div>

                {/* Quick guide - Collapsible on mobile */}
                <div className="bg-muted/20 rounded-xl p-3 md:p-5 border border-border/30">
                  <h3 className="font-display font-semibold text-sm md:text-base mb-3 md:mb-4">Quick Setup</h3>
                  <ol className="space-y-2 md:space-y-3">
                    {[
                      'Open OBS Studio',
                      'Go to Settings → Stream',
                      'Select "Custom" service',
                      'Paste URL and Key',
                      'Click "Start Streaming"'
                    ].map((stepText, i) => (
                      <li key={i} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                        <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] md:text-xs font-medium text-primary">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{stepText}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
                  <Button
                    variant="subtle"
                    className="flex-1"
                    onClick={resetForm}
                  >
                    New Stream
                  </Button>
                  <Button
                    variant="premium"
                    className="flex-1 gap-2"
                    onClick={handleGoLive}
                    disabled={isGoingLive}
                  >
                    {isGoingLive ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Radio className="h-4 w-4" />
                    )}
                    {isGoingLive ? 'Going Live...' : "I'm Live!"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </ProfileGate>
    </div>
  );
};

export default GoLive;

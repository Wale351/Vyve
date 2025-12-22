import { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAccount } from 'wagmi';
import { Radio, Copy, Check, Loader2, AlertCircle, Settings, ArrowRight, Shield, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWalletAuth } from '@/hooks/useWalletAuth';

type Step = 'setup' | 'creating' | 'ready';

interface StreamData {
  id: string;
  stream_key: string;
  rtmp_url: string;
  playback_url: string;
}

const GoLive = () => {
  const { isConnected } = useAccount();
  const { isAuthenticated, isAuthenticating, signInWithWallet } = useWalletAuth();
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState<Step>('setup');
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedRtmp, setCopiedRtmp] = useState(false);
  const [isGoingLive, setIsGoingLive] = useState(false);

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
          game_category: game.trim() || null,
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
      toast.success('Stream created successfully!');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Unexpected error:', error);
      }
      toast.error('Failed to create stream. Please try again.');
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
        if (import.meta.env.DEV) {
          console.error('Go live error:', error);
        }
        toast.error('Failed to go live. Please try again.');
        return;
      }

      toast.success('You are now live! Your stream will appear on the home page.');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Unexpected error:', error);
      }
      toast.error('Failed to go live. Please try again.');
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
    toast.success('Copied to clipboard!');
  };

  const resetForm = () => {
    setStreamData(null);
    setTitle('');
    setGame('');
    setDescription('');
    setStep('setup');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background page-enter">
        <Header />
        <div className="container py-20 flex items-center justify-center">
          <div className="glass-card max-w-md p-10 text-center">
            <AlertCircle className="h-14 w-14 text-muted-foreground mx-auto mb-6" />
            <h1 className="font-display text-2xl font-bold mb-3">Connect Your Wallet</h1>
            <p className="text-muted-foreground">
              You need to connect your wallet to start streaming on Base Haven.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background page-enter">
        <Header />
        <div className="container py-20 flex items-center justify-center">
          <div className="glass-card max-w-md p-10 text-center">
            <LogIn className="h-14 w-14 text-muted-foreground mx-auto mb-6" />
            <h1 className="font-display text-2xl font-bold mb-3">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Sign in with your wallet to start streaming on Base Haven.
            </p>
            <Button 
              onClick={signInWithWallet} 
              variant="premium" 
              size="lg"
              disabled={isAuthenticating}
              className="gap-2"
            >
              {isAuthenticating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {isAuthenticating ? 'Signing In...' : 'Sign In with Wallet'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-enter">
      <Header />
      
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Go Live
            </h1>
            <p className="text-muted-foreground">
              Set up your stream and start broadcasting
            </p>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className={`step-dot ${step === 'setup' ? 'active' : step === 'creating' || step === 'ready' ? 'completed' : 'pending'}`}>
              {step === 'creating' || step === 'ready' ? <Check className="h-5 w-5" /> : '1'}
            </div>
            <div className={`h-px w-16 rounded ${step === 'creating' || step === 'ready' ? 'bg-success' : 'bg-muted'}`} />
            <div className={`step-dot ${step === 'creating' ? 'active' : step === 'ready' ? 'completed' : 'pending'}`}>
              {step === 'ready' ? <Check className="h-5 w-5" /> : '2'}
            </div>
            <div className={`h-px w-16 rounded ${step === 'ready' ? 'bg-success' : 'bg-muted'}`} />
            <div className={`step-dot ${step === 'ready' ? 'active' : 'pending'}`}>
              3
            </div>
          </div>

          {/* Main card */}
          <div className="glass-card overflow-hidden">
            {step === 'setup' && (
              <div className="p-8 space-y-6">
                {/* Step header */}
                <div className="flex items-center gap-3 pb-6 border-b border-border/30">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-lg">Stream Setup</h2>
                    <p className="text-sm text-muted-foreground">Configure your stream details</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      Stream Title
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                      placeholder="Enter your stream title..."
                      className="bg-muted/30 border-border/50 h-12"
                      maxLength={200}
                    />
                    {title.length > 150 && (
                      <p className="text-xs text-muted-foreground text-right">
                        {title.length}/200
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="game">
                      Game / Category
                    </Label>
                    <Input
                      id="game"
                      value={game}
                      onChange={(e) => setGame(e.target.value)}
                      placeholder="What are you playing?"
                      className="bg-muted/30 border-border/50 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                      placeholder="Tell viewers about your stream..."
                      className="bg-muted/30 border-border/50 min-h-28 resize-none"
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
                  size="xl"
                  className="w-full gap-2 mt-4"
                >
                  Create Stream
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            {step === 'creating' && (
              <div className="p-16 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
                <h2 className="font-display text-2xl font-bold mb-3">Creating Your Stream</h2>
                <p className="text-muted-foreground">Setting up your streaming credentials...</p>
              </div>
            )}

            {step === 'ready' && (
              <div className="p-8 space-y-6">
                {/* Success header */}
                <div className="text-center pb-6 border-b border-border/30">
                  <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-7 w-7 text-success" />
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-2">Stream Ready!</h2>
                  <p className="text-muted-foreground">
                    Use these credentials in OBS or your streaming software
                  </p>
                </div>

                {/* Credentials */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      RTMP Server URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={streamData?.rtmp_url || ''}
                        readOnly
                        className="bg-muted/30 font-mono text-sm h-12"
                      />
                      <Button
                        variant="subtle"
                        size="icon"
                        className="h-12 w-12 flex-shrink-0"
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
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-secondary" />
                      Stream Key
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={streamData?.stream_key || ''}
                        readOnly
                        type="password"
                        className="bg-muted/30 font-mono text-sm h-12"
                      />
                      <Button
                        variant="subtle"
                        size="icon"
                        className="h-12 w-12 flex-shrink-0"
                        onClick={() => copyToClipboard(streamData?.stream_key || '', 'key')}
                      >
                        {copiedKey ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Keep this key secret! Anyone with this key can stream to your channel.
                    </p>
                  </div>
                </div>

                {/* Quick guide */}
                <div className="bg-muted/20 rounded-xl p-5 border border-border/30">
                  <h3 className="font-display font-semibold mb-4">Quick Setup Guide</h3>
                  <ol className="space-y-3">
                    {[
                      'Open OBS Studio or your preferred streaming software',
                      'Go to Settings → Stream',
                      'Select "Custom" as your service',
                      'Paste the RTMP URL and Stream Key above',
                      'Click "Start Streaming"'
                    ].map((stepText, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {i + 1}
                        </span>
                        {stepText}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="subtle"
                    className="flex-1"
                    onClick={resetForm}
                  >
                    Create New Stream
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
    </div>
  );
};

export default GoLive;

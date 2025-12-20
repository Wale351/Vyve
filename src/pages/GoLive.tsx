import { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAccount } from 'wagmi';
import { Radio, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getRtmpIngestUrl } from '@/lib/livepeer';
import { cn } from '@/lib/utils';

const GoLive = () => {
  const { address, isConnected } = useAccount();
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [streamKey, setStreamKey] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedRtmp, setCopiedRtmp] = useState(false);

  const handleCreateStream = async () => {
    if (!title.trim()) {
      toast.error('Please enter a stream title');
      return;
    }

    setIsCreating(true);
    
    // Simulate stream creation - in production this would call Livepeer API via edge function
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock stream key
    const mockStreamKey = `live_${Math.random().toString(36).substring(2, 15)}`;
    setStreamKey(mockStreamKey);
    
    setIsCreating(false);
    toast.success('Stream created! Use the stream key in OBS or your streaming software.');
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <div className="glass-card max-w-md mx-auto p-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground">
              You need to connect your wallet to start streaming on Base Haven.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
              <Radio className="h-4 w-4" />
              Streaming Dashboard
            </div>
            <h1 className="font-display text-3xl font-bold">Go Live</h1>
            <p className="text-muted-foreground mt-2">
              Set up your stream and start broadcasting to Base Haven
            </p>
          </div>

          <div className="glass-card p-8 space-y-6">
            {!streamKey ? (
              <>
                {/* Stream Setup Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Stream Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter your stream title..."
                      className="bg-muted/50 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="game">Game / Category</Label>
                    <Input
                      id="game"
                      value={game}
                      onChange={(e) => setGame(e.target.value)}
                      placeholder="What are you playing?"
                      className="bg-muted/50 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell viewers about your stream..."
                      className="bg-muted/50 border-border/50 min-h-24"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleCreateStream}
                  disabled={isCreating || !title.trim()}
                  variant="neon"
                  size="lg"
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Stream...
                    </>
                  ) : (
                    <>
                      <Radio className="h-4 w-4" />
                      Create Stream
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Stream Key Display */}
                <div className="space-y-6">
                  <div className="text-center pb-4 border-b border-border/50">
                    <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-display text-xl font-bold">Stream Ready!</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use these credentials in OBS or your streaming software
                    </p>
                  </div>

                  {/* RTMP URL */}
                  <div className="space-y-2">
                    <Label>RTMP Server URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value="rtmp://rtmp.livepeer.studio/live"
                        readOnly
                        className="bg-muted/30 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard('rtmp://rtmp.livepeer.studio/live', 'rtmp')}
                      >
                        {copiedRtmp ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Stream Key */}
                  <div className="space-y-2">
                    <Label>Stream Key</Label>
                    <div className="flex gap-2">
                      <Input
                        value={streamKey}
                        readOnly
                        type="password"
                        className="bg-muted/30 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(streamKey, 'key')}
                      >
                        {copiedKey ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keep this key secret! Anyone with this key can stream to your channel.
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-medium text-sm">Quick Setup Guide</h3>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Open OBS Studio or your preferred streaming software</li>
                      <li>Go to Settings → Stream</li>
                      <li>Select "Custom" as your service</li>
                      <li>Paste the RTMP URL and Stream Key above</li>
                      <li>Click "Start Streaming"</li>
                    </ol>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStreamKey('')}
                    >
                      Create New Stream
                    </Button>
                    <Button
                      variant="neon"
                      className="flex-1"
                      onClick={() => toast.success('Your stream will appear on the home page when you go live!')}
                    >
                      I'm Live!
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tips */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Streaming powered by Livepeer • Tips are sent directly to your wallet on Base</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoLive;

import { useState, useRef, useEffect } from 'react';
import { formatAddress } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, MessageCircle, Sparkles, Crown } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useChatMessages, useSendMessage } from '@/hooks/useChatMessages';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface LiveChatProps {
  streamId: string;
}

// Badge component for chat messages
const ChatBadge = ({ type }: { type: 'vip' | 'mod' | 'sub' }) => {
  const badges = {
    vip: { icon: Sparkles, color: 'text-neon-orange', bg: 'bg-neon-orange/20' },
    mod: { icon: Crown, color: 'text-neon-green', bg: 'bg-neon-green/20' },
    sub: { icon: Sparkles, color: 'text-secondary', bg: 'bg-secondary/20' },
  };
  
  const badge = badges[type];
  const Icon = badge.icon;
  
  return (
    <div className={`inline-flex items-center justify-center w-4 h-4 rounded ${badge.bg}`}>
      <Icon className={`h-2.5 w-2.5 ${badge.color}`} />
    </div>
  );
};

const LiveChat = ({ streamId }: LiveChatProps) => {
  const { address, isConnected } = useAccount();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useChatMessages(streamId);
  const { data: profile } = useProfile(address);
  const sendMessageMutation = useSendMessage();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !isConnected || !profile?.id) {
      if (!profile?.id && isConnected) {
        toast.error('Profile not found. Please try reconnecting your wallet.');
      }
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        streamId,
        senderId: profile.id,
        message: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-card/50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-neon-green rounded-full animate-pulse" />
          </div>
          <h3 className="font-display font-semibold">Live Chat</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/30" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Loading chat...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => {
              const senderName = msg.profiles?.username || formatAddress(msg.profiles?.wallet_address || '');
              const timestamp = new Date(msg.created_at);
              // Randomly assign badges for demo (in production, this would come from user data)
              const hasBadge = index % 5 === 0;
              const badgeType = index % 3 === 0 ? 'vip' : index % 3 === 1 ? 'mod' : 'sub';
              
              return (
                <div 
                  key={msg.id} 
                  className="group animate-message-in rounded-lg p-2 -mx-2 hover:bg-muted/30 transition-colors"
                  style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                >
                  <div className="flex items-start gap-2">
                    {/* Mini avatar */}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-[10px] font-bold text-foreground">
                      {senderName.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {hasBadge && <ChatBadge type={badgeType} />}
                        <span className="text-xs font-semibold text-primary truncate">
                          {senderName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 mt-0.5 break-words leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="relative inline-block mb-4">
                  <MessageCircle className="h-12 w-12 text-muted-foreground" />
                  <div className="absolute inset-0 blur-lg bg-primary/20" />
                </div>
                <p className="text-muted-foreground text-sm">No messages yet</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Be the first to chat!</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/30 bg-card/50">
        {isConnected ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
                  onKeyDown={handleKeyDown}
                  placeholder="Send a message..."
                  className="flex-1 bg-muted/30 border-border/50 pr-12 focus:border-primary/50 transition-colors"
                  maxLength={500}
                />
                {newMessage.length > 400 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    {newMessage.length}/500
                  </span>
                )}
              </div>
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                size="icon"
                variant="neon"
                className="flex-shrink-0"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-3 px-4 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to chat
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChat;
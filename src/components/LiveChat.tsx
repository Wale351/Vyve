import { useState, useRef, useEffect } from 'react';
import { formatAddress } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useChatMessages, useSendMessage } from '@/hooks/useChatMessages';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface LiveChatProps {
  streamId: string;
}

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
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold">Live Chat</h3>
        </div>
        <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading chat...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg) => {
              const senderName = msg.profiles?.username || formatAddress(msg.profiles?.wallet_address || '');
              const timestamp = new Date(msg.created_at);
              
              return (
                <div 
                  key={msg.id} 
                  className="group py-2 px-2 -mx-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Mini avatar */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 flex items-center justify-center text-[10px] font-bold text-foreground">
                      {senderName.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {senderName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 break-words leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No messages yet</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Be the first to chat!</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-4 border-t border-border/30">
        {isConnected ? (
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="flex-1 bg-muted/30 border-border/50"
              maxLength={500}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              size="icon"
              className="flex-shrink-0"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-3 px-4 rounded-xl bg-muted/30 border border-border/30">
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

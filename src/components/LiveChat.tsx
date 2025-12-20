import { useState, useRef, useEffect } from 'react';
import { formatAddress } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Coins, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';
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
    <div className="flex flex-col h-full glass-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="font-display font-semibold">Live Chat</h3>
        <span className="text-xs text-muted-foreground">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const senderName = msg.profiles?.username || formatAddress(msg.profiles?.wallet_address || '');
              const timestamp = new Date(msg.created_at);
              
              return (
                <div key={msg.id} className="group">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-primary">
                        {senderName}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <p className="text-sm text-foreground mt-0.5 break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No messages yet. Be the first to chat!
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        {isConnected ? (
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="flex-1 bg-muted/50 border-border/50"
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              size="icon"
              variant="glow"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Connect your wallet to chat
          </p>
        )}
      </div>
    </div>
  );
};

export default LiveChat;

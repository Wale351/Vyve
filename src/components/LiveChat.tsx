import { useState, useRef, useEffect } from 'react';
import { ChatMessage, formatAddress } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Coins } from 'lucide-react';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';

interface LiveChatProps {
  streamId: string;
  initialMessages?: ChatMessage[];
}

const LiveChat = ({ streamId, initialMessages = [] }: LiveChatProps) => {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !isConnected || !address) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderAddress: address,
      senderName: formatAddress(address),
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
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
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "group",
                msg.isTip && "bg-primary/10 -mx-2 px-2 py-2 rounded-lg border border-primary/20"
              )}
            >
              <div className="flex items-start gap-2">
                {msg.isTip && (
                  <Coins className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="text-xs font-medium text-primary">
                    {msg.senderName}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <p className={cn(
                    "text-sm text-foreground mt-0.5 break-words",
                    msg.isTip && "text-primary font-medium"
                  )}>
                    {msg.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No messages yet. Be the first to chat!
            </div>
          )}
        </div>
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
              disabled={!newMessage.trim()}
              size="icon"
              variant="glow"
            >
              <Send className="h-4 w-4" />
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

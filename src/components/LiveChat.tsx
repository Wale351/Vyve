import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Send, 
  Loader2, 
  MessageCircle, 
  MoreVertical,
  VolumeX,
  Ban,
  Crown,
  BadgeCheck
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useChatMessages, useSendMessage } from '@/hooks/useChatMessages';
import { useOwnProfile, useProfileComplete } from '@/hooks/useProfile';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useIsStreamOwner, useMuteUser, useBlockUser, useMutedUsers } from '@/hooks/useModeration';
import { useStream } from '@/hooks/useStreams';
import { toast } from 'sonner';
import { useOnboarding } from '@/hooks/useOnboarding';
import UserHoverCard from '@/components/UserHoverCard';

interface LiveChatProps {
  streamId: string;
}

const LiveChat = ({ streamId }: LiveChatProps) => {
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated } = useWalletAuth();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useChatMessages(streamId);
  const { data: profile } = useOwnProfile(user?.id);
  const { data: isProfileComplete } = useProfileComplete(user?.id);
  const { data: stream } = useStream(streamId);
  const { data: isStreamOwner } = useIsStreamOwner(streamId, user?.id);
  const { data: mutedUsers = [] } = useMutedUsers(streamId);
  const { showOnboarding, triggerOnboarding } = useOnboarding();
  const sendMessageMutation = useSendMessage();
  const muteUserMutation = useMuteUser();
  const blockUserMutation = useBlockUser();

  const streamerId = stream?.streamer_id;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !isConnected || !profile?.id) {
      if (!profile?.id && isConnected) {
        toast.error('Profile not found. Please try reconnecting.');
      }
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        streamId,
        senderId: profile.id,
        message: newMessage.trim(),
        senderProfile: {
          username: profile.username || 'Anonymous',
          avatar_url: profile.avatar_url,
        },
      });
      setNewMessage('');
    } catch (error: any) {
      if (error?.message?.includes('blocked') || error?.message?.includes('muted')) {
        toast.error('You are muted from this chat');
      } else if (error?.message?.includes('rate')) {
        toast.error('Slow down!');
      } else {
        toast.error('Failed to send');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMuteUser = (userId: string) => {
    if (!user?.id) return;
    muteUserMutation.mutate({
      streamId,
      mutedUserId: userId,
      mutedBy: user.id,
    });
  };

  const handleBlockUser = (userId: string) => {
    if (!streamerId) return;
    blockUserMutation.mutate({
      streamerId,
      blockedUserId: userId,
    });
  };

  return (
    <div className="flex flex-col h-full bg-card lg:glass-card overflow-hidden lg:rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <h3 className="font-display font-semibold text-sm md:text-base">Live Chat</h3>
        </div>
        <span className="text-[10px] md:text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg">
          {messages.length}
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-2 md:px-4 md:py-3" ref={scrollRef}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
            <p className="mt-2 md:mt-3 text-xs md:text-sm text-muted-foreground">Loading chat...</p>
          </div>
        ) : (
          <div className="space-y-0.5 md:space-y-1">
            {messages.map((msg) => {
              const senderName = msg.profiles?.username || 'User';
              const senderUsername = msg.profiles?.username;
              const timestamp = new Date(msg.created_at);
              const isStreamer = msg.sender_id === streamerId;
              const isMuted = mutedUsers.includes(msg.sender_id);
              const canModerate = isStreamOwner && msg.sender_id !== user?.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`group py-1.5 md:py-2 px-1.5 md:px-2 -mx-1.5 md:-mx-2 rounded-lg hover:bg-muted/30 transition-colors ${isMuted ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-2 md:gap-2.5">
                    {/* Avatar with hover card */}
                    <UserHoverCard userId={msg.sender_id}>
                      <Link to={senderUsername ? `/profile/${senderUsername}` : '#'} className="flex-shrink-0">
                        <Avatar className="w-6 h-6 md:w-7 md:h-7 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
                          {msg.profiles?.avatar_url ? (
                            <AvatarImage src={msg.profiles.avatar_url} alt={senderName} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-primary/60 to-secondary/60 text-[9px] md:text-[10px] font-bold text-foreground">
                              {senderName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </Link>
                    </UserHoverCard>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                        {/* Streamer badge */}
                        {isStreamer && (
                          <span className="inline-flex items-center gap-0.5 md:gap-1 px-1 md:px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] md:text-[10px] font-medium">
                            <Crown className="h-2 w-2 md:h-2.5 md:w-2.5" />
                            <span className="hidden sm:inline">Streamer</span>
                          </span>
                        )}
                        <UserHoverCard userId={msg.sender_id}>
                          <Link 
                            to={senderUsername ? `/profile/${senderUsername}` : '#'}
                            className="text-xs md:text-sm font-medium text-foreground truncate max-w-[100px] md:max-w-none hover:text-primary hover:underline transition-colors"
                          >
                            {senderName}
                          </Link>
                        </UserHoverCard>
                        <span className="text-[10px] md:text-[11px] text-muted-foreground">
                          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {/* Moderation dropdown */}
                        {canModerate && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 md:h-5 md:w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-2.5 w-2.5 md:h-3 md:w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 md:w-40">
                              <DropdownMenuItem 
                                onClick={() => handleMuteUser(msg.sender_id)}
                                className="gap-2 text-destructive focus:text-destructive text-xs md:text-sm"
                              >
                                <VolumeX className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                Mute
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleBlockUser(msg.sender_id)}
                                className="gap-2 text-destructive focus:text-destructive text-xs md:text-sm"
                              >
                                <Ban className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                Block
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mt-0.5 break-words leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {messages.length === 0 && (
              <div className="text-center py-8 md:py-12">
                <MessageCircle className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground mx-auto mb-2 md:mb-3" />
                <p className="text-muted-foreground text-xs md:text-sm">No messages yet</p>
                <p className="text-muted-foreground/60 text-[10px] md:text-xs mt-1">Be the first to chat!</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="px-3 py-3 md:px-4 md:py-4 border-t border-border/30">
        {isConnected && isAuthenticated && isProfileComplete ? (
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="flex-1 bg-muted/30 border-border/50 h-9 md:h-10 text-sm"
              maxLength={500}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              size="icon"
              className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : isConnected && isAuthenticated && !isProfileComplete ? (
          <div className="text-center py-2 md:py-3 px-3 md:px-4 rounded-xl bg-muted/30 border border-border/30">
            <button 
              onClick={triggerOnboarding}
              className="text-xs md:text-sm text-primary hover:underline"
            >
              Complete your profile to chat
            </button>
          </div>
        ) : (
          <div className="text-center py-2 md:py-3 px-3 md:px-4 rounded-xl bg-muted/30 border border-border/30">
            <p className="text-xs md:text-sm text-muted-foreground">
              Connect wallet to chat
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChat;

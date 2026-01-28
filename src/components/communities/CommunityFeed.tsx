import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  Pin, Heart, MessageCircle, MoreHorizontal, 
  Send, Radio, Megaphone, ChevronDown, ChevronUp, Trash2, Loader2,
  BarChart3, Gift, CheckCircle2, Clock, Users
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCommunityPosts, useCreatePost, CommunityPost } from '@/hooks/useCommunities';
import { usePostLikes, useToggleLike } from '@/hooks/usePostLikes';
import { useDeletePost } from '@/hooks/useCommunityPosts';
import { useCommunityPolls, useVoteOnPoll, type Poll } from '@/hooks/useCommunityPolls';
import { useCommunityGiveaways, useEnterGiveaway, type Giveaway } from '@/hooks/useCommunityGiveaways';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import PostComments from './PostComments';
import PostImageUpload from './PostImageUpload';
import MentionInput from './MentionInput';
import MentionText from './MentionText';

interface CommunityFeedProps {
  communityId: string;
  isOwner: boolean;
  isMember: boolean;
}

const PostTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'announcement':
      return <Megaphone className="h-4 w-4 text-yellow-500" />;
    case 'stream_alert':
      return <Radio className="h-4 w-4 text-red-500" />;
    case 'poll':
      return <BarChart3 className="h-4 w-4 text-primary" />;
    case 'giveaway':
      return <Gift className="h-4 w-4 text-primary" />;
    default:
      return null;
  }
};

// Inline Poll Component for feed
interface InlinePollProps {
  poll: Poll;
  communityId: string;
  isAuthenticated: boolean;
}

const InlinePoll = ({ poll, communityId, isAuthenticated }: InlinePollProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(poll.userVotedIndex);
  const voteMutation = useVoteOnPoll();
  const isEnded = poll.endsAt ? new Date(poll.endsAt) < new Date() : false;
  const hasVoted = poll.userVotedIndex !== null;
  const canVote = isAuthenticated && !isEnded && !hasVoted && poll.isActive;

  const handleVote = (index: number) => {
    if (!canVote) return;
    setSelectedOption(index);
    voteMutation.mutate({ pollId: poll.id, optionIndex: index, communityId });
  };

  return (
    <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{poll.question}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {poll.totalVotes} votes
        </div>
      </div>
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const percentage = poll.totalVotes > 0 
            ? Math.round((option.votes / poll.totalVotes) * 100) 
            : 0;
          const isSelected = selectedOption === index || poll.userVotedIndex === index;
          const maxVotes = Math.max(...poll.options.map(o => o.votes));
          const isWinner = isEnded && option.votes === maxVotes && maxVotes > 0;
          const isVoting = voteMutation.isPending && selectedOption === index;

          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={!canVote || voteMutation.isPending}
              className={cn(
                "relative w-full p-2.5 rounded-md text-left transition-all text-sm",
                "border border-border/50",
                canVote && "hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
                isSelected && "border-primary bg-primary/5",
                isWinner && "border-accent bg-accent/5",
                (!canVote || voteMutation.isPending) && "cursor-default"
              )}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  {isVoting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : isSelected ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  ) : null}
                  <span className={cn(isSelected && "font-medium")}>{option.label}</span>
                </div>
                <span className="text-muted-foreground">{percentage}%</span>
              </div>
              {(hasVoted || isEnded) && (
                <div 
                  className={cn(
                    "absolute inset-0 rounded-md opacity-20 transition-all",
                    isWinner ? "bg-accent" : "bg-primary"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {isEnded ? 'Poll ended' : poll.endsAt 
          ? `Ends ${formatDistanceToNow(new Date(poll.endsAt), { addSuffix: true })}`
          : 'Open poll'}
      </div>
    </div>
  );
};

// Inline Giveaway Component for feed
interface InlineGiveawayProps {
  giveaway: Giveaway;
  communityId: string;
  isAuthenticated: boolean;
}

const InlineGiveaway = ({ giveaway, communityId, isAuthenticated }: InlineGiveawayProps) => {
  const enterMutation = useEnterGiveaway();
  const isEnded = giveaway.endsAt ? new Date(giveaway.endsAt) < new Date() : false;
  const canEnter = isAuthenticated && !isEnded && !giveaway.hasEntered && giveaway.isActive;

  return (
    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <span className="font-medium">{giveaway.title}</span>
        </div>
        {giveaway.prizeAmount && giveaway.prizeType && (
          <Badge variant="default">{giveaway.prizeAmount} {giveaway.prizeType}</Badge>
        )}
      </div>
      {giveaway.description && (
        <p className="text-sm text-muted-foreground mb-3">{giveaway.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {giveaway.entries} entries
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {isEnded ? 'Ended' : giveaway.endsAt 
              ? `Ends ${formatDistanceToNow(new Date(giveaway.endsAt), { addSuffix: true })}`
              : 'No end date'}
          </span>
        </div>
        {!isEnded && giveaway.isActive && (
          <Button 
            size="sm" 
            disabled={!canEnter || enterMutation.isPending}
            onClick={() => enterMutation.mutate({ giveawayId: giveaway.id, communityId })}
            variant={giveaway.hasEntered ? "secondary" : "default"}
          >
            {enterMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : giveaway.hasEntered ? 'Entered ✓' : 'Enter'}
          </Button>
        )}
      </div>
    </div>
  );
};

interface PostCardProps {
  post: CommunityPost;
  communityId: string;
  isOwner: boolean;
  poll?: Poll;
  giveaway?: Giveaway;
}

const PostCard = ({ post, communityId, isOwner, poll, giveaway }: PostCardProps) => {
  const { user, isAuthenticated } = useWalletAuth();
  const [showComments, setShowComments] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { data: likes = [] } = usePostLikes(post.id);
  const toggleLike = useToggleLike();
  const deletePost = useDeletePost();

  const isLiked = likes.some(like => like.user_id === user?.id);
  const isPostAuthor = user?.id === post.author_id;
  const canDelete = isAuthenticated && (isPostAuthor || isOwner);
  
  const handleLike = () => {
    if (!user?.id) return;
    toggleLike.mutate({ postId: post.id, isLiked });
  };

  const handleDelete = () => {
    deletePost.mutate({ postId: post.id, communityId });
    setShowDeleteDialog(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn(
        "bg-card/50 backdrop-blur-sm border-border/50",
        post.is_pinned && "border-primary/30 bg-primary/5"
      )}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.author?.username}`}>
                <Avatar className="h-10 w-10">
                  {post.author?.avatar_url ? (
                    <AvatarImage src={post.author.avatar_url} alt={post.author.username} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                      {post.author?.username?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link 
                    to={`/profile/${post.author?.username}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {post.author?.username || 'Unknown'}
                  </Link>
                  <PostTypeIcon type={post.post_type} />
                  {post.is_pinned && (
                    <Badge variant="outline" className="gap-1 text-xs border-primary/30 text-primary">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Content - render with mention support */}
          {post.post_type !== 'poll' && post.post_type !== 'giveaway' && (
            <p className="text-foreground whitespace-pre-wrap">
              <MentionText content={post.content} />
            </p>
          )}

          {/* Poll inline */}
          {post.post_type === 'poll' && poll && (
            <InlinePoll poll={poll} communityId={communityId} isAuthenticated={isAuthenticated} />
          )}

          {/* Giveaway inline */}
          {post.post_type === 'giveaway' && giveaway && (
            <InlineGiveaway giveaway={giveaway} communityId={communityId} isAuthenticated={isAuthenticated} />
          )}

          {/* Image */}
          {post.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img src={post.image_url} alt="" className="w-full max-h-96 object-cover" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-2 h-8", isLiked && "text-red-500")}
              onClick={handleLike}
              disabled={!user || toggleLike.isPending}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              <span className="text-xs">{likes.length}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 h-8"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Reply</span>
              {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>

          {/* Comments Section */}
          <PostComments postId={post.id} isExpanded={showComments} />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

const CommunityFeed = ({ communityId, isOwner, isMember }: CommunityFeedProps) => {
  const { user } = useWalletAuth();
  const { data: posts, isLoading } = useCommunityPosts(communityId);
  const { data: polls } = useCommunityPolls(communityId);
  const { data: giveaways } = useCommunityGiveaways(communityId);
  const createPost = useCreatePost();
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build lookup maps for polls and giveaways by postId
  const pollsByPostId = new Map(polls?.map(p => [p.postId, p]) || []);
  const giveawaysByPostId = new Map(giveaways?.map(g => [g.postId, g]) || []);

  const handleSubmit = async () => {
    if (!newPost.trim() || !user?.id) return;
    
    setIsSubmitting(true);
    try {
      await createPost.mutateAsync({
        community_id: communityId,
        author_id: user.id,
        content: newPost.trim(),
        image_url: postImage || undefined,
      });
      setNewPost('');
      setPostImage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Post composer for owners only */}
      {isOwner && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 space-y-3">
            <MentionInput
              value={newPost}
              onChange={setNewPost}
              placeholder="Share an update with your community... (use @username to mention)"
              className="min-h-[80px] bg-muted/50 border-border/50 resize-none"
              multiline
            />
            
            {/* Image preview */}
            {postImage && (
              <div className="relative rounded-lg overflow-hidden border border-border/50">
                <img src={postImage} alt="Post preview" className="w-full max-h-48 object-cover" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setPostImage(null)}
                >
                  Remove
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <PostImageUpload
                userId={user?.id || ''}
                value={postImage}
                onChange={setPostImage}
                disabled={!user?.id}
              />
              <Button 
                onClick={handleSubmit}
                disabled={!newPost.trim() || isSubmitting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              communityId={communityId}
              isOwner={isOwner}
              poll={pollsByPostId.get(post.id)}
              giveaway={giveawaysByPostId.get(post.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-medium mb-2">No posts yet</h3>
          <p className="text-sm text-muted-foreground">
            {isOwner 
              ? 'Share your first update with the community!'
              : 'Check back later for community updates.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePostComments, useCreateComment, useDeleteComment, PostComment } from '@/hooks/useCommunityPosts';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { cn } from '@/lib/utils';

interface PostCommentsProps {
  postId: string;
  isExpanded: boolean;
}

const CommentItem = ({ 
  comment, 
  currentUserId,
  onDelete 
}: { 
  comment: PostComment; 
  currentUserId?: string;
  onDelete: (id: string) => void;
}) => {
  const isOwn = comment.author_id === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-start gap-2 py-2"
    >
      <Link to={`/profile/${comment.author?.username}`}>
        <Avatar className="h-7 w-7">
          {comment.author?.avatar_url ? (
            <AvatarImage src={comment.author.avatar_url} alt={comment.author.username} />
          ) : (
            <AvatarFallback className="text-xs bg-muted">
              {comment.author?.username?.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          )}
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link 
            to={`/profile/${comment.author?.username}`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {comment.author?.username || 'Unknown'}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-foreground/90 break-words">{comment.content}</p>
      </div>
      {isOwn && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(comment.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </motion.div>
  );
};

const PostComments = ({ postId, isExpanded }: PostCommentsProps) => {
  const { user, isAuthenticated } = useWalletAuth();
  const { data: comments, isLoading } = usePostComments(postId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        post_id: postId,
        content: newComment.trim(),
      });
      setNewComment('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = (commentId: string) => {
    deleteComment.mutate({ commentId, postId });
  };

  if (!isExpanded) return null;

  return (
    <div className="border-t border-border/50 pt-3 mt-3 space-y-2">
      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="max-h-64 overflow-y-auto space-y-1">
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          No comments yet
        </p>
      )}

      {/* Comment input */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a reply..."
            className="h-9 text-sm bg-muted/50"
            maxLength={500}
          />
          <Button 
            type="submit" 
            size="sm" 
            className="h-9 px-3"
            disabled={!newComment.trim() || createComment.isPending}
          >
            {createComment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      )}
    </div>
  );
};

export default PostComments;

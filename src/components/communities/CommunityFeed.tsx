import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  Pin, Heart, MessageCircle, MoreHorizontal, 
  Send, Radio, Megaphone, ChevronDown, ChevronUp
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommunityPosts, useCreatePost, CommunityPost } from '@/hooks/useCommunities';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import PostComments from './PostComments';
import PostImageUpload from './PostImageUpload';

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
    default:
      return null;
  }
};

const PostCard = ({ post }: { post: CommunityPost }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
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
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

          {/* Image */}
          {post.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={post.image_url} 
                alt="" 
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-2 h-8", liked && "text-red-500")}
              onClick={() => setLiked(!liked)}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              <span className="text-xs">
                {Object.values(post.reactions || {}).flat().length + (liked ? 1 : 0)}
              </span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 h-8"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Reply</span>
              {showComments ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>

          {/* Comments Section */}
          <PostComments postId={post.id} isExpanded={showComments} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CommunityFeed = ({ communityId, isOwner, isMember }: CommunityFeedProps) => {
  const { user } = useWalletAuth();
  const { data: posts, isLoading } = useCommunityPosts(communityId);
  const createPost = useCreatePost();
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      {/* Post composer for owners/moderators */}
      {isOwner && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 space-y-3">
            <Textarea
              placeholder="Share an update with your community..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[80px] bg-muted/50 border-border/50 resize-none"
            />
            
            {/* Image preview */}
            {postImage && (
              <div className="relative rounded-lg overflow-hidden border border-border/50">
                <img 
                  src={postImage} 
                  alt="Post preview" 
                  className="w-full max-h-48 object-cover"
                />
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
            <PostCard key={post.id} post={post} />
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

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Heart, Send, Plus, Filter, TrendingUp, Clock, User, Trash2, Pin } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const categories = [
  { value: 'general', label: '💬 General', color: 'bg-muted' },
  { value: 'crops', label: '🌾 Crops & Farming', color: 'bg-green-500/20' },
  { value: 'weather', label: '☀️ Weather & Climate', color: 'bg-blue-500/20' },
  { value: 'market', label: '📈 Market & Prices', color: 'bg-yellow-500/20' },
  { value: 'equipment', label: '🚜 Equipment', color: 'bg-orange-500/20' },
  { value: 'organic', label: '🌿 Organic Farming', color: 'bg-emerald-500/20' },
  { value: 'help', label: '❓ Help & Support', color: 'bg-purple-500/20' },
];

interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  profiles?: { full_name: string | null } | null;
  user_liked?: boolean;
}

interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

const FarmerForum = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [newComment, setNewComment] = useState('');

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts', selectedCategory, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (full_name)
        `);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (sortBy === 'latest') {
        query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
      } else {
        query = query.order('is_pinned', { ascending: false }).order('likes_count', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Check if user has liked each post
      if (user && data) {
        const { data: likes } = await supabase
          .from('forum_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', data.map(p => p.id));

        const likedPostIds = new Set(likes?.map(l => l.post_id));
        return data.map(post => ({
          ...post,
          user_liked: likedPostIds.has(post.id)
        }));
      }

      return data || [];
    },
  });

  // Fetch comments for selected post
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['forum-comments', selectedPost?.id],
    queryFn: async () => {
      if (!selectedPost) return [];
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('post_id', selectedPost.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedPost,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase.from('forum_posts').insert({
        user_id: user.id,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      setNewPost({ title: '', content: '', category: 'general' });
      setIsCreateOpen(false);
      toast.success('Post created successfully!');
    },
    onError: () => toast.error('Failed to create post'),
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedPost) throw new Error('Must be logged in');
      const { error } = await supabase.from('forum_comments').insert({
        post_id: selectedPost.id,
        user_id: user.id,
        content: newComment,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', selectedPost?.id] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      setNewComment('');
      toast.success('Comment added!');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { data: existingLike } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (existingLike) {
        const { error } = await supabase.from('forum_likes').delete().eq('id', existingLike.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('forum_likes').insert({
          user_id: user.id,
          post_id: postId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('forum_posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      setSelectedPost(null);
      toast.success('Post deleted');
    },
  });

  const getCategoryInfo = (value: string) => categories.find(c => c.value === value) || categories[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4">
              🌾 Farmer <span className="text-primary">Forum</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Connect with fellow farmers, share knowledge, and grow together
            </p>
            {user ? (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Start a Discussion
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input
                      placeholder="Post title..."
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                    <Select value={newPost.category} onValueChange={(v) => setNewPost({ ...newPost, category: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Share your thoughts, questions, or experiences..."
                      rows={5}
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    />
                    <Button
                      className="w-full"
                      onClick={() => createPostMutation.mutate()}
                      disabled={!newPost.title || !newPost.content || createPostMutation.isPending}
                    >
                      {createPostMutation.isPending ? 'Posting...' : 'Post Discussion'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button size="lg" variant="outline" asChild>
                <a href="/login">Login to Join</a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Categories */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory('all')}
                  >
                    📋 All Topics
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat.value}
                      variant={selectedCategory === cat.value ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(cat.value)}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Posts List */}
            <div className="lg:col-span-3">
              {/* Sort Tabs */}
              <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as 'latest' | 'popular')} className="mb-6">
                <TabsList>
                  <TabsTrigger value="latest" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Latest
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Popular
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Posts */}
              {postsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                    <p className="text-muted-foreground">Be the first to start a conversation!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => {
                    const catInfo = getCategoryInfo(post.category);
                    return (
                      <Card
                        key={post.id}
                        className={`cursor-pointer hover:shadow-md transition-all ${post.is_pinned ? 'border-primary/50 bg-primary/5' : ''}`}
                        onClick={() => setSelectedPost(post)}
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="hidden sm:flex">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {post.profiles?.full_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {post.is_pinned && (
                                  <Badge variant="secondary" className="gap-1">
                                    <Pin className="w-3 h-3" />
                                    Pinned
                                  </Badge>
                                )}
                                <Badge className={catInfo.color} variant="outline">
                                  {catInfo.label}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{post.title}</h3>
                              <p className="text-muted-foreground line-clamp-2 text-sm mb-3">
                                {post.content}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {post.profiles?.full_name || 'Anonymous'}
                                </span>
                                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (user) likePostMutation.mutate(post.id);
                                    else toast.error('Login to like posts');
                                  }}
                                  className={`flex items-center gap-1 hover:text-red-500 transition-colors ${post.user_liked ? 'text-red-500' : ''}`}
                                >
                                  <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-current' : ''}`} />
                                  {post.likes_count}
                                </button>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-4 h-4" />
                                  {post.comments_count}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getCategoryInfo(selectedPost.category).color} variant="outline">
                    {getCategoryInfo(selectedPost.category).label}
                  </Badge>
                  {selectedPost.is_pinned && (
                    <Badge variant="secondary" className="gap-1">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl">{selectedPost.title}</DialogTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedPost.profiles?.full_name || 'Anonymous'}
                  </span>
                  <span>{formatDistanceToNow(new Date(selectedPost.created_at), { addSuffix: true })}</span>
                </div>
              </DialogHeader>

              <div className="py-4">
                <p className="whitespace-pre-wrap text-foreground">{selectedPost.content}</p>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <button
                    onClick={() => user ? likePostMutation.mutate(selectedPost.id) : toast.error('Login to like')}
                    className={`flex items-center gap-1 hover:text-red-500 transition-colors ${selectedPost.user_liked ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    <Heart className={`w-5 h-5 ${selectedPost.user_liked ? 'fill-current' : ''}`} />
                    {selectedPost.likes_count} Likes
                  </button>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="w-5 h-5" />
                    {selectedPost.comments_count} Comments
                  </span>
                  {user?.id === selectedPost.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-destructive hover:text-destructive"
                      onClick={() => deletePostMutation.mutate(selectedPost.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Comments</h4>

                {commentsLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-muted-foreground text-sm mb-4">No comments yet. Be the first!</p>
                ) : (
                  <div className="space-y-4 mb-4">
                    {comments.map((comment: ForumComment) => (
                      <div key={comment.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {comment.profiles?.full_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.profiles?.full_name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {user ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newComment.trim()) {
                          createCommentMutation.mutate();
                        }
                      }}
                    />
                    <Button
                      onClick={() => createCommentMutation.mutate()}
                      disabled={!newComment.trim() || createCommentMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/login">Login to comment</a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default FarmerForum;
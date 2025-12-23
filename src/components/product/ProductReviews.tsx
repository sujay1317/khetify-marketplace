import React, { useState, useEffect } from 'react';
import { Star, User, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    // Fetch reviews
    const { data: reviewsData, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
      return;
    }

    if (!reviewsData || reviewsData.length === 0) {
      setReviews([]);
      setLoading(false);
      return;
    }

    // Fetch profiles for reviewers
    const userIds = [...new Set(reviewsData.map(r => r.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', userIds);

    const profileMap: Record<string, { full_name: string | null }> = {};
    profilesData?.forEach(p => {
      profileMap[p.user_id] = { full_name: p.full_name };
    });

    const reviewsWithProfiles = reviewsData.map(r => ({
      ...r,
      profile: profileMap[r.user_id] || { full_name: null },
    }));

    setReviews(reviewsWithProfiles);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    setSubmitting(true);

    if (editingReview) {
      const { error } = await supabase
        .from('reviews')
        .update({ rating, comment })
        .eq('id', editingReview.id);

      if (error) {
        toast.error('Failed to update review');
      } else {
        toast.success('Review updated!');
        setEditingReview(null);
      }
    } else {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: productId,
          rating,
          comment,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this product');
        } else {
          toast.error('Failed to submit review');
        }
      } else {
        toast.success('Review submitted!');
      }
    }

    setShowForm(false);
    setRating(5);
    setComment('');
    setSubmitting(false);
    fetchReviews();
  };

  const handleDelete = async (reviewId: string) => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      toast.error('Failed to delete review');
    } else {
      toast.success('Review deleted');
      fetchReviews();
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment || '');
    setShowForm(true);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const userHasReviewed = user && reviews.some(r => r.user_id === user.id);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{averageRating}</div>
          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(Number(averageRating))
                      ? 'fill-secondary text-secondary'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
          </div>
        </div>
        {user && !userHasReviewed && !showForm && (
          <Button onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= rating
                          ? 'fill-secondary text-secondary'
                          : 'text-muted hover:text-secondary'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Comment (optional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {editingReview ? 'Update Review' : 'Submit Review'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setEditingReview(null);
                  setRating(5);
                  setComment('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{review.profile?.full_name || 'Anonymous'}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-secondary text-secondary'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {user && user.id === review.user_id && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(review)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(review.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
            {review.comment && (
              <p className="mt-3 text-muted-foreground">{review.comment}</p>
            )}
          </Card>
        ))}
        {reviews.length === 0 && !loading && (
          <p className="text-center text-muted-foreground py-8">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;

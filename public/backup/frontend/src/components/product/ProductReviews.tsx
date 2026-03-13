import React, { useState, useEffect } from 'react';
import { Star, User, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { reviewsApi, type ReviewDto } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewDto | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchReviews(); }, [productId]);

  const fetchReviews = async () => {
    try {
      const data = await reviewsApi.getByProduct(productId);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to leave a review'); return; }
    setSubmitting(true);
    try {
      if (editingReview) {
        await reviewsApi.update(editingReview.id, { rating, comment });
        toast.success('Review updated!');
        setEditingReview(null);
      } else {
        await reviewsApi.create({ productId, rating, comment });
        toast.success('Review submitted!');
      }
      setShowForm(false); setRating(5); setComment('');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await reviewsApi.delete(reviewId);
      toast.success('Review deleted');
      fetchReviews();
    } catch { toast.error('Failed to delete review'); }
  };

  const handleEdit = (review: ReviewDto) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment || '');
    setShowForm(true);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0';

  const userHasReviewed = user && reviews.some(r => r.userId === user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{averageRating}</div>
          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? 'fill-secondary text-secondary' : 'text-muted'}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
          </div>
        </div>
        {user && !userHasReviewed && !showForm && (<Button onClick={() => setShowForm(true)}>Write a Review</Button>)}
      </div>

      {showForm && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                    <Star className={`w-8 h-8 transition-colors ${star <= rating ? 'fill-secondary text-secondary' : 'text-muted hover:text-secondary'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Comment (optional)</label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." rows={3} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{editingReview ? 'Update Review' : 'Submit Review'}</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingReview(null); setRating(5); setComment(''); }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><User className="w-5 h-5 text-muted-foreground" /></div>
                <div>
                  <p className="font-medium">{review.userName || 'Anonymous'}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">{[1, 2, 3, 4, 5].map(star => (<Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-secondary text-secondary' : 'text-muted'}`} />))}</div>
                    <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {user && user.id === review.userId && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(review)}><Edit2 className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(review.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              )}
            </div>
            {review.comment && (<p className="mt-3 text-muted-foreground">{review.comment}</p>)}
          </Card>
        ))}
        {reviews.length === 0 && !loading && (<p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review this product!</p>)}
      </div>
    </div>
  );
};

export default ProductReviews;

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistApi, type WishlistItemDto } from '@/services/api';
import { toast } from 'sonner';

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await wishlistApi.getAll();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistItems.some(item => item.productId === productId);
  }, [wishlistItems]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }
    const existing = wishlistItems.find(item => item.productId === productId);
    if (existing) {
      try {
        await wishlistApi.remove(existing.id);
        setWishlistItems(prev => prev.filter(item => item.id !== existing.id));
        toast.success('Removed from wishlist');
      } catch {
        toast.error('Failed to remove from wishlist');
      }
    } else {
      try {
        const newItem = await wishlistApi.add(productId);
        setWishlistItems(prev => [...prev, newItem]);
        toast.success('Added to wishlist');
      } catch {
        toast.error('Failed to add to wishlist');
      }
    }
  }, [user, wishlistItems]);

  return { wishlistItems, loading, isInWishlist, toggleWishlist, refetch: fetchWishlist };
};
import { useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    try {
      const data = await wishlistApi.getAll();
      setWishlistItems(data.map(item => item.productId));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId: string) => wishlistItems.includes(productId);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      if (isInWishlist(productId)) {
        await wishlistApi.remove(productId);
        setWishlistItems(prev => prev.filter(id => id !== productId));
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.add(productId);
        setWishlistItems(prev => [...prev, productId]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  return { wishlistItems, isInWishlist, toggleWishlist, loading, refetch: fetchWishlist };
};

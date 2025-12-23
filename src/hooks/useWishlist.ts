import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
}

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      setWishlist(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.product_id === productId);
  }, [wishlist]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    const isCurrentlyInWishlist = isInWishlist(productId);

    if (isCurrentlyInWishlist) {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        toast.error('Failed to remove from wishlist');
      } else {
        setWishlist(prev => prev.filter(item => item.product_id !== productId));
        toast.success('Removed from wishlist');
      }
    } else {
      const { data, error } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: productId })
        .select()
        .single();

      if (error) {
        toast.error('Failed to add to wishlist');
      } else {
        setWishlist(prev => [...prev, data]);
        toast.success('Added to wishlist');
      }
    }
  };

  return {
    wishlist,
    loading,
    isInWishlist,
    toggleWishlist,
    refetch: fetchWishlist,
  };
};

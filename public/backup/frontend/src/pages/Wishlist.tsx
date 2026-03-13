import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2, Truck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart, Product } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { wishlistApi, productsApi, type ProductDto } from '@/services/api';
import { toast } from 'sonner';

interface WishlistProduct extends Product {
  wishlist_id: string;
}

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchWishlist();
    else setLoading(false);
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const wishlistData = await wishlistApi.getAll();
      if (!wishlistData.length) { setProducts([]); setLoading(false); return; }

      const productsList: WishlistProduct[] = [];
      for (const item of wishlistData) {
        try {
          const p = await productsApi.getById(item.productId);
          productsList.push({
            id: p.id, name: p.name, nameHi: p.nameHi || p.name, nameMr: p.nameHi || p.name,
            description: p.description || '', price: p.price, originalPrice: p.originalPrice || undefined,
            image: p.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
            category: p.category, stock: p.stock || 0, unit: p.unit || 'kg',
            sellerId: p.sellerId, sellerName: p.sellerName || t('unknownSeller'),
            rating: p.rating || 0, reviews: p.reviews || 0,
            isOrganic: p.isOrganic || false, isFeatured: false,
            freeDelivery: p.freeDelivery || false,
            wishlist_id: item.id,
          });
        } catch { /* product may be deleted */ }
      }
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
    setLoading(false);
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      await wishlistApi.remove(wishlistId);
      setProducts(prev => prev.filter(p => p.wishlist_id !== wishlistId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove from wishlist'); }
  };

  const handleAddToCart = (product: WishlistProduct) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  if (!user) {
    return (<div className="min-h-screen bg-background"><Header /><main className="container mx-auto px-4 py-16 text-center"><Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h1 className="text-2xl font-bold mb-2">{t('login')} {t('wishlist')}</h1><p className="text-muted-foreground mb-4">{t('addToWishlist')}</p><Link to="/login"><Button>{t('login')}</Button></Link></main><Footer /></div>);
  }

  if (loading) {
    return (<div className="min-h-screen bg-background"><Header /><main className="container mx-auto px-4 py-16 text-center"><Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" /><p className="text-muted-foreground">{t('loading')}</p></main><Footer /></div>);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading mb-6"><Heart className="inline-block w-8 h-8 mr-2 text-destructive" />{t('myWishlist')}</h1>
        {products.length === 0 ? (
          <div className="text-center py-16"><Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h2 className="text-xl font-semibold mb-2">{t('emptyWishlist')}</h2><p className="text-muted-foreground mb-4">{t('addToWishlist')}</p><Link to="/products"><Button>{t('products')}</Button></Link></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <Card key={product.id} className="overflow-hidden">
                <Link to={`/product/${product.id}`}><div className="aspect-square bg-muted"><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></div></Link>
                <div className="p-4 space-y-3">
                  <Link to={`/product/${product.id}`}><h3 className="font-semibold hover:text-primary transition-colors">{product.name}</h3></Link>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{product.sellerName}</p>
                    {product.freeDelivery && (<span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full"><Truck className="w-3 h-3" />Free</span>)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">₹{product.price}</span>
                    {product.originalPrice && (<span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>)}
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm" onClick={() => handleAddToCart(product)} disabled={product.stock === 0}><ShoppingCart className="w-4 h-4 mr-1" />{t('addToCart')}</Button>
                    <Button size="sm" variant="outline" onClick={() => removeFromWishlist(product.wishlist_id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;

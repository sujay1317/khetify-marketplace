import React, { memo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/product/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/contexts/CartContext';

const FeaturedProductsSection: React.FC = memo(() => {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_approved', true)
      .limit(8);

    if (!error && data) {
      const sellerIds = [...new Set(data.map(p => p.seller_id))];
      const sellerMap: Record<string, { name: string; freeDelivery: boolean }> = {};
      
      // Use secure RPC function for each seller
      for (const sellerId of sellerIds) {
        const { data: sellerInfo } = await supabase
          .rpc('get_seller_public_info', { seller_user_id: sellerId });
        
        if (sellerInfo && sellerInfo.length > 0) {
          sellerMap[sellerId] = {
            name: sellerInfo[0].full_name || 'Unknown Seller',
            freeDelivery: sellerInfo[0].free_delivery || false,
          };
        } else {
          sellerMap[sellerId] = { name: 'Unknown Seller', freeDelivery: false };
        }
      }

      const products: Product[] = data.map((p) => ({
        id: p.id,
        name: p.name,
        nameHi: p.name_hi || '',
        nameMr: '',
        description: p.description || '',
        price: p.price,
        originalPrice: p.original_price || undefined,
        image: p.image || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
        category: p.category,
        stock: p.stock || 0,
        unit: p.unit || 'kg',
        sellerId: p.seller_id,
        sellerName: sellerMap[p.seller_id]?.name || '',
        rating: 0,
        reviews: 0,
        isOrganic: p.is_organic || false,
        freeDelivery: sellerMap[p.seller_id]?.freeDelivery || false,
      }));
      setFeaturedProducts(products);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('homepage-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading">{t('featured')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('freshPicks')}</p>
          </div>
          <Link to="/products">
            <Button variant="ghost" size="sm" className="gap-2 group">
              {t('viewAll')} 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4 space-y-3 animate-pulse">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </Card>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-card to-muted/50">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No products yet</h3>
            <p className="text-muted-foreground">Check back soon for fresh products!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

FeaturedProductsSection.displayName = 'FeaturedProductsSection';

export default FeaturedProductsSection;

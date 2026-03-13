import React, { memo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/product/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { productsApi, type ProductDto } from '@/services/api';
import { Product } from '@/contexts/CartContext';

const FeaturedProductsSection: React.FC = memo(() => {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsApi.getAll({ approved: true });
      const products: Product[] = data.slice(0, 8).map((p: ProductDto) => ({
        id: p.id, name: p.name, nameHi: p.nameHi || '', nameMr: '',
        description: p.description || '', price: p.price,
        originalPrice: p.originalPrice || undefined,
        image: p.image || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
        category: p.category, stock: p.stock || 0, unit: p.unit || 'kg',
        sellerId: p.sellerId, sellerName: p.sellerName || '',
        rating: p.rating || 0, reviews: p.reviews || 0,
        isOrganic: p.isOrganic || false, freeDelivery: p.freeDelivery || false,
      }));
      setFeaturedProducts(products);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div><h2 className="text-2xl sm:text-3xl font-bold font-heading">{t('featured')}</h2><p className="text-muted-foreground text-sm mt-1">{t('freshPicks')}</p></div>
          <Link to="/products"><Button variant="ghost" size="sm" className="gap-2 group">{t('viewAll')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Button></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">{[...Array(4)].map((_, i) => (<Card key={i} className="p-4 space-y-3 animate-pulse"><Skeleton className="aspect-square w-full rounded-lg" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-8 w-full" /></Card>))}</div>
        ) : featuredProducts.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-card to-muted/50"><Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><h3 className="font-semibold text-lg mb-2">No products yet</h3><p className="text-muted-foreground">Check back soon for fresh products!</p></Card>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">{featuredProducts.map((product, index) => (<div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 75}ms` }}><ProductCard product={product} /></div>))}</div>
        )}
      </div>
    </section>
  );
});

FeaturedProductsSection.displayName = 'FeaturedProductsSection';
export default FeaturedProductsSection;

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Store, Star, Package, Loader2, Truck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usersApi, productsApi, type ProfileDto, type ProductDto } from '@/services/api';
import { Product } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

const SellerStore: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const { t } = useLanguage();
  const [seller, setSeller] = useState<ProfileDto | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProducts: 0, avgRating: 0, totalReviews: 0 });

  useEffect(() => { if (sellerId) fetchSellerData(sellerId); }, [sellerId]);

  const fetchSellerData = async (id: string) => {
    setLoading(true);
    try {
      const sellerInfo = await usersApi.getSellerPublicInfo(id);
      setSeller(sellerInfo);

      const productsData = await productsApi.getBySeller(id);
      const approvedProducts = productsData.filter(p => p.isApproved);
      
      let totalRatingSum = 0, totalReviewCount = 0;
      const transformedProducts: Product[] = approvedProducts.map((p: ProductDto) => {
        totalRatingSum += (p.rating || 0) * (p.reviews || 0);
        totalReviewCount += (p.reviews || 0);
        return {
          id: p.id, name: p.name, nameHi: p.nameHi || p.name, nameMr: p.nameHi || p.name,
          description: p.description || '', price: p.price, originalPrice: p.originalPrice || undefined,
          image: p.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
          category: p.category, stock: p.stock || 0, unit: p.unit || 'kg',
          sellerId: p.sellerId, sellerName: sellerInfo.fullName || t('unknownSeller'),
          rating: p.rating || 0, reviews: p.reviews || 0,
          isOrganic: p.isOrganic || false, isFeatured: false,
          freeDelivery: sellerInfo.freeDelivery || false,
        };
      });

      setProducts(transformedProducts);
      setStats({
        totalProducts: approvedProducts.length,
        avgRating: totalReviewCount > 0 ? totalRatingSum / totalReviewCount : 0,
        totalReviews: totalReviewCount,
      });
    } catch (error) {
      console.error('Error fetching seller:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (<div className="min-h-screen bg-background"><Header /><main className="container mx-auto px-4 py-16 text-center"><Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" /><p className="text-muted-foreground">{t('loading')}</p></main><Footer /></div>);
  }

  if (!seller) {
    return (<div className="min-h-screen bg-background"><Header /><main className="container mx-auto px-4 py-16 text-center"><Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" /><h1 className="text-2xl font-bold mb-2">{t('sellerNotFound')}</h1><Link to="/products" className="text-primary hover:underline">{t('viewAll')} {t('products')} →</Link></main><Footer /></div>);
  }

  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />{t('back')} {t('products')}
        </Link>
        {seller.shopImage && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <img src={seller.shopImage} alt={`${seller.fullName}'s shop`} className="w-full h-48 md:h-64 object-cover" />
          </div>
        )}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src={seller.avatarUrl || undefined} alt={seller.fullName || 'Seller'} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">{getInitials(seller.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Store className="w-5 h-5 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold font-heading">{seller.fullName || t('unknownSeller')}</h1>
              </div>
              {seller.freeDelivery && (<Badge variant="success" className="mb-4 gap-1"><Truck className="w-3.5 h-3.5" />{t('freeDelivery')}</Badge>)}
              <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                <div className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" /><span className="font-semibold">{stats.totalProducts}</span><span className="text-muted-foreground">{t('products')}</span></div>
                <div className="flex items-center gap-2"><Star className="w-5 h-5 fill-secondary text-secondary" /><span className="font-semibold">{stats.avgRating.toFixed(1)}</span><span className="text-muted-foreground">({stats.totalReviews} {t('reviews')})</span></div>
              </div>
            </div>
          </div>
        </Card>
        <section>
          <h2 className="text-xl md:text-2xl font-bold font-heading mb-6">{t('products')} - {seller.fullName || t('seller')}</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">{products.map((product) => (<ProductCard key={product.id} product={product} />))}</div>
          ) : (
            <Card className="p-12 text-center"><Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" /><h3 className="text-lg font-semibold mb-2">{t('noProducts')}</h3><p className="text-muted-foreground">{t('noProductsFound')}</p></Card>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SellerStore;

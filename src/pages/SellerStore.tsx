import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Store, Star, Package, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/contexts/CartContext';

interface SellerProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

const SellerStore: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProducts: 0, avgRating: 0, totalReviews: 0 });

  useEffect(() => {
    if (sellerId) {
      fetchSellerData(sellerId);
    }
  }, [sellerId]);

  const fetchSellerData = async (id: string) => {
    setLoading(true);

    // Fetch seller profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();

    if (profileError || !profileData) {
      console.error('Error fetching seller:', profileError);
      setLoading(false);
      return;
    }

    setSeller(profileData);

    // Fetch seller's approved products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      setLoading(false);
      return;
    }

    if (!productsData || productsData.length === 0) {
      setProducts([]);
      setStats({ totalProducts: 0, avgRating: 0, totalReviews: 0 });
      setLoading(false);
      return;
    }

    // Fetch reviews for all products
    const productIds = productsData.map(p => p.id);
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('product_id, rating')
      .in('product_id', productIds);

    // Calculate ratings
    const ratingsMap: Record<string, { avg: number; count: number }> = {};
    let totalRatingSum = 0;
    let totalReviewCount = 0;

    reviewsData?.forEach((review: { product_id: string; rating: number }) => {
      if (!ratingsMap[review.product_id]) {
        ratingsMap[review.product_id] = { avg: 0, count: 0 };
      }
      ratingsMap[review.product_id].count += 1;
      ratingsMap[review.product_id].avg += review.rating;
      totalRatingSum += review.rating;
      totalReviewCount += 1;
    });

    Object.keys(ratingsMap).forEach(productId => {
      ratingsMap[productId].avg = ratingsMap[productId].avg / ratingsMap[productId].count;
    });

    // Transform products
    const transformedProducts: Product[] = productsData.map((p) => ({
      id: p.id,
      name: p.name,
      nameHi: p.name_hi || p.name,
      nameMr: p.name_hi || p.name,
      description: p.description || '',
      price: p.price,
      originalPrice: p.original_price || undefined,
      image: p.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
      category: p.category,
      stock: p.stock || 0,
      unit: p.unit || 'kg',
      sellerId: p.seller_id,
      sellerName: profileData.full_name || 'Unknown Seller',
      rating: ratingsMap[p.id]?.avg || 0,
      reviews: ratingsMap[p.id]?.count || 0,
      isOrganic: p.is_organic || false,
      isFeatured: false,
    }));

    setProducts(transformedProducts);
    setStats({
      totalProducts: productsData.length,
      avgRating: totalReviewCount > 0 ? totalRatingSum / totalReviewCount : 0,
      totalReviews: totalReviewCount,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading seller store...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Seller not found</h1>
          <p className="text-muted-foreground mb-6">The seller you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="text-primary hover:underline">
            Browse all products →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Back Link */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        {/* Seller Header */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src={seller.avatar_url || undefined} alt={seller.full_name || 'Seller'} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials(seller.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Store className="w-5 h-5 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold font-heading">
                  {seller.full_name || 'Unknown Seller'}
                </h1>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Seller since {new Date(seller.created_at).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{stats.totalProducts}</span>
                  <span className="text-muted-foreground">Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-secondary text-secondary" />
                  <span className="font-semibold">{stats.avgRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({stats.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Products Grid */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold font-heading mb-6">
            Products by {seller.full_name || 'this seller'}
          </h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No products available</h3>
              <p className="text-muted-foreground">
                This seller hasn't listed any products yet.
              </p>
            </Card>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SellerStore;

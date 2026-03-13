import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Store, Package, Star, Search, Truck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SellerWithStats {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  shop_image: string | null;
  free_delivery: boolean | null;
  created_at: string;
  product_count: number;
  avg_rating: number;
}

const Sellers: React.FC = () => {
  const { t } = useLanguage();
  const [sellers, setSellers] = useState<SellerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSellers = useMemo(() => {
    if (!searchQuery.trim()) return sellers;
    const query = searchQuery.toLowerCase();
    return sellers.filter(seller => 
      seller.full_name?.toLowerCase().includes(query)
    );
  }, [sellers, searchQuery]);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      // Get all seller user_ids
      const { data: sellerRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'seller');

      if (rolesError) throw rolesError;

      if (!sellerRoles || sellerRoles.length === 0) {
        setSellers([]);
        setLoading(false);
        return;
      }

      const sellerIds = sellerRoles.map(r => r.user_id);

      // Get seller profiles using the secure function
      const sellersWithStats: SellerWithStats[] = [];

      for (const sellerId of sellerIds) {
        // Use the security definer function to get seller public info
        const { data: sellerInfo, error: sellerError } = await supabase
          .rpc('get_seller_public_info', { seller_user_id: sellerId });

        if (sellerError) {
          console.error('Error fetching seller info:', sellerError);
          continue;
        }

        const profile = sellerInfo?.[0];
        if (!profile) continue;

        // Get product count
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', sellerId)
          .eq('is_approved', true);

        // Get average rating from reviews
        const { data: products } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', sellerId)
          .eq('is_approved', true);

        let avgRating = 0;
        if (products && products.length > 0) {
          const productIds = products.map(p => p.id);
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .in('product_id', productIds);

          if (reviews && reviews.length > 0) {
            avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          }
        }

        sellersWithStats.push({
          user_id: profile.user_id,
          full_name: profile.full_name,
          avatar_url: null, // Not exposed by secure function
          shop_image: profile.shop_image,
          free_delivery: profile.free_delivery,
          created_at: '',
          product_count: productCount || 0,
          avg_rating: avgRating
        });
      }

      setSellers(sellersWithStats);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('ourSellers')}</h1>
          <p className="text-muted-foreground mb-4">{t('discoverSellers')}</p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('searchSellers')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? t('noSellersFound') : t('noSellersYet')}
            </h2>
            <p className="text-muted-foreground">
              {searchQuery ? t('tryDifferentSearch') : t('checkBackLater')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredSellers.map((seller) => (
              <Link key={seller.user_id} to={`/store/${seller.user_id}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group">
                  {/* Shop Image Banner */}
                  <div className="w-full h-24 overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20">
                    {seller.shop_image ? (
                      <img 
                        src={seller.shop_image} 
                        alt={`${seller.full_name}'s shop`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-8 h-8 text-primary/40" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4 flex flex-col items-center text-center pt-2">
                    <Avatar className="w-16 h-16 mb-3 ring-2 ring-primary/20 -mt-10 border-4 border-background shadow-md">
                      <AvatarImage src={seller.avatar_url || undefined} alt={seller.full_name || 'Seller'} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(seller.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">
                      {seller.full_name || t('seller')}
                    </h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        <Store className="w-3 h-3 mr-1" />
                        {t('seller')}
                      </Badge>
                      {seller.free_delivery && (
                        <Badge variant="outline" className="text-xs text-accent border-accent/50">
                          <Truck className="w-3 h-3 mr-1" />
                          {t('freeDelivery')}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {seller.product_count}
                      </span>
                      {seller.avg_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-secondary text-secondary" />
                          {seller.avg_rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Sellers;

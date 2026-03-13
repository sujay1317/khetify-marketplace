import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usersApi, type ProfileDto } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Store, Package, Star, Search, Truck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SellerWithStats extends ProfileDto {
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
    return sellers.filter(seller => seller.fullName?.toLowerCase().includes(query));
  }, [sellers, searchQuery]);

  useEffect(() => { fetchSellers(); }, []);

  const fetchSellers = async () => {
    try {
      const sellersData = await usersApi.getSellers();
      // The backend should return seller profiles with stats
      const sellersWithStats: SellerWithStats[] = sellersData.map(s => ({
        ...s,
        product_count: 0, // Backend should include this
        avg_rating: 0,
      }));
      setSellers(sellersWithStats);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | undefined | null) => {
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
            <Input type="text" placeholder={t('searchSellers')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredSellers.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">{searchQuery ? t('noSellersFound') : t('noSellersYet')}</h2>
            <p className="text-muted-foreground">{searchQuery ? t('tryDifferentSearch') : t('checkBackLater')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredSellers.map((seller) => (
              <Link key={seller.userId} to={`/store/${seller.userId}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group">
                  <div className="w-full h-24 overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20">
                    {seller.shopImage ? (
                      <img src={seller.shopImage} alt={`${seller.fullName}'s shop`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Store className="w-8 h-8 text-primary/40" /></div>
                    )}
                  </div>
                  <CardContent className="p-4 flex flex-col items-center text-center pt-2">
                    <Avatar className="w-16 h-16 mb-3 ring-2 ring-primary/20 -mt-10 border-4 border-background shadow-md">
                      <AvatarImage src={seller.avatarUrl || undefined} alt={seller.fullName || 'Seller'} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(seller.fullName)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">{seller.fullName || t('seller')}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Badge variant="secondary" className="text-xs"><Store className="w-3 h-3 mr-1" />{t('seller')}</Badge>
                      {seller.freeDelivery && (
                        <Badge variant="outline" className="text-xs text-accent border-accent/50"><Truck className="w-3 h-3 mr-1" />{t('freeDelivery')}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Package className="w-3 h-3" />{seller.product_count}</span>
                      {seller.avg_rating > 0 && (
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-secondary text-secondary" />{seller.avg_rating.toFixed(1)}</span>
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

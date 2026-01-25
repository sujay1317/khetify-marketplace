import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, Store, Sprout, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const SellerDashboard: React.FC = memo(() => {
  const { profile, user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ products: 0, pendingOrders: 0 });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    // Get product count
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id);

    // Get pending orders count
    const { count: orderCount } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id);

    setStats({
      products: productCount || 0,
      pendingOrders: orderCount || 0,
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const quickActions = [
    { icon: Package, label: t('myProducts') || 'My Products', path: '/seller', color: 'from-emerald-500 to-green-600', stat: stats.products },
    { icon: TrendingUp, label: t('orders') || 'Orders', path: '/seller', color: 'from-blue-500 to-indigo-600', stat: stats.pendingOrders },
    { icon: Store, label: t('viewStore') || 'View Store', path: `/store/${user?.id}`, color: 'from-purple-500 to-pink-500' },
    { icon: Sprout, label: t('farmerCorner') || 'Farmer Corner', path: '/farmer-corner', color: 'from-lime-500 to-green-500' },
  ];

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 ring-2 ring-emerald-500/30">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-emerald-600 text-white text-lg font-semibold">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl sm:text-2xl font-heading">
                      {t('goodMorning')}, {profile?.full_name?.split(' ')[0] || t('seller')}! 🌾
                    </CardTitle>
                    <Badge variant="default" className="bg-emerald-600">{t('seller')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('manageListings') || 'Manage your products and orders'}
                  </p>
                </div>
              </div>
              <Link to="/seller">
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4" />
                  {t('addProduct')}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Link key={action.path + action.label} to={action.path}>
                  <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md`}>
                        <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">{action.label}</span>
                      {action.stat !== undefined && (
                        <Badge variant="secondary" className="text-xs">{action.stat}</Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
});

SellerDashboard.displayName = 'SellerDashboard';

export default SellerDashboard;
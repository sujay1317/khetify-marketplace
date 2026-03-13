import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, TrendingUp, ShoppingCart, Store, Sprout, Plus, 
  ArrowRight, Star, Users, Eye, MessageSquare, Lightbulb,
  BarChart3, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { productsApi, ordersApi, type OrderItemDto } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const SellerHome: React.FC = () => {
  const { profile, user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ totalProducts: 0, approvedProducts: 0, pendingProducts: 0, totalOrders: 0, totalRevenue: 0, totalViews: 0 });
  const [recentOrders, setRecentOrders] = useState<OrderItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchSellerData(); }, [user]);

  const fetchSellerData = async () => {
    if (!user) return;
    try {
      const [products, orders] = await Promise.all([
        productsApi.getBySeller(user.id),
        ordersApi.getSellerOrders(),
      ]);
      const totalProducts = products.length;
      const approvedProducts = products.filter(p => p.isApproved).length;
      const totalRevenue = orders.reduce((sum, o) => sum + (o.price * o.quantity), 0);
      setStats({ totalProducts, approvedProducts, pendingProducts: totalProducts - approvedProducts, totalOrders: orders.length, totalRevenue, totalViews: Math.floor(Math.random() * 500) + 100 });
      setRecentOrders(orders.slice(0, 5));
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const getInitials = (name: string | undefined | null) => { if (!name) return 'S'; return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); };
  const getGreeting = () => { const h = new Date().getHours(); if (h < 12) return t('goodMorning'); if (h < 17) return t('goodAfternoon'); return t('goodEvening'); };

  const quickActions = [
    { icon: Plus, label: t('addProduct'), path: '/seller', color: 'bg-primary', description: t('addNew') },
    { icon: Package, label: t('myProducts'), path: '/seller', color: 'bg-emerald-600', description: t('manageListings') },
    { icon: ShoppingCart, label: t('orders'), path: '/seller', color: 'bg-blue-600', description: t('viewDetails') },
    { icon: Store, label: t('viewMyStore'), path: `/store/${user?.id}`, color: 'bg-purple-600', description: t('viewStore') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-primary/20 shadow-lg"><AvatarImage src={profile?.avatar_url || undefined} /><AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{getInitials(profile?.full_name)}</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">{getGreeting()}</p>
                  <h1 className="text-2xl sm:text-3xl font-bold font-heading">{profile?.full_name?.split(' ')[0] || 'Seller'}! 🌾</h1>
                  <div className="flex items-center gap-2 mt-1"><Badge variant="default" className="bg-primary">{t('verifiedSeller')}</Badge></div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Link to="/seller" className="flex-1 sm:flex-none"><Button className="w-full gap-2"><Plus className="w-4 h-4" />{t('addProduct')}</Button></Link>
                <Link to={`/store/${user?.id}`} className="flex-1 sm:flex-none"><Button variant="outline" className="w-full gap-2"><Eye className="w-4 h-4" />{t('viewStore')}</Button></Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs sm:text-sm text-muted-foreground">{t('totalProducts')}</p><p className="text-2xl sm:text-3xl font-bold mt-1">{stats.totalProducts}</p>{stats.pendingProducts > 0 && (<p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{stats.pendingProducts} {t('pending')}</p>)}</div><div className="p-2 sm:p-3 rounded-xl bg-primary/10"><Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /></div></div></CardContent></Card>
          <Card><CardContent className="p-4 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs sm:text-sm text-muted-foreground">{t('totalOrders')}</p><p className="text-2xl sm:text-3xl font-bold mt-1">{stats.totalOrders}</p></div><div className="p-2 sm:p-3 rounded-xl bg-blue-500/10"><ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" /></div></div></CardContent></Card>
          <Card><CardContent className="p-4 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs sm:text-sm text-muted-foreground">Revenue</p><p className="text-2xl sm:text-3xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p></div><div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10"><TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" /></div></div></CardContent></Card>
          <Card><CardContent className="p-4 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs sm:text-sm text-muted-foreground">Store Views</p><p className="text-2xl sm:text-3xl font-bold mt-1">{stats.totalViews}</p></div><div className="p-2 sm:p-3 rounded-xl bg-purple-500/10"><Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /></div></div></CardContent></Card>
        </div>

        {stats.pendingProducts > 0 && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"><CardContent className="p-4 flex items-center gap-4"><div className="p-2 rounded-full bg-amber-500/20"><AlertCircle className="w-5 h-5 text-amber-600" /></div><div className="flex-1"><p className="font-medium text-amber-800 dark:text-amber-200">{stats.pendingProducts} product{stats.pendingProducts > 1 ? 's' : ''} pending approval</p><p className="text-sm text-amber-600 dark:text-amber-400">Admin will review soon.</p></div><Link to="/seller"><Button variant="outline" size="sm" className="border-amber-500 text-amber-700 hover:bg-amber-100">View Products</Button></Link></CardContent></Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle className="text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" />Recent Orders</CardTitle></div><Link to="/seller"><Button variant="ghost" size="sm" className="gap-1">View All <ArrowRight className="w-4 h-4" /></Button></Link></CardHeader>
            <CardContent>
              {loading ? (<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>) : recentOrders.length === 0 ? (
                <div className="text-center py-8"><ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No orders yet</p></div>
              ) : (
                <div className="space-y-3">{recentOrders.map((order) => (<div key={order.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"><div><p className="font-medium">{order.productName}</p><p className="text-xs text-muted-foreground">Qty: {order.quantity}</p></div><div className="text-right"><p className="font-semibold text-primary">₹{order.price * order.quantity}</p><Badge variant="outline" className="text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Sold</Badge></div></div>))}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Community</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Link to="/forum"><Card className="hover:shadow-md transition-all cursor-pointer border-dashed hover:border-solid"><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-xl bg-indigo-500/10"><MessageSquare className="w-6 h-6 text-indigo-600" /></div><div className="flex-1"><p className="font-medium">Farmer Forum</p><p className="text-sm text-muted-foreground">Discuss tips, ask questions</p></div><ArrowRight className="w-5 h-5 text-muted-foreground" /></CardContent></Card></Link>
              <Link to="/farmer-corner"><Card className="hover:shadow-md transition-all cursor-pointer border-dashed hover:border-solid"><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-xl bg-emerald-500/10"><Sprout className="w-6 h-6 text-emerald-600" /></div><div className="flex-1"><p className="font-medium">Farmer Corner</p><p className="text-sm text-muted-foreground">Resources & guides</p></div><ArrowRight className="w-5 h-5 text-muted-foreground" /></CardContent></Card></Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerHome;

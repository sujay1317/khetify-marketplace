import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, TrendingUp, ShoppingCart, Store, Sprout, Plus, 
  ArrowRight, Bell, Star, Users, Eye, MessageSquare, Lightbulb,
  BarChart3, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SellerStats {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalViews: number;
}

interface RecentOrder {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

const SellerHome: React.FC = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalViews: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSellerData();
    }
  }, [user]);

  const fetchSellerData = async () => {
    if (!user) return;

    try {
      // Fetch products
      const { data: products } = await supabase
        .from('products')
        .select('id, is_approved')
        .eq('seller_id', user.id);

      // Fetch orders
      const { data: orders } = await supabase
        .from('order_items')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const totalProducts = products?.length || 0;
      const approvedProducts = products?.filter(p => p.is_approved).length || 0;
      const pendingProducts = totalProducts - approvedProducts;
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.price * o.quantity), 0) || 0;

      setStats({
        totalProducts,
        approvedProducts,
        pendingProducts,
        totalOrders: orders?.length || 0,
        totalRevenue,
        totalViews: Math.floor(Math.random() * 500) + 100 // Placeholder
      });

      setRecentOrders(orders || []);
    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    { icon: Plus, label: 'Add Product', path: '/seller', color: 'bg-primary', description: 'List a new product' },
    { icon: Package, label: 'My Products', path: '/seller', color: 'bg-emerald-600', description: 'Manage listings' },
    { icon: ShoppingCart, label: 'Orders', path: '/seller', color: 'bg-blue-600', description: 'View orders' },
    { icon: Store, label: 'My Store', path: `/store/${user?.id}`, color: 'bg-purple-600', description: 'Public store page' },
  ];

  const sellerTips = [
    { icon: Lightbulb, tip: 'Add high-quality photos to increase sales by 40%', type: 'tip' },
    { icon: Star, tip: 'Respond quickly to customer queries for better ratings', type: 'tip' },
    { icon: TrendingUp, tip: 'Organic products are trending this season', type: 'insight' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-primary/20 shadow-lg">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">{getGreeting()}</p>
                  <h1 className="text-2xl sm:text-3xl font-bold font-heading">
                    {profile?.full_name?.split(' ')[0] || 'Seller'}! 🌾
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="bg-primary">Verified Seller</Badge>
                    {stats.approvedProducts > 0 && (
                      <Badge variant="outline" className="border-primary/50">
                        {stats.approvedProducts} Active Listings
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Link to="/seller" className="flex-1 sm:flex-none">
                  <Button className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </Link>
                <Link to={`/store/${user?.id}`} className="flex-1 sm:flex-none">
                  <Button variant="outline" className="w-full gap-2">
                    <Eye className="w-4 h-4" />
                    View Store
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.totalProducts}</p>
                  {stats.pendingProducts > 0 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {stats.pendingProducts} pending
                    </p>
                  )}
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.totalOrders}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-blue-500/10">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Store Views</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.totalViews}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-purple-500/10">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approval Alert */}
        {stats.pendingProducts > 0 && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-full bg-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {stats.pendingProducts} product{stats.pendingProducts > 1 ? 's' : ''} pending approval
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Admin will review your products soon. Usually takes 24-48 hours.
                </p>
              </div>
              <Link to="/seller">
                <Button variant="outline" size="sm" className="border-amber-500 text-amber-700 hover:bg-amber-100">
                  View Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Manage your store efficiently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <Link key={action.label} to={action.path}>
                    <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer h-full border-dashed hover:border-solid">
                      <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center shadow-md`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips & Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Tips & Insights
              </CardTitle>
              <CardDescription>Grow your sales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sellerTips.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${item.type === 'insight' ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}
                >
                  <div className="flex gap-3">
                    <item.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${item.type === 'insight' ? 'text-blue-600' : 'text-amber-600'}`} />
                    <p className="text-sm">{item.tip}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders & Community */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Your latest sales</CardDescription>
              </div>
              <Link to="/seller">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add products to start receiving orders
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {order.quantity} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">₹{order.price * order.quantity}</p>
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Sold
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community & Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Community & Resources
              </CardTitle>
              <CardDescription>Connect with other farmers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/forum">
                <Card className="hover:shadow-md transition-all cursor-pointer border-dashed hover:border-solid">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-500/10">
                      <MessageSquare className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Farmer Forum</p>
                      <p className="text-sm text-muted-foreground">Discuss tips, ask questions</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/farmer-corner">
                <Card className="hover:shadow-md transition-all cursor-pointer border-dashed hover:border-solid">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                      <Sprout className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Farmer Corner</p>
                      <p className="text-sm text-muted-foreground">Resources & guides</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/sellers">
                <Card className="hover:shadow-md transition-all cursor-pointer border-dashed hover:border-solid">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <Store className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">All Sellers</p>
                      <p className="text-sm text-muted-foreground">See other sellers</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion */}
        <Card className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Complete Your Profile
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A complete profile helps build trust with customers
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Profile Completion</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
              <Link to="/profile">
                <Button variant="outline" className="gap-2">
                  Complete Profile
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SellerHome;

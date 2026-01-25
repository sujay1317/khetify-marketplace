import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingCart, BarChart3, Shield, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ 
    users: 0, 
    products: 0, 
    orders: 0, 
    pendingProducts: 0 
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Get user count
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get product count
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get pending products
    const { count: pendingCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false);

    // Get order count
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    setStats({
      users: userCount || 0,
      products: productCount || 0,
      orders: orderCount || 0,
      pendingProducts: pendingCount || 0,
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const quickActions = [
    { icon: Users, label: 'Manage Users', path: '/admin/users', color: 'from-blue-500 to-indigo-600', stat: stats.users },
    { icon: Package, label: 'Products', path: '/admin', color: 'from-emerald-500 to-green-600', stat: stats.products, badge: stats.pendingProducts > 0 ? `${stats.pendingProducts} pending` : undefined },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders', color: 'from-orange-500 to-red-500', stat: stats.orders },
    { icon: BarChart3, label: 'Analytics', path: '/admin', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 ring-2 ring-purple-500/30">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-pink-600 text-white text-lg font-semibold">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl sm:text-2xl font-heading">
                      Welcome, {profile?.full_name?.split(' ')[0] || 'Admin'}! 👑
                    </CardTitle>
                    <Badge variant="destructive">Admin</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your platform and monitor activity
                  </p>
                </div>
              </div>
              <Link to="/admin">
                <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
                  <Settings className="w-4 h-4" />
                  Admin Panel
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
                      <div className="flex flex-col items-center gap-1">
                        {action.stat !== undefined && (
                          <Badge variant="secondary" className="text-xs">{action.stat}</Badge>
                        )}
                        {action.badge && (
                          <Badge variant="destructive" className="text-[10px]">{action.badge}</Badge>
                        )}
                      </div>
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
};

export default AdminDashboard;
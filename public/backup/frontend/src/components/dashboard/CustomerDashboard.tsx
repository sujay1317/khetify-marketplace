import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CustomerDashboardProps {
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ profile }) => {
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const quickActions = [
    { icon: Package, label: 'My Orders', path: '/orders', color: 'from-blue-500 to-blue-600' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist', color: 'from-pink-500 to-rose-500' },
    { icon: ShoppingBag, label: 'Shop Now', path: '/products', color: 'from-primary to-accent' },
    { icon: Star, label: 'My Reviews', path: '/orders', color: 'from-yellow-500 to-orange-500' },
  ];

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 sm:w-16 sm:h-16 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-heading">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'Customer'}! 👋
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Ready to explore fresh products today?
                </p>
              </div>
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

export default CustomerDashboard;
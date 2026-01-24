import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  status: string | null;
  total: number;
  payment_method: string | null;
  shipping_address: any;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

const CustomerOrders: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Realtime subscription for order updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('customer-orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Order updated:', payload);
          // Update the specific order in state
          setOrders(prev => prev.map(order => 
            order.id === payload.new.id 
              ? { ...order, ...payload.new } 
              : order
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New order:', payload);
          setOrders(prev => [payload.new as Order, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      setLoading(false);
      return;
    }

    setOrders(ordersData || []);

    // Fetch order items for each order
    if (ordersData && ordersData.length > 0) {
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', ordersData.map(o => o.id));

      if (itemsData) {
        const itemsByOrder: Record<string, OrderItem[]> = {};
        itemsData.forEach(item => {
          if (!itemsByOrder[item.order_id]) {
            itemsByOrder[item.order_id] = [];
          }
          itemsByOrder[item.order_id].push(item);
        });
        setOrderItems(itemsByOrder);
      }
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-secondary" />;
      case 'confirmed':
        return <Package className="w-5 h-5 text-primary" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-accent" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'bg-secondary/20 text-secondary-foreground';
      case 'confirmed':
        return 'bg-primary/20 text-primary';
      case 'shipped':
        return 'bg-accent/20 text-accent';
      case 'delivered':
        return 'bg-accent/20 text-accent';
      case 'cancelled':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('login')}</h1>
          <p className="text-muted-foreground mb-6">{t('login')} {t('orders')}</p>
          <Link to="/login">
            <Button>{t('login')}</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-heading mb-6">{t('orders')}</h1>

        {loading ? (
          <div className="text-center py-12">{t('loading')}</div>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noOrders')}</h3>
            <p className="text-muted-foreground mb-6">{t('continueShopping')}</p>
            <Link to="/products">
              <Button>{t('shopNow')}</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-semibold">{t('orderNumber')}{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status ? t(order.status) : t('pending')}
                    </Badge>
                    <span className="font-bold text-lg">₹{order.total}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    {orderItems[order.id]?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Progress */}
                {order.status !== 'cancelled' && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute top-3 left-0 right-0 h-0.5 bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width:
                              order.status === 'pending' ? '0%' :
                              order.status === 'confirmed' ? '33%' :
                              order.status === 'shipped' ? '66%' :
                              order.status === 'delivered' ? '100%' : '0%'
                          }}
                        />
                      </div>
                      {[
                        { key: 'pending', label: t('pending') },
                        { key: 'confirmed', label: t('confirmed') },
                        { key: 'shipped', label: t('shipped') },
                        { key: 'delivered', label: t('delivered') }
                      ].map((step, idx) => {
                        const isActive = 
                          (order.status === 'pending' && idx === 0) ||
                          (order.status === 'confirmed' && idx <= 1) ||
                          (order.status === 'shipped' && idx <= 2) ||
                          (order.status === 'delivered' && idx <= 3);
                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className="text-xs mt-1">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                  <span>{t('payment')}: {order.payment_method?.toUpperCase() || 'COD'}</span>
                  {order.shipping_address && (
                    <span>
                      {t('delivery')}: {order.shipping_address.city}, {order.shipping_address.state}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerOrders;

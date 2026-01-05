import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ChevronDown, ChevronUp, MapPin, Phone, User, Package } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ShippingAddress {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  seller_id: string | null;
}

interface Order {
  id: string;
  customer_id: string;
  status: string | null;
  total: number;
  payment_method: string | null;
  created_at: string;
  shipping_address: ShippingAddress | null;
}

interface CustomerProfile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
}

const ManageOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [customerProfiles, setCustomerProfiles] = useState<Record<string, CustomerProfile>>({});
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Parse shipping_address from JSON
      const parsedOrders = data.map(order => ({
        ...order,
        shipping_address: order.shipping_address as ShippingAddress | null
      }));
      setOrders(parsedOrders);

      // Fetch customer profiles
      const customerIds = [...new Set(data.map(o => o.customer_id))];
      if (customerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, phone')
          .in('user_id', customerIds);

        if (profiles) {
          const profileMap: Record<string, CustomerProfile> = {};
          profiles.forEach(p => {
            profileMap[p.user_id] = p;
          });
          setCustomerProfiles(profileMap);
        }
      }
    }
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return; // Already fetched

    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (!error && data) {
      setOrderItems(prev => ({ ...prev, [orderId]: data }));
    }
  };

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      fetchOrderItems(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update order status');
    } else {
      toast.success('Order status updated');
      fetchOrders();
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'shipped': return 'secondary';
      case 'confirmed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold font-heading">Manage Orders</h1>
            </div>
            <Badge variant="outline" className="ml-auto">
              {orders.length} orders
            </Badge>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const customer = customerProfiles[order.customer_id];
                const items = orderItems[order.id] || [];
                const shippingAddress = order.shipping_address;

                return (
                  <Card key={order.id} className="overflow-hidden">
                    <Collapsible open={isExpanded} onOpenChange={() => toggleOrderExpanded(order.id)}>
                      <CollapsibleTrigger asChild>
                        <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                                <div>
                                  <p className="font-mono font-semibold text-sm">
                                    #{order.id.slice(0, 8).toUpperCase()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(order.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="hidden sm:block">
                                <p className="text-sm font-medium">
                                  {shippingAddress?.fullName || customer?.full_name || 'Unknown Customer'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {shippingAddress?.city || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right hidden md:block">
                                <p className="font-bold text-lg">₹{order.total}</p>
                                <p className="text-xs text-muted-foreground uppercase">
                                  {order.payment_method || 'N/A'}
                                </p>
                              </div>
                              
                              <Badge variant={getStatusColor(order.status)}>
                                {order.status || 'pending'}
                              </Badge>

                              <Select
                                value={order.status || 'pending'}
                                onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="border-t bg-muted/30 p-4">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Shipping Address */}
                            <div>
                              <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-primary" />
                                Shipping Address
                              </h4>
                              {shippingAddress ? (
                                <div className="bg-background rounded-lg p-4 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{shippingAddress.fullName || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span>{shippingAddress.phone || 'N/A'}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground pl-6">
                                    {shippingAddress.address || 'N/A'}
                                  </p>
                                  <p className="text-sm text-muted-foreground pl-6">
                                    {[shippingAddress.city, shippingAddress.state, shippingAddress.pincode]
                                      .filter(Boolean)
                                      .join(', ') || 'N/A'}
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-background rounded-lg p-4 text-center text-muted-foreground">
                                  No shipping address available
                                </div>
                              )}

                              {/* Customer Info from Profile */}
                              {customer && (
                                <div className="mt-4">
                                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-primary" />
                                    Customer Account
                                  </h4>
                                  <div className="bg-background rounded-lg p-3 text-sm">
                                    <p>Name: {customer.full_name || 'Not set'}</p>
                                    <p>Phone: {customer.phone || 'Not set'}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      ID: {order.customer_id.slice(0, 8)}...
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                <Package className="w-4 h-4 text-primary" />
                                Order Items
                              </h4>
                              {items.length === 0 ? (
                                <div className="bg-background rounded-lg p-4 text-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                  <p className="text-xs text-muted-foreground mt-2">Loading items...</p>
                                </div>
                              ) : (
                                <div className="bg-background rounded-lg divide-y">
                                  {items.map((item) => (
                                    <div key={item.id} className="p-3 flex justify-between items-center">
                                      <div>
                                        <p className="font-medium text-sm">{item.product_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Qty: {item.quantity} × ₹{item.price}
                                        </p>
                                      </div>
                                      <p className="font-semibold">₹{item.quantity * item.price}</p>
                                    </div>
                                  ))}
                                  <div className="p-3 flex justify-between items-center bg-muted/50">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold text-primary">₹{order.total}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageOrders;
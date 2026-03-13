import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ChevronDown, ChevronUp, MapPin, Phone, User, Package, Store } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ordersApi, type OrderDto, type OrderItemDto } from '@/services/api';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ManageOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItemDto[]>>({});
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);
  // Poll every 30 seconds (replaces realtime)
  useEffect(() => { const i = setInterval(fetchOrders, 30000); return () => clearInterval(i); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try { const data = await ordersApi.getAll(); setOrders(data); }
    catch (error) { console.error('Error:', error); }
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    try { const data = await ordersApi.getOrderItems(orderId); setOrderItems(prev => ({ ...prev, [orderId]: data })); }
    catch { /* ignore */ }
  };

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) newExpanded.delete(orderId);
    else { newExpanded.add(orderId); fetchOrderItems(orderId); }
    setExpandedOrders(newExpanded);
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try { await ordersApi.updateStatus(id, status); toast.success('Order status updated'); fetchOrders(); }
    catch { toast.error('Failed to update'); }
  };

  const getStatusColor = (status: string | null): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) { case 'delivered': return 'default'; case 'shipped': return 'secondary'; case 'confirmed': return 'outline'; case 'cancelled': return 'destructive'; default: return 'secondary'; }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}><ArrowLeft className="w-5 h-5" /></Button>
            <div className="flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-primary" /><h1 className="text-2xl font-bold font-heading">Manage Orders</h1></div>
            <Badge variant="outline" className="ml-auto">{orders.length} orders</Badge>
          </div>

          {loading ? (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>) : orders.length === 0 ? (
            <Card className="p-12 text-center"><ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No orders found</p></Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const items = orderItems[order.id] || [];
                const shippingAddress = order.shippingAddress;
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <Collapsible open={isExpanded} onOpenChange={() => toggleOrderExpanded(order.id)}>
                      <CollapsibleTrigger asChild>
                        <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                                <div><p className="font-mono font-semibold text-sm">#{order.id.slice(0, 8).toUpperCase()}</p><p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p></div>
                              </div>
                              <div className="hidden sm:block"><p className="text-sm font-medium">{shippingAddress?.fullName || 'Unknown'}</p><p className="text-xs text-muted-foreground">{shippingAddress?.city || 'N/A'}</p></div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right hidden md:block"><p className="font-bold text-lg">₹{order.total}</p><p className="text-xs text-muted-foreground uppercase">{order.paymentMethod || 'N/A'}</p></div>
                              <Badge variant={getStatusColor(order.status)}>{order.status || 'pending'}</Badge>
                              <Select value={order.status || 'pending'} onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}>
                                <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="shipped">Shipped</SelectItem><SelectItem value="delivered">Delivered</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t bg-muted/30 p-4">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm flex items-center gap-2 mb-3"><MapPin className="w-4 h-4 text-primary" />Shipping Address</h4>
                              {shippingAddress ? (
                                <div className="bg-background rounded-lg p-4 space-y-2">
                                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /><span className="font-medium">{shippingAddress.fullName || 'N/A'}</span></div>
                                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{shippingAddress.phone || 'N/A'}</span></div>
                                  <p className="text-sm text-muted-foreground pl-6">{shippingAddress.address || 'N/A'}</p>
                                  <p className="text-sm text-muted-foreground pl-6">{[shippingAddress.city, shippingAddress.state, shippingAddress.pincode].filter(Boolean).join(', ')}</p>
                                </div>
                              ) : (<div className="bg-background rounded-lg p-4 text-center text-muted-foreground">No address</div>)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm flex items-center gap-2 mb-3"><Package className="w-4 h-4 text-primary" />Order Items</h4>
                              {items.length === 0 ? (<div className="bg-background rounded-lg p-4 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" /></div>) : (
                                <div className="bg-background rounded-lg divide-y">
                                  {items.map((item) => (<div key={item.id} className="p-3"><div className="flex justify-between items-start"><div className="flex-1"><p className="font-medium text-sm">{item.productName}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</p>{item.sellerName && (<div className="flex items-center gap-1 mt-1"><Store className="w-3 h-3 text-primary" /><span className="text-xs text-primary font-medium">{item.sellerName}</span></div>)}</div><p className="font-semibold">₹{item.quantity * item.price}</p></div></div>))}
                                  <div className="p-3 flex justify-between items-center bg-muted/50"><span className="font-semibold">Total</span><span className="font-bold text-primary">₹{order.total}</span></div>
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

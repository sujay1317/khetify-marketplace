import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, IndianRupee, Loader2, User, MapPin, Phone, Clock, ChevronDown, ChevronUp, Receipt } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import OrderReceipt from '@/components/admin/OrderReceipt';

interface SellerProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface Order {
  id: string;
  customer_id: string;
  total: number;
  status: string;
  payment_method: string;
  shipping_address: ShippingAddress | null;
  created_at: string;
  items: OrderItem[];
  customer_name?: string;
}

interface DailyReport {
  date: string;
  orders: Order[];
  totalRevenue: number;
  orderCount: number;
}

const SellerOrderReport: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (sellerId) {
      fetchSellerAndOrders();
    }
  }, [sellerId, selectedDate]);

  const fetchSellerAndOrders = async () => {
    setLoading(true);
    try {
      // Fetch seller profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, phone')
        .eq('user_id', sellerId)
        .maybeSingle();

      if (profileError) throw profileError;
      setSeller(profileData);

      // Fetch order items for this seller
      let query = supabase
        .from('order_items')
        .select('id, order_id, product_name, quantity, price, created_at')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      const { data: orderItemsData, error: orderItemsError } = await query;

      if (orderItemsError) throw orderItemsError;

      if (!orderItemsData || orderItemsData.length === 0) {
        setDailyReports([]);
        setTotalRevenue(0);
        setTotalOrders(0);
        setLoading(false);
        return;
      }

      // Get unique order IDs
      const orderIds = [...new Set(orderItemsData.map(item => item.order_id))];

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, customer_id, total, status, payment_method, shipping_address, created_at')
        .in('id', orderIds)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch customer profiles
      const customerIds = [...new Set(ordersData?.map(o => o.customer_id) || [])];
      const { data: customersData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', customerIds);

      // Group by date
      const ordersByDate: { [key: string]: Order[] } = {};

      ordersData?.forEach(order => {
        const dateKey = new Date(order.created_at).toLocaleDateString('en-IN');
        
        // Filter by selected date if set
        if (selectedDate) {
          const orderDate = new Date(order.created_at).toISOString().split('T')[0];
          if (orderDate !== selectedDate) return;
        }

        const items = orderItemsData.filter(item => item.order_id === order.id);
        const customerProfile = customersData?.find(c => c.user_id === order.customer_id);
        
        // Calculate seller's revenue from this order
        const sellerTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const shippingAddress = order.shipping_address as unknown as ShippingAddress | null;

        const orderWithItems: Order = {
          id: order.id,
          customer_id: order.customer_id,
          total: sellerTotal,
          status: order.status || 'pending',
          payment_method: order.payment_method || 'cod',
          shipping_address: shippingAddress,
          created_at: order.created_at,
          items,
          customer_name: customerProfile?.full_name || shippingAddress?.fullName || 'Unknown'
        };

        if (!ordersByDate[dateKey]) {
          ordersByDate[dateKey] = [];
        }
        ordersByDate[dateKey].push(orderWithItems);
      });

      // Create daily reports
      const reports: DailyReport[] = Object.entries(ordersByDate).map(([date, orders]) => ({
        date,
        orders,
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        orderCount: orders.length
      }));

      // Sort by date descending
      reports.sort((a, b) => {
        const dateA = new Date(a.orders[0].created_at);
        const dateB = new Date(b.orders[0].created_at);
        return dateB.getTime() - dateA.getTime();
      });

      setDailyReports(reports);
      setTotalRevenue(reports.reduce((sum, r) => sum + r.totalRevenue, 0));
      setTotalOrders(reports.reduce((sum, r) => sum + r.orderCount, 0));
    } catch (error) {
      console.error('Error fetching seller orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const toggleOrder = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            {seller && (
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                  <AvatarImage src={seller.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(seller.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold font-heading">{seller.full_name || 'Seller'}</h1>
                  <p className="text-muted-foreground text-sm">Order Report</p>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <IndianRupee className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Filter by Date</p>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="max-w-[200px]"
                  />
                </div>
                {selectedDate && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate('')}>
                    Clear
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Reports */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : dailyReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
                <p className="text-muted-foreground">
                  {selectedDate ? 'No orders on selected date.' : 'This seller has no orders yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dailyReports.map((report) => (
                <Card key={report.date}>
                  <Collapsible
                    open={expandedDates.has(report.date)}
                    onOpenChange={() => toggleDate(report.date)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">{report.date}</CardTitle>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary">{report.orderCount} orders</Badge>
                            <span className="font-semibold text-green-600">
                              ₹{report.totalRevenue.toLocaleString('en-IN')}
                            </span>
                            {expandedDates.has(report.date) ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        {report.orders.map((order) => (
                          <Card key={order.id} className="border-dashed">
                            <Collapsible
                              open={expandedOrders.has(order.id)}
                              onOpenChange={() => toggleOrder(order.id)}
                            >
                              <CollapsibleTrigger asChild>
                                <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                      <div>
                                        <p className="font-medium text-sm">
                                          Order #{order.id.slice(0, 8)}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <User className="w-3 h-3" />
                                          {order.customer_name}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setReceiptOrder(order);
                                        }}
                                      >
                                        <Receipt className="w-4 h-4 mr-1" />
                                        Receipt
                                      </Button>
                                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                                        {order.status}
                                      </Badge>
                                      <span className="font-semibold">
                                        ₹{order.total.toLocaleString('en-IN')}
                                      </span>
                                      {expandedOrders.has(order.id) ? (
                                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="px-4 pb-4 space-y-4">
                                  {/* Order Details */}
                                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        {new Date(order.created_at).toLocaleString('en-IN')}
                                      </div>
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Package className="w-4 h-4" />
                                        Payment: {order.payment_method.toUpperCase()}
                                      </div>
                                    </div>
                                    {order.shipping_address && (
                                      <div className="space-y-1">
                                        <div className="flex items-start gap-2 text-muted-foreground">
                                          <MapPin className="w-4 h-4 mt-0.5" />
                                          <div>
                                            <p>{order.shipping_address.address}</p>
                                            <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                                            <p>PIN: {order.shipping_address.pincode}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Phone className="w-4 h-4" />
                                          {order.shipping_address.phone}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Order Items */}
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-center">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>{item.product_name}</TableCell>
                                          <TableCell className="text-center">{item.quantity}</TableCell>
                                          <TableCell className="text-right">₹{item.price}</TableCell>
                                          <TableCell className="text-right font-medium">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </Card>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Receipt Modal */}
      {receiptOrder && seller && (
        <OrderReceipt
          open={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
          data={{
            orderId: receiptOrder.id,
            orderDate: new Date(receiptOrder.created_at).toLocaleString('en-IN'),
            customerName: receiptOrder.customer_name || 'Customer',
            shippingAddress: receiptOrder.shipping_address,
            items: receiptOrder.items,
            total: receiptOrder.total,
            paymentMethod: receiptOrder.payment_method,
            status: receiptOrder.status,
            sellerName: seller.full_name || 'Seller'
          }}
        />
      )}
    </div>
  );
};

export default SellerOrderReport;

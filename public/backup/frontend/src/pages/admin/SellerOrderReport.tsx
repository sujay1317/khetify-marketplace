import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, IndianRupee, Loader2, User, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { usersApi, ordersApi, type ProfileDto, type SellerReportOrderDto, type DailyReportDto } from '@/services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const SellerOrderReport: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<ProfileDto | null>(null);
  const [dailyReports, setDailyReports] = useState<DailyReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => { if (sellerId) fetchSellerAndOrders(); }, [sellerId, selectedDate]);

  const fetchSellerAndOrders = async () => {
    setLoading(true);
    try {
      const [profileData, report] = await Promise.all([
        usersApi.getSellerPublicInfo(sellerId!),
        ordersApi.getSellerOrderReport(sellerId!, selectedDate || undefined),
      ]);
      setSeller(profileData);
      setDailyReports(report.dailyReports);
      setTotalRevenue(report.totalRevenue);
      setTotalOrders(report.totalOrders);
    } catch (error) { console.error('Error:', error); }
    setLoading(false);
  };

  const toggleDate = (date: string) => { const s = new Set(expandedDates); s.has(date) ? s.delete(date) : s.add(date); setExpandedDates(s); };
  const getInitials = (name: string | undefined | null) => { if (!name) return 'S'; return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')}><ArrowLeft className="w-5 h-5" /></Button>
            {seller && (
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-primary/20"><AvatarImage src={seller.avatarUrl || undefined} /><AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(seller.fullName)}</AvatarFallback></Avatar>
                <div><h1 className="text-2xl font-bold font-heading">{seller.fullName || 'Seller'}</h1><p className="text-muted-foreground text-sm">Order Report</p></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-full bg-primary/10"><Package className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{totalOrders}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-full bg-green-500/10"><IndianRupee className="w-5 h-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Revenue</p><p className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p></div></CardContent></Card>
            <Card className="col-span-2"><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-full bg-blue-500/10"><Calendar className="w-5 h-5 text-blue-500" /></div><div className="flex-1"><p className="text-sm text-muted-foreground mb-1">Filter by Date</p><Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="max-w-[200px]" /></div>{selectedDate && (<Button variant="ghost" size="sm" onClick={() => setSelectedDate('')}>Clear</Button>)}</CardContent></Card>
          </div>

          {loading ? (<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>) : dailyReports.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><h2 className="text-xl font-semibold mb-2">No Orders Found</h2><p className="text-muted-foreground">This seller has no orders yet.</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {dailyReports.map((report) => (
                <Card key={report.date}>
                  <Collapsible open={expandedDates.has(report.date)} onOpenChange={() => toggleDate(report.date)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-primary" /><CardTitle className="text-lg">{report.date}</CardTitle></div><div className="flex items-center gap-4"><Badge variant="secondary">{report.orderCount} orders</Badge><span className="font-semibold text-green-600">₹{report.totalRevenue.toLocaleString('en-IN')}</span>{expandedDates.has(report.date) ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}</div></div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        {report.orders.map((order) => (
                          <Card key={order.id} className="border-dashed">
                            <div className="p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div><p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p><div className="flex items-center gap-2 text-sm text-muted-foreground"><User className="w-3 h-3" />{order.customerName}</div></div>
                                <div className="flex items-center gap-2"><Badge>{order.status}</Badge><span className="font-semibold">₹{order.total.toLocaleString('en-IN')}</span></div>
                              </div>
                              <Table className="mt-3"><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead>Price</TableHead><TableHead>Total</TableHead></TableRow></TableHeader><TableBody>{order.items.map(item => (<TableRow key={item.id}><TableCell>{item.productName}</TableCell><TableCell>{item.quantity}</TableCell><TableCell>₹{item.price}</TableCell><TableCell>₹{item.price * item.quantity}</TableCell></TableRow>))}</TableBody></Table>
                            </div>
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
    </div>
  );
};

export default SellerOrderReport;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, ShoppingCart, TrendingUp, Check, X, LogOut, LayoutDashboard, BarChart3, Ticket, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { productsApi, ordersApi, usersApi, type ProductDto, type OrderDto, type UserWithRoleDto } from '@/services/api';
import { toast } from 'sonner';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import CouponManager from '@/components/admin/CouponManager';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'products' | 'coupons'>('overview');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [users, setUsers] = useState<UserWithRoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<ProductDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [p, o, u] = await Promise.all([productsApi.getAll(), ordersApi.getAll(), usersApi.getAllUsers()]);
      setProducts(p); setOrders(o); setUsers(u);
    } catch (error) { console.error('Error:', error); }
    setLoading(false);
  };

  const handleApproveProduct = async (id: string, approve: boolean) => {
    try { await productsApi.approve(id, approve); toast.success(approve ? 'Product approved!' : 'Product rejected'); fetchAllData(); }
    catch { toast.error('Failed to update product'); }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try { await productsApi.delete(productToDelete.id); toast.success(`${productToDelete.name} deleted`); setProductToDelete(null); fetchAllData(); }
    catch { toast.error('Failed to delete'); }
    setIsDeleting(false);
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  const pendingProducts = products.filter(p => !p.isApproved);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const sellerCount = users.filter(u => u.role === 'seller').length;
  const customerCount = users.filter(u => u.role === 'customer').length;

  // Map for AnalyticsCharts compatibility
  const ordersForCharts = orders.map(o => ({ id: o.id, total: o.total, created_at: o.createdAt, status: o.status }));
  const productsForCharts = products.map(p => ({ id: p.id, name: p.name, category: p.category, stock: p.stock }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 space-y-2">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center"><span className="text-xl">👑</span></div><div><p className="font-semibold">{profile?.full_name || 'Admin'}</p><Badge variant="destructive" className="text-xs">Admin</Badge></div></div>
              <nav className="space-y-1">
                {[
                  { tab: 'overview' as const, icon: LayoutDashboard, label: 'Overview' },
                  { tab: 'products' as const, icon: Package, label: 'Products', badge: pendingProducts.length > 0 ? pendingProducts.length : undefined },
                ].map(({ tab, icon: Icon, label, badge }) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><Icon className="w-5 h-5" />{label}{badge && <Badge variant="secondary" className="ml-auto">{badge}</Badge>}</button>
                ))}
                <button onClick={() => navigate('/admin/orders')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted"><ShoppingCart className="w-5 h-5" />Orders</button>
                <button onClick={() => navigate('/admin/users')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted"><Users className="w-5 h-5" />Users</button>
                <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'analytics' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><BarChart3 className="w-5 h-5" />Analytics</button>
                <button onClick={() => setActiveTab('coupons')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'coupons' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><Ticket className="w-5 h-5" />Coupons</button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10"><LogOut className="w-5 h-5" />Logout</button>
              </nav>
            </Card>
          </div>

          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold font-heading">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-primary/10"><Package className="w-6 h-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">Products</p><p className="text-2xl font-bold">{products.length}</p></div></div></Card>
                  <Card className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-secondary/20"><ShoppingCart className="w-6 h-6 text-secondary-foreground" /></div><div><p className="text-sm text-muted-foreground">Orders</p><p className="text-2xl font-bold">{orders.length}</p></div></div></Card>
                  <Card className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-accent/20"><TrendingUp className="w-6 h-6 text-accent" /></div><div><p className="text-sm text-muted-foreground">Revenue</p><p className="text-2xl font-bold">₹{totalRevenue.toFixed(0)}</p></div></div></Card>
                  <Card className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-muted"><Users className="w-6 h-6 text-foreground" /></div><div><p className="text-sm text-muted-foreground">Users</p><p className="text-2xl font-bold">{users.length}</p></div></div></Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingProducts.length > 0 && (
                    <Card className="p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Package className="w-5 h-5" />Pending Approvals</h3><div className="space-y-3">{pendingProducts.slice(0, 5).map((product) => (<div key={product.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"><div><p className="font-medium">{product.name}</p><p className="text-sm text-muted-foreground">₹{product.price}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => handleApproveProduct(product.id, true)}><Check className="w-4 h-4 text-accent" /></Button><Button size="sm" variant="outline" onClick={() => handleApproveProduct(product.id, false)}><X className="w-4 h-4 text-destructive" /></Button></div></div>))}</div></Card>
                  )}
                  <Card className="p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5" />User Stats</h3><div className="space-y-4"><div className="flex justify-between"><span className="text-muted-foreground">Sellers</span><Badge variant="outline">{sellerCount}</Badge></div><div className="flex justify-between"><span className="text-muted-foreground">Customers</span><Badge variant="outline">{customerCount}</Badge></div><div className="flex justify-between"><span className="text-muted-foreground">Admins</span><Badge variant="outline">{users.filter(u => u.role === 'admin').length}</Badge></div></div></Card>
                </div>
              </div>
            )}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold font-heading">Manage Products</h1>
                <Card><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{products.map((product) => (<TableRow key={product.id}><TableCell><div className="flex items-center gap-2">{product.isOrganic && <span>🌿</span>}{product.name}</div></TableCell><TableCell className="capitalize">{product.category}</TableCell><TableCell>₹{product.price}</TableCell><TableCell>{product.stock || 0}</TableCell><TableCell><Badge variant={product.isApproved ? 'default' : 'secondary'}>{product.isApproved ? 'Approved' : 'Pending'}</Badge></TableCell><TableCell><div className="flex gap-2">{!product.isApproved ? (<><Button size="sm" variant="outline" onClick={() => handleApproveProduct(product.id, true)}><Check className="w-4 h-4 text-accent" /></Button><Button size="sm" variant="outline" onClick={() => handleApproveProduct(product.id, false)}><X className="w-4 h-4 text-destructive" /></Button></>) : (<Button size="sm" variant="outline" onClick={() => handleApproveProduct(product.id, false)}><X className="w-4 h-4" /><span className="ml-1">Unapprove</span></Button>)}<Button size="sm" variant="outline" className="text-destructive" onClick={() => setProductToDelete(product)}><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>))}</TableBody></Table></Card>
              </div>
            )}
            {activeTab === 'analytics' && <AnalyticsCharts orders={ordersForCharts} products={productsForCharts} />}
            {activeTab === 'coupons' && <CouponManager />}
          </div>
        </div>
      </main>

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Product?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{productToDelete?.name}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteProduct} disabled={isDeleting} className="bg-destructive text-destructive-foreground">{isDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;

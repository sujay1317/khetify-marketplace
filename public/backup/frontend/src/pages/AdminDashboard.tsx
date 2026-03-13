import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Package, ShoppingCart, TrendingUp, Check, X, 
  LogOut, LayoutDashboard, BarChart3, Ticket, Trash2 
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import CouponManager from '@/components/admin/CouponManager';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  is_approved: boolean | null;
  is_organic: boolean | null;
  stock: number | null;
  seller_id: string;
  created_at: string;
}

interface Order {
  id: string;
  customer_id: string;
  status: string | null;
  total: number;
  payment_method: string | null;
  created_at: string;
}

interface UserWithRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
}

const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'products' | 'coupons'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchOrders(), fetchUsers()]);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  };

  const fetchUsers = async () => {
    // First get all user roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (rolesError || !rolesData) {
      console.error('Error fetching roles:', rolesError);
      return;
    }

    // Then get all profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Combine the data
    const usersWithProfiles = rolesData.map(role => ({
      ...role,
      profile: profilesData?.find(p => p.user_id === role.user_id) || null
    }));

    setUsers(usersWithProfiles as unknown as UserWithRole[]);
  };

  const handleApproveProduct = async (id: string, approve: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_approved: approve })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update product');
    } else {
      toast.success(approve ? 'Product approved!' : 'Product rejected');
      fetchProducts();
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      // Delete product images first
      await supabase.from('product_images').delete().eq('product_id', productToDelete.id);
      
      // Delete the product
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);

      if (error) {
        throw error;
      }

      toast.success(`${productToDelete.name} deleted successfully`);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
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

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const pendingProducts = products.filter(p => !p.is_approved);
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const sellerCount = users.filter(u => u.role === 'seller').length;
  const customerCount = users.filter(u => u.role === 'customer').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-2">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-xl">👑</span>
                </div>
                <div>
                  <p className="font-semibold">{profile?.full_name || 'Admin'}</p>
                  <Badge variant="destructive" className="text-xs">Admin</Badge>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'products' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  Products
                  {pendingProducts.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">{pendingProducts.length}</Badge>
                  )}
                </button>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Orders
                </button>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted"
                >
                  <Users className="w-5 h-5" />
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'analytics' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'coupons' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  Coupons
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold font-heading">Admin Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Products</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-secondary/20">
                        <ShoppingCart className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">{orders.length}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-accent/20">
                        <TrendingUp className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">₹{totalRevenue.toFixed(0)}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-muted">
                        <Users className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingProducts.length > 0 && (
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Pending Product Approvals
                      </h3>
                      <div className="space-y-3">
                        {pendingProducts.slice(0, 5).map((product) => (
                          <div key={product.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">₹{product.price}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleApproveProduct(product.id, true)}>
                                <Check className="w-4 h-4 text-accent" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleApproveProduct(product.id, false)}>
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Sellers</span>
                        <Badge variant="outline">{sellerCount}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Customers</span>
                        <Badge variant="outline">{customerCount}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Admins</span>
                        <Badge variant="outline">{users.filter(u => u.role === 'admin').length}</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold font-heading">Manage Products</h1>
                
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {product.is_organic && <span>🌿</span>}
                              {product.name}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{product.category}</TableCell>
                          <TableCell>₹{product.price}</TableCell>
                          <TableCell>{product.stock || 0}</TableCell>
                          <TableCell>
                            <Badge variant={product.is_approved ? 'default' : 'secondary'}>
                              {product.is_approved ? 'Approved' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!product.is_approved ? (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleApproveProduct(product.id, true)}>
                                    <Check className="w-4 h-4 text-accent" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleApproveProduct(product.id, false)}>
                                    <X className="w-4 h-4 text-destructive" />
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleApproveProduct(product.id, false)}>
                                  <X className="w-4 h-4" />
                                  <span className="ml-1">Unapprove</span>
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => setProductToDelete(product)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold font-heading">Analytics Dashboard</h1>
                <AnalyticsCharts orders={orders} products={products} />
              </div>
            )}

            {activeTab === 'coupons' && <CouponManager />}
          </div>
        </div>
      </main>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;

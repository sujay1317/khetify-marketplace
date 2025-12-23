import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Package, ShoppingCart, TrendingUp, Check, X, Eye, 
  LogOut, LayoutDashboard, UserCheck, Settings, Plus, BarChart3, Ticket 
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  const { profile, signOut, session } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'products' | 'orders' | 'users' | 'coupons'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddSellerOpen, setIsAddSellerOpen] = useState(false);
  const [sellerForm, setSellerForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [isCreatingSeller, setIsCreatingSeller] = useState(false);

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

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'seller' | 'customer') => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update user role');
    } else {
      toast.success('User role updated');
      fetchUsers();
    }
  };

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) {
      toast.error('Not authenticated');
      return;
    }

    setIsCreatingSeller(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(sellerForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create seller');
      }

      toast.success('Seller created successfully!');
      setIsAddSellerOpen(false);
      setSellerForm({ email: '', password: '', fullName: '', phone: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create seller');
    } finally {
      setIsCreatingSeller(false);
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
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'users' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold font-heading">Manage Orders</h1>
                
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>₹{order.total}</TableCell>
                          <TableCell className="uppercase text-sm">{order.payment_method}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'cancelled' ? 'destructive' : 'secondary'
                            }>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status || 'pending'}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-32">
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold font-heading">Manage Users</h1>
                  <Dialog open={isAddSellerOpen} onOpenChange={setIsAddSellerOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Seller</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateSeller} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Full Name *</label>
                          <Input
                            value={sellerForm.fullName}
                            onChange={(e) => setSellerForm({ ...sellerForm, fullName: e.target.value })}
                            placeholder="Seller name"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email *</label>
                          <Input
                            type="email"
                            value={sellerForm.email}
                            onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
                            placeholder="seller@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <Input
                            type="tel"
                            value={sellerForm.phone}
                            onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                            placeholder="Phone number"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Password *</label>
                          <Input
                            type="password"
                            value={sellerForm.password}
                            onChange={(e) => setSellerForm({ ...sellerForm, password: e.target.value })}
                            placeholder="Minimum 6 characters"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isCreatingSeller}>
                          {isCreatingSeller ? 'Creating...' : 'Create Seller Account'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                {user.role === 'admin' ? '👑' : user.role === 'seller' ? '🌾' : '👤'}
                              </div>
                              {user.profile?.full_name || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>{user.profile?.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={
                              user.role === 'admin' ? 'destructive' :
                              user.role === 'seller' ? 'default' : 'secondary'
                            }>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value: 'admin' | 'seller' | 'customer') => handleUpdateUserRole(user.user_id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="seller">Seller</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
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
    </div>
  );
};

export default AdminDashboard;

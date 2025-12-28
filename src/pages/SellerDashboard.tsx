import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, Plus, Edit, Trash2, Eye, LogOut, LayoutDashboard } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  unit: string | null;
  category: string;
  image: string | null;
  is_organic: boolean | null;
  stock: number | null;
  is_approved: boolean | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

const SellerDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    unit: 'kg',
    category: 'seeds',
    image: '',
    is_organic: false,
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrderItems(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const productData = {
      seller_id: user.id,
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      unit: formData.unit,
      category: formData.category,
      image: formData.image || null,
      is_organic: formData.is_organic,
      stock: parseInt(formData.stock) || 0
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast.error('Failed to update product');
      } else {
        toast.success('Product updated successfully');
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) {
        toast.error('Failed to add product');
      } else {
        toast.success('Product added successfully');
        fetchProducts();
      }
    }

    resetForm();
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      unit: product.unit || 'kg',
      category: product.category,
      image: product.image || '',
      is_organic: product.is_organic || false,
      stock: product.stock?.toString() || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted successfully');
      fetchProducts();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      unit: 'kg',
      category: 'seeds',
      image: '',
      is_organic: false,
      stock: ''
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const pendingApproval = products.filter(p => !p.is_approved).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-2">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl">🌾</span>
                </div>
                <div>
                  <p className="font-semibold">{profile?.full_name || 'Seller'}</p>
                  <Badge variant="outline" className="text-xs">Seller</Badge>
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
                  My Products
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
                <h1 className="text-2xl font-bold font-heading">Seller Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <p className="text-2xl font-bold">{orderItems.length}</p>
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
                </div>

                {pendingApproval > 0 && (
                  <Card className="p-4 border-secondary bg-secondary/10">
                    <p className="text-sm">
                      ⚠️ You have <strong>{pendingApproval}</strong> products pending admin approval.
                    </p>
                  </Card>
                )}

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Recent Orders</h3>
                  {orderItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No orders yet</p>
                  ) : (
                    <div className="space-y-3">
                      {orderItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold font-heading">My Products</h1>
                  <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                    setIsAddModalOpen(open);
                    if (!open) {
                      setEditingProduct(null);
                      resetForm();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Product Name *</label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Price (₹) *</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Original Price (₹)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.original_price}
                              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Category *</label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="seeds">Seeds</SelectItem>
                                <SelectItem value="fertilizers">Fertilizers</SelectItem>
                                <SelectItem value="pesticides">Pesticides</SelectItem>
                                <SelectItem value="tools">Farm Tools</SelectItem>
                                <SelectItem value="organic">Organic</SelectItem>
                                <SelectItem value="irrigation">Irrigation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Unit</label>
                            <Select
                              value={formData.unit}
                              onValueChange={(value) => setFormData({ ...formData, unit: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">Per Kg</SelectItem>
                                <SelectItem value="gram">Per Gram</SelectItem>
                                <SelectItem value="ml">Per ML</SelectItem>
                                <SelectItem value="liter">Per Liter</SelectItem>
                                <SelectItem value="piece">Per Piece</SelectItem>
                                <SelectItem value="pack">Per Pack</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Stock</label>
                          <Input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Image URL</label>
                          <Input
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="organic"
                            checked={formData.is_organic}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_organic: checked as boolean })}
                          />
                          <label htmlFor="organic" className="text-sm">Organic Product</label>
                        </div>
                        <Button type="submit" className="w-full">
                          {editingProduct ? 'Update Product' : 'Add Product'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {loading ? (
                  <div className="text-center py-12">Loading...</div>
                ) : products.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                    <p className="text-muted-foreground mb-4">Start adding products to sell on Khetify</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted relative">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">🌾</div>
                          )}
                          {!product.is_approved && (
                            <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
                              Pending Approval
                            </Badge>
                          )}
                          {product.is_organic && (
                            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                              Organic
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-primary">₹{product.price}</span>
                            {product.original_price && (
                              <span className="text-sm line-through text-muted-foreground">₹{product.original_price}</span>
                            )}
                            <span className="text-xs text-muted-foreground">/{product.unit}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Stock: {product.stock || 0}</p>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold font-heading">Orders</h1>
                
                {orderItems.length === 0 ? (
                  <Card className="p-12 text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground">Orders for your products will appear here</p>
                  </Card>
                ) : (
                  <Card>
                    <div className="divide-y">
                      {orderItems.map((item) => (
                        <div key={item.id} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} • Order ID: {item.order_id.slice(0, 8)}...
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                            <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;

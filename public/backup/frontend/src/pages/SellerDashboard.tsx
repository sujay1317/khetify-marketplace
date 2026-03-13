import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, Plus, Edit, Trash2, Eye, LogOut, LayoutDashboard, Upload, X, Key, EyeIcon, EyeOff, ImageIcon, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { productsApi, ordersApi, uploadApi, authApi, type ProductDto, type OrderItemDto } from '@/services/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface Product {
  id: string; name: string; description: string | null; price: number; original_price: number | null;
  unit: string | null; category: string; image: string | null; is_organic: boolean | null;
  stock: number | null; is_approved: boolean | null; created_at: string;
}

interface GroupedOrder { order_id: string; created_at: string; items: OrderItemDto[]; subtotal: number; }

const SellerDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', original_price: '', unit: 'kg',
    category: 'seeds', image: '', is_organic: false, stock: ''
  });

  useEffect(() => { fetchProducts(); fetchOrders(); }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    try {
      const data = await productsApi.getBySeller(user.id);
      setProducts(data.map(p => ({
        id: p.id, name: p.name, description: p.description || null, price: p.price,
        original_price: p.originalPrice || null, unit: p.unit, category: p.category,
        image: p.image || null, is_organic: p.isOrganic, stock: p.stock,
        is_approved: p.isApproved, created_at: p.createdAt,
      })));
    } catch (error) { console.error('Error fetching products:', error); }
    setLoading(false);
  };

  const fetchOrders = async () => {
    if (!user) return;
    try { const data = await ordersApi.getSellerOrders(); setOrderItems(data); }
    catch (error) { console.error('Error fetching orders:', error); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const previews: string[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is too large (max 5MB)`); continue; }
      if (imageFiles.length + imagePreviews.length + validFiles.length >= 5) { toast.error('Maximum 5 images'); break; }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }
    setImageFiles([...imageFiles, ...validFiles]);
    setImagePreviews([...imagePreviews, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string | null> => {
    let mainImageUrl: string | null = formData.image || null;
    for (let i = 0; i < imageFiles.length; i++) {
      try {
        const result = await uploadApi.productImage(imageFiles[i]);
        if (i === 0 && !mainImageUrl) mainImageUrl = result.url;
      } catch (error) { toast.error(`Failed to upload image ${i + 1}`); }
    }
    return mainImageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);

    let imageUrl = formData.image || undefined;
    if (imageFiles.length > 0) {
      const uploaded = await uploadImages();
      if (uploaded) imageUrl = uploaded;
    }

    const productData = {
      name: formData.name, description: formData.description || undefined,
      price: parseFloat(formData.price), originalPrice: formData.original_price ? parseFloat(formData.original_price) : undefined,
      unit: formData.unit, category: formData.category, image: imageUrl,
      isOrganic: formData.is_organic, stock: parseInt(formData.stock) || 0
    };

    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, productData);
        toast.success('Product updated successfully');
      } else {
        await productsApi.create(productData);
        toast.success('Product added successfully');
      }
      fetchProducts();
    } catch (error) { toast.error('Failed to save product'); }

    resetForm();
    setIsAddModalOpen(false);
    setEditingProduct(null);
    setUploading(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, description: product.description || '', price: product.price.toString(),
      original_price: product.original_price?.toString() || '', unit: product.unit || 'kg',
      category: product.category, image: product.image || '', is_organic: product.is_organic || false,
      stock: product.stock?.toString() || ''
    });
    setImageFiles([]); setImagePreviews([]);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try { await productsApi.delete(id); toast.success('Product deleted'); fetchProducts(); }
    catch { toast.error('Failed to delete'); }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', original_price: '', unit: 'kg', category: 'seeds', image: '', is_organic: false, stock: '' });
    setImageFiles([]); setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setPasswordLoading(true);
    try {
      await authApi.changePassword({ currentPassword: '', newPassword });
      toast.success('Password updated successfully');
      setIsPasswordModalOpen(false); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) { toast.error('Failed to update password: ' + error.message); }
    setPasswordLoading(false);
  };

  const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const pendingApproval = products.filter(p => !p.is_approved).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 space-y-2">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-xl">🌾</span></div>
                <div><p className="font-semibold">{profile?.full_name || t('seller')}</p><Badge variant="outline" className="text-xs">{t('seller')}</Badge></div>
              </div>
              <nav className="space-y-1">
                {[
                  { tab: 'overview' as const, icon: LayoutDashboard, label: t('overview') },
                  { tab: 'products' as const, icon: Package, label: t('myProducts') },
                  { tab: 'orders' as const, icon: ShoppingCart, label: t('orders') },
                  { tab: 'settings' as const, icon: Key, label: t('settings') },
                ].map(({ tab, icon: Icon, label }) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                    <Icon className="w-5 h-5" />{label}
                  </button>
                ))}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"><LogOut className="w-5 h-5" />{t('logout')}</button>
              </nav>
            </Card>
          </div>

          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold font-heading">{t('sellerDashboard')}</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-primary/10"><Package className="w-6 h-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t('totalProducts')}</p><p className="text-2xl font-bold">{products.length}</p></div></div></Card>
                  <Card className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-secondary/20"><ShoppingCart className="w-6 h-6 text-secondary-foreground" /></div><div><p className="text-sm text-muted-foreground">{t('totalOrders')}</p><p className="text-2xl font-bold">{orderItems.length}</p></div></div></Card>
                  <Card className="p-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-accent/20"><TrendingUp className="w-6 h-6 text-accent" /></div><div><p className="text-sm text-muted-foreground">{t('totalRevenue')}</p><p className="text-2xl font-bold">₹{totalRevenue.toFixed(0)}</p></div></div></Card>
                </div>
                {pendingApproval > 0 && (<Card className="p-4 border-secondary bg-secondary/10"><p className="text-sm">⚠️ {t('youHave')} <strong>{pendingApproval}</strong> {t('pendingAdminApproval')}.</p></Card>)}
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold font-heading">{t('myProducts')}</h1>
                  <Dialog open={isAddModalOpen} onOpenChange={(open) => { setIsAddModalOpen(open); if (!open) { setEditingProduct(null); resetForm(); } }}>
                    <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />{t('addProduct')}</Button></DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>{editingProduct ? t('editProduct') : t('addNewProduct')}</DialogTitle><DialogDescription>{editingProduct ? 'Update product details.' : 'Fill in the product information.'}</DialogDescription></DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="text-sm font-medium">{t('productName')} *</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                        <div><label className="text-sm font-medium">{t('description')}</label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-sm font-medium">{t('price')} (₹) *</label><Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required /></div>
                          <div><label className="text-sm font-medium">{t('originalPrice')} (₹)</label><Input type="number" step="0.01" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: e.target.value })} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-sm font-medium">{t('category')} *</label><Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="seeds">{t('seeds')}</SelectItem><SelectItem value="fertilizers">{t('fertilizers')}</SelectItem><SelectItem value="pesticides">{t('pesticides')}</SelectItem><SelectItem value="tools">{t('tools')}</SelectItem><SelectItem value="organic">{t('organic')}</SelectItem><SelectItem value="irrigation">{t('irrigation')}</SelectItem></SelectContent></Select></div>
                          <div><label className="text-sm font-medium">{t('unit')}</label><Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="kg">{t('perKgUnit')}</SelectItem><SelectItem value="gram">{t('perGram')}</SelectItem><SelectItem value="ml">{t('perML')}</SelectItem><SelectItem value="liter">{t('perLiter')}</SelectItem><SelectItem value="piece">{t('perPiece')}</SelectItem><SelectItem value="pack">{t('perPack')}</SelectItem></SelectContent></Select></div>
                        </div>
                        <div><label className="text-sm font-medium">{t('stock')}</label><Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} /></div>
                        <div>
                          <label className="text-sm font-medium">{t('productImages')}</label>
                          <div className="mt-2 space-y-3">
                            {imagePreviews.length > 0 && (<div className="flex flex-wrap gap-2">{imagePreviews.map((preview, index) => (<div key={index} className="relative"><img src={preview} alt="New upload" className="w-20 h-20 object-cover rounded-lg border border-primary" /><button type="button" onClick={() => removeNewImage(index)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"><X className="w-3 h-3" /></button></div>))}</div>)}
                            {imagePreviews.length < 5 && (<div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"><Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" /><p className="text-sm text-muted-foreground">{t('addImages')}</p></div>)}
                            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2"><Checkbox id="organic" checked={formData.is_organic} onCheckedChange={(checked) => setFormData({ ...formData, is_organic: checked as boolean })} /><label htmlFor="organic" className="text-sm">{t('organicProduct')}</label></div>
                        <Button type="submit" className="w-full" disabled={uploading}>{uploading ? t('uploading') : editingProduct ? t('updateProduct') : t('addProduct')}</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                {loading ? (<div className="text-center py-12">{t('loading')}</div>) : products.length === 0 ? (
                  <Card className="p-12 text-center"><Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">{t('noProducts')}</h3></Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted relative">
                          {product.image ? (<img src={product.image} alt={product.name} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-4xl">🌾</div>)}
                          {!product.is_approved && (<Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">{t('pendingApproval')}</Badge>)}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                          <div className="flex items-center gap-2 mt-2"><span className="font-bold text-primary">₹{product.price}</span>{product.original_price && (<span className="text-sm line-through text-muted-foreground">₹{product.original_price}</span>)}</div>
                          <p className="text-sm text-muted-foreground mt-1">{t('stock')}: {product.stock || 0}</p>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(product)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
                <h1 className="text-2xl font-bold font-heading">{t('orders')}</h1>
                {orderItems.length === 0 ? (
                  <Card className="p-12 text-center"><ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">{t('noOrders')}</h3></Card>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <Card key={item.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div><p className="font-medium">{item.productName}</p><p className="text-sm text-muted-foreground">{t('qty')}: {item.quantity}</p></div>
                          <p className="font-semibold">₹{item.price * item.quantity}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold font-heading">{t('settings')}</h1>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    <Input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
                    <Input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
                    <div className="flex gap-2">
                      <Button onClick={() => setShowPassword(!showPassword)} variant="outline">{showPassword ? 'Hide' : 'Show'}</Button>
                      <Button onClick={handleChangePassword} disabled={passwordLoading}>{passwordLoading ? 'Updating...' : 'Update Password'}</Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;

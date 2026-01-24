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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{id: string, image_url: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shopImageInputRef = useRef<HTMLInputElement>(null);
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [shopImagePreview, setShopImagePreview] = useState<string | null>(profile?.shop_image || null);
  const [shopImageUploading, setShopImageUploading] = useState(false);
  
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const previews: string[] = [];
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }
      if (imageFiles.length + imagePreviews.length + existingImages.length + validFiles.length >= 5) {
        toast.error('Maximum 5 images allowed');
        break;
      }
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

  const removeExistingImage = async (imageId: string) => {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);
    
    if (error) {
      toast.error('Failed to remove image');
    } else {
      setExistingImages(existingImages.filter(img => img.id !== imageId));
    }
  };

  const clearAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
    setFormData({ ...formData, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImages = async (productId: string): Promise<string | null> => {
    if (!user) return formData.image || null;
    
    setUploading(true);
    let mainImageUrl: string | null = formData.image || null;
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // First image becomes the main product image
      if (i === 0 && !mainImageUrl) {
        mainImageUrl = publicUrl;
      }

      // Save to product_images table
      await supabase.from('product_images').insert({
        product_id: productId,
        image_url: publicUrl,
        display_order: existingImages.length + i
      });
    }

    setUploading(false);
    return mainImageUrl;
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
      // Upload new images first
      if (imageFiles.length > 0) {
        const mainImage = await uploadImages(editingProduct.id);
        if (mainImage && !productData.image) {
          productData.image = mainImage;
        }
      }

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
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        toast.error('Failed to add product');
      } else {
        // Upload images after product is created
        if (imageFiles.length > 0 && newProduct) {
          const mainImage = await uploadImages(newProduct.id);
          if (mainImage) {
            await supabase.from('products').update({ image: mainImage }).eq('id', newProduct.id);
          }
        }
        toast.success('Product added successfully');
        fetchProducts();
      }
    }

    resetForm();
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = async (product: Product) => {
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
    setImageFiles([]);
    setImagePreviews([]);
    
    // Fetch existing gallery images
    const { data: galleryImages } = await supabase
      .from('product_images')
      .select('id, image_url')
      .eq('product_id', product.id)
      .order('display_order');
    
    setExistingImages(galleryImages || []);
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
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error('Failed to update password: ' + error.message);
    } else {
      toast.success('Password updated successfully');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    }
    
    setPasswordLoading(false);
  };

  const handleShopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    setShopImage(file);
    setShopImagePreview(URL.createObjectURL(file));
  };

  const handleShopImageUpload = async () => {
    if (!shopImage || !user) return;
    
    setShopImageUploading(true);
    
    try {
      const fileExt = shopImage.name.split('.').pop();
      const fileName = `${user.id}/shop-image.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('shop-images')
        .upload(fileName, shopImage, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('shop-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ shop_image: publicUrlData.publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Shop image updated successfully!');
      setShopImage(null);
      setShopImagePreview(publicUrlData.publicUrl);
    } catch (error: any) {
      console.error('Error uploading shop image:', error);
      toast.error('Failed to upload shop image');
    } finally {
      setShopImageUploading(false);
    }
  };

  const clearShopImage = () => {
    setShopImage(null);
    setShopImagePreview(profile?.shop_image || null);
    if (shopImageInputRef.current) {
      shopImageInputRef.current.value = '';
    }
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
                <p className="font-semibold">{profile?.full_name || t('seller')}</p>
                  <Badge variant="outline" className="text-xs">{t('seller')}</Badge>
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
                  {t('overview')}
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'products' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  {t('myProducts')}
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t('orders')}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <Key className="w-5 h-5" />
                  {t('settings')}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  {t('logout')}
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold font-heading">{t('sellerDashboard')}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('totalProducts')}</p>
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
                        <p className="text-sm text-muted-foreground">{t('totalOrders')}</p>
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
                        <p className="text-sm text-muted-foreground">{t('totalRevenue')}</p>
                        <p className="text-2xl font-bold">₹{totalRevenue.toFixed(0)}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {pendingApproval > 0 && (
                  <Card className="p-4 border-secondary bg-secondary/10">
                    <p className="text-sm">
                      ⚠️ {t('youHave')} <strong>{pendingApproval}</strong> {t('pendingAdminApproval')}.
                    </p>
                  </Card>
                )}

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">{t('recentOrders')}</h3>
                  {orderItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">{t('noOrders')}</p>
                  ) : (
                    <div className="space-y-3">
                      {orderItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">{t('qty')}: {item.quantity}</p>
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
                  <h1 className="text-2xl font-bold font-heading">{t('myProducts')}</h1>
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
                        {t('addProduct')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? t('editProduct') : t('addNewProduct')}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">{t('productName')} *</label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t('description')}</label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">{t('price')} (₹) *</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">{t('originalPrice')} (₹)</label>
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
                            <label className="text-sm font-medium">{t('category')} *</label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="seeds">{t('seeds')}</SelectItem>
                                <SelectItem value="fertilizers">{t('fertilizers')}</SelectItem>
                                <SelectItem value="pesticides">{t('pesticides')}</SelectItem>
                                <SelectItem value="tools">{t('tools')}</SelectItem>
                                <SelectItem value="organic">{t('organic')}</SelectItem>
                                <SelectItem value="irrigation">{t('irrigation')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">{t('unit')}</label>
                            <Select
                              value={formData.unit}
                              onValueChange={(value) => setFormData({ ...formData, unit: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">{t('perKgUnit')}</SelectItem>
                                <SelectItem value="gram">{t('perGram')}</SelectItem>
                                <SelectItem value="ml">{t('perML')}</SelectItem>
                                <SelectItem value="liter">{t('perLiter')}</SelectItem>
                                <SelectItem value="piece">{t('perPiece')}</SelectItem>
                                <SelectItem value="pack">{t('perPack')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t('stock')}</label>
                          <Input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t('productImages')}</label>
                          <div className="mt-2 space-y-3">
                            {/* Gallery preview */}
                            {(existingImages.length > 0 || imagePreviews.length > 0) && (
                              <div className="flex flex-wrap gap-2">
                                {existingImages.map((img) => (
                                  <div key={img.id} className="relative">
                                    <img
                                      src={img.image_url}
                                      alt="Product"
                                      className="w-20 h-20 object-cover rounded-lg border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeExistingImage(img.id)}
                                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                {imagePreviews.map((preview, index) => (
                                  <div key={`new-${index}`} className="relative">
                                    <img
                                      src={preview}
                                      alt="New upload"
                                      className="w-20 h-20 object-cover rounded-lg border border-primary"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeNewImage(index)}
                                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Upload button */}
                            {existingImages.length + imagePreviews.length < 5 && (
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                              >
                                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                                <p className="text-sm text-muted-foreground">{t('addImages')}</p>
                                <p className="text-xs text-muted-foreground">{t('maxFileSize')}</p>
                              </div>
                            )}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="organic"
                            checked={formData.is_organic}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_organic: checked as boolean })}
                          />
                          <label htmlFor="organic" className="text-sm">{t('organicProduct')}</label>
                        </div>
                        <Button type="submit" className="w-full" disabled={uploading}>
                          {uploading ? t('uploading') : editingProduct ? t('updateProduct') : t('addProduct')}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {loading ? (
                  <div className="text-center py-12">{t('loading')}</div>
                ) : products.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('noProducts')}</h3>
                    <p className="text-muted-foreground mb-4">{t('startAddingProducts')}</p>
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
                              {t('pendingApproval')}
                            </Badge>
                          )}
                          {product.is_organic && (
                            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                              {t('organic')}
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
                          <p className="text-sm text-muted-foreground mt-1">{t('stock')}: {product.stock || 0}</p>
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
                <h1 className="text-2xl font-bold font-heading">{t('orders')}</h1>
                
                {orderItems.length === 0 ? (
                  <Card className="p-12 text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('noOrders')}</h3>
                    <p className="text-muted-foreground">{t('ordersForProducts')}</p>
                  </Card>
                ) : (
                  <Card>
                    <div className="divide-y">
                      {orderItems.map((item) => (
                        <div key={item.id} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('quantity')}: {item.quantity} • {t('orderId')}: {item.order_id.slice(0, 8)}...
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                            <p className="text-sm text-muted-foreground">₹{item.price} {t('each')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold font-heading">{t('settings')}</h1>
                
                {/* Shop Image Upload */}
                <Card className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{t('shopBannerImage')}</p>
                      <p className="text-sm text-muted-foreground">{t('uploadBannerForStore')}</p>
                    </div>
                  </div>
                  
                  {shopImagePreview ? (
                    <div className="relative mb-4">
                      <img 
                        src={shopImagePreview} 
                        alt="Shop preview" 
                        className="w-full h-40 md:h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={clearShopImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors mb-4">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mt-2">{t('clickToUpload')}</span>
                      <span className="text-xs text-muted-foreground mt-1">{t('maxFileSize')}</span>
                      <input
                        ref={shopImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleShopImageChange}
                      />
                    </label>
                  )}
                  
                  {shopImage && (
                    <Button 
                      onClick={handleShopImageUpload} 
                      disabled={shopImageUploading}
                      className="w-full"
                    >
                      {shopImageUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('uploading')}
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {t('saveShopImage')}
                        </>
                      )}
                    </Button>
                  )}
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Key className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{t('changePassword')}</p>
                        <p className="text-sm text-muted-foreground">{t('updateAccountPassword')}</p>
                      </div>
                    </div>
                    <Button onClick={() => setIsPasswordModalOpen(true)}>
                      {t('changePassword')}
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 border-destructive/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <LogOut className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <p className="font-semibold text-destructive">{t('logout')}</p>
                        <p className="text-sm text-muted-foreground">{t('signOutFromAccount')}</p>
                      </div>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>
                      {t('logout')}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Password Change Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('changePassword')}</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsPasswordModalOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('newPassword')}</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('enterNewPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('confirmPassword')}</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmNewPassword')}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsPasswordModalOpen(false)}>
                    {t('cancel')}
                  </Button>
                  <Button className="flex-1" onClick={handleChangePassword} disabled={passwordLoading}>
                    {passwordLoading ? t('updating') : t('updatePassword')}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;

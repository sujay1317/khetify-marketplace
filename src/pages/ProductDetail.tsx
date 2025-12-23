import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Truck, Shield, Leaf, Minus, Plus, ShoppingCart, Heart, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart, Product } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWishlist } from '@/hooks/useWishlist';
import ProductReviews from '@/components/product/ProductReviews';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    
    // Fetch product
    const { data: productData, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error || !productData) {
      console.error('Error fetching product:', error);
      setProduct(null);
      setLoading(false);
      return;
    }

    // Fetch seller profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', productData.seller_id)
      .maybeSingle();

    const transformedProduct: Product = {
      id: productData.id,
      name: productData.name,
      nameHi: productData.name_hi || productData.name,
      nameMr: productData.name_hi || productData.name,
      description: productData.description || '',
      price: productData.price,
      originalPrice: productData.original_price || undefined,
      image: productData.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
      category: productData.category,
      stock: productData.stock || 0,
      unit: productData.unit || 'kg',
      sellerId: productData.seller_id,
      sellerName: profileData?.full_name || 'Unknown Seller',
      rating: 4.5,
      reviews: Math.floor(Math.random() * 200) + 50,
      isOrganic: productData.is_organic || false,
      isFeatured: false,
    };

    setProduct(transformedProduct);

    // Fetch related products
    const { data: relatedData } = await supabase
      .from('products')
      .select('*')
      .eq('category', productData.category)
      .eq('is_approved', true)
      .neq('id', productId)
      .limit(4);

    if (relatedData) {
      const sellerIds = [...new Set(relatedData.map(p => p.seller_id))];
      const { data: sellersData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', sellerIds);

      const sellerMap: Record<string, string> = {};
      sellersData?.forEach(s => {
        sellerMap[s.user_id] = s.full_name || 'Unknown Seller';
      });

      setRelatedProducts(relatedData.map(p => ({
        id: p.id,
        name: p.name,
        nameHi: p.name_hi || p.name,
        nameMr: p.name_hi || p.name,
        description: p.description || '',
        price: p.price,
        originalPrice: p.original_price || undefined,
        image: p.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
        category: p.category,
        stock: p.stock || 0,
        unit: p.unit || 'kg',
        sellerId: p.seller_id,
        sellerName: sellerMap[p.seller_id] || 'Unknown Seller',
        rating: 4.5,
        reviews: Math.floor(Math.random() * 200) + 50,
        isOrganic: p.is_organic || false,
        isFeatured: false,
      })));
    }

    setLoading(false);
  };

  const getLocalizedName = () => {
    if (!product) return '';
    switch (language) {
      case 'hi': return product.nameHi;
      case 'mr': return product.nameMr;
      default: return product.name;
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart!`, {
      action: {
        label: 'View Cart',
        onClick: () => window.location.href = '/cart',
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isOrganic && (
                <Badge variant="success" className="gap-1">
                  <Leaf className="w-3 h-3" />
                  Organic
                </Badge>
              )}
              {discountPercent > 0 && (
                <Badge variant="gold">
                  {discountPercent}% OFF
                </Badge>
              )}
            </div>

            {/* Wishlist */}
            <Button
              variant={isInWishlist(product.id) ? 'default' : 'glass'}
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Seller */}
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {product.sellerName}
            </p>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading">
              {getLocalizedName()}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-secondary text-secondary'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-bold text-primary">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-muted-foreground">
                / {product.unit}
              </span>
            </div>

            {/* Stock Status */}
            <p className={`text-sm font-medium ${product.stock > 0 ? 'text-accent' : 'text-destructive'}`}>
              {product.stock > 0 ? `✓ ${product.stock} units in stock` : '✗ Out of stock'}
            </p>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border-2 border-border rounded-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="hero"
                size="xl"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5" />
                {t('addToCart')}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Free Delivery</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Quality Assured</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Eco Friendly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold font-heading mb-6">Customer Reviews</h2>
          <ProductReviews productId={product.id} />
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold font-heading mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-square bg-muted">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1">{p.name}</h3>
                      <p className="text-primary font-bold">₹{p.price}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;

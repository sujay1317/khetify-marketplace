import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, Minus, Leaf, ShoppingCart } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { useCart, Product } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';

const Compare: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  const handleAddToCart = (product: typeof compareList[0]) => {
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      nameHi: product.name,
      nameMr: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.original_price || undefined,
      image: product.image || '/placeholder.svg',
      category: product.category,
      stock: 100,
      unit: product.unit || 'kg',
      sellerId: '',
      sellerName: '',
      rating: 0,
      reviews: 0,
      isOrganic: product.is_organic || false,
    };
    addToCart(cartProduct);
    toast.success(`${product.name} added to cart`);
  };

  const formatPrice = (price: number) => `₹${price.toFixed(0)}`;

  const calculateDiscount = (price: number, original?: number | null) => {
    if (!original || original <= price) return null;
    return Math.round(((original - price) / original) * 100);
  };

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No Products to Compare</h2>
            <p className="text-muted-foreground mb-6">
              Add products to compare by clicking the compare button on product cards.
            </p>
            <Link to="/products">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const comparisonAttributes = [
    { label: 'Price', key: 'price', render: (p: typeof compareList[0]) => (
      <div>
        <span className="text-xl font-bold text-primary">{formatPrice(p.price)}</span>
        {p.original_price && p.original_price > p.price && (
          <span className="text-sm text-muted-foreground line-through ml-2">
            {formatPrice(p.original_price)}
          </span>
        )}
      </div>
    )},
    { label: 'Discount', key: 'discount', render: (p: typeof compareList[0]) => {
      const discount = calculateDiscount(p.price, p.original_price);
      return discount ? (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          {discount}% OFF
        </Badge>
      ) : <Minus className="w-4 h-4 text-muted-foreground" />;
    }},
    { label: 'Category', key: 'category', render: (p: typeof compareList[0]) => (
      <Badge variant="outline">{p.category}</Badge>
    )},
    { label: 'Unit', key: 'unit', render: (p: typeof compareList[0]) => (
      <span className="text-foreground">per {p.unit || 'kg'}</span>
    )},
    { label: 'Organic', key: 'is_organic', render: (p: typeof compareList[0]) => (
      p.is_organic ? (
        <div className="flex items-center gap-1 text-green-600">
          <Leaf className="w-4 h-4" />
          <span>Yes</span>
        </div>
      ) : (
        <span className="text-muted-foreground">No</span>
      )
    )},
    { label: 'Description', key: 'description', render: (p: typeof compareList[0]) => (
      <p className="text-sm text-muted-foreground line-clamp-3">
        {p.description || 'No description available'}
      </p>
    )},
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Compare Products</h1>
              <p className="text-muted-foreground">Comparing {compareList.length} products</p>
            </div>
          </div>
          <Button variant="outline" onClick={clearCompare}>
            Clear All
          </Button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Product Images & Names */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `150px repeat(${compareList.length}, 1fr)` }}>
              <div></div>
              {compareList.map((product) => (
                <div key={product.id} className="relative">
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <Link to={`/product/${product.id}`}>
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-muted">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="font-semibold text-foreground text-center line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Rows */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {comparisonAttributes.map((attr, index) => (
                <div
                  key={attr.key}
                  className={`grid gap-4 p-4 ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                  style={{ gridTemplateColumns: `150px repeat(${compareList.length}, 1fr)` }}
                >
                  <div className="font-medium text-foreground flex items-center">
                    {attr.label}
                  </div>
                  {compareList.map((product) => (
                    <div key={product.id} className="flex items-center justify-center">
                      {attr.render(product)}
                    </div>
                  ))}
                </div>
              ))}

              {/* Add to Cart Row */}
              <div
                className="grid gap-4 p-4 bg-muted/50"
                style={{ gridTemplateColumns: `150px repeat(${compareList.length}, 1fr)` }}
              >
                <div className="font-medium text-foreground flex items-center">
                  Action
                </div>
                {compareList.map((product) => (
                  <div key={product.id} className="flex items-center justify-center">
                    <Button onClick={() => handleAddToCart(product)} className="w-full max-w-[200px]">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Compare;

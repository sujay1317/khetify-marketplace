import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/contexts/CartContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface DBProduct {
  id: string;
  name: string;
  name_hi: string | null;
  description: string | null;
  description_hi: string | null;
  price: number;
  original_price: number | null;
  image: string | null;
  category: string;
  stock: number | null;
  unit: string | null;
  seller_id: string;
  is_organic: boolean | null;
  is_approved: boolean | null;
}

interface SellerProfile {
  user_id: string;
  full_name: string | null;
  free_delivery: boolean | null;
}

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useLanguage();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showOrganic, setShowOrganic] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchProducts();

    // Subscribe to real-time stock updates
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          // Update the product in state when stock changes
          setProducts(prev => prev.map(p => {
            if (p.id === payload.new.id) {
              return { ...p, stock: payload.new.stock };
            }
            return p;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    
    // Fetch approved products
    const { data: productsData, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      return;
    }

    if (!productsData || productsData.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    // Fetch seller profiles using secure function for each seller
    const sellerIds = [...new Set(productsData.map(p => p.seller_id))];
    const sellerMap: Record<string, { name: string; freeDelivery: boolean }> = {};
    
    // Fetch seller info for each seller using the secure RPC function
    for (const sellerId of sellerIds) {
      const { data: sellerInfo } = await supabase
        .rpc('get_seller_public_info', { seller_user_id: sellerId });
      
      if (sellerInfo && sellerInfo.length > 0) {
        sellerMap[sellerId] = {
          name: sellerInfo[0].full_name || 'Unknown Seller',
          freeDelivery: sellerInfo[0].free_delivery || false,
        };
      } else {
        sellerMap[sellerId] = { name: 'Unknown Seller', freeDelivery: false };
      }
    }

    // Fetch average ratings for all products
    const productIds = productsData.map(p => p.id);
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('product_id, rating')
      .in('product_id', productIds);

    // Calculate average ratings and review counts
    const ratingsMap: Record<string, { avg: number; count: number }> = {};
    reviewsData?.forEach((review: { product_id: string; rating: number }) => {
      if (!ratingsMap[review.product_id]) {
        ratingsMap[review.product_id] = { avg: 0, count: 0 };
      }
      ratingsMap[review.product_id].count += 1;
      ratingsMap[review.product_id].avg += review.rating;
    });

    // Finalize averages
    Object.keys(ratingsMap).forEach(productId => {
      ratingsMap[productId].avg = ratingsMap[productId].avg / ratingsMap[productId].count;
    });

    // Transform DB products to frontend Product type
    const transformedProducts: Product[] = productsData.map((p: DBProduct) => ({
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
      sellerName: sellerMap[p.seller_id]?.name || 'Unknown Seller',
      rating: ratingsMap[p.id]?.avg || 0,
      reviews: ratingsMap[p.id]?.count || 0,
      isOrganic: p.is_organic || false,
      isFeatured: false,
      freeDelivery: sellerMap[p.seller_id]?.freeDelivery || false,
    }));

    console.log('Products fetched:', transformedProducts.length, transformedProducts.map(p => p.name));
    setProducts(transformedProducts);
    setLoading(false);
  };

  const getCategoryName = (cat: typeof categories[0]) => {
    switch (language) {
      case 'hi': return cat.nameHi;
      case 'mr': return cat.nameMr;
      default: return cat.name;
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.nameHi.includes(query) ||
          p.nameMr.includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.sellerName.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Organic filter
    if (showOrganic) {
      result = result.filter(p => p.isOrganic);
    }

    // Price filter
    result = result.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.reverse();
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy, priceRange, showOrganic]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
    setPriceRange([0, 10000]);
    setShowOrganic(false);
    setSearchParams({});
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    showOrganic,
    priceRange[0] > 0 || priceRange[1] < 100000,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold font-heading mb-2">
            {t('products')}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} {t('products')}
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('searchProductsOrSellers')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t('sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">{t('sortFeatured')}</SelectItem>
              <SelectItem value="price-low">{t('sortPriceLowHigh')}</SelectItem>
              <SelectItem value="price-high">{t('sortPriceHighLow')}</SelectItem>
              <SelectItem value="rating">{t('sortRating')}</SelectItem>
              <SelectItem value="newest">{t('sortNewest')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Button (Mobile) */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden relative">
                <Filter className="w-4 h-4 mr-2" />
                {t('filter')}
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="ml-2 h-5 w-5 p-0 justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>{t('filter')}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3">{t('categories')}</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      All Products
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          selectedCategory === cat.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        {getCategoryName(cat)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Organic Filter */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOrganic}
                      onChange={(e) => setShowOrganic(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-primary"
                    />
                    <span className="font-medium">Organic Only</span>
                  </label>
                </div>

                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories */}
              <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
                <h3 className="font-semibold mb-3 flex items-center justify-between">
                  {t('categories')}
                  <ChevronDown className="w-4 h-4" />
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        selectedCategory === cat.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {getCategoryName(cat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organic Filter */}
              <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOrganic}
                    onChange={(e) => setShowOrganic(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-primary"
                  />
                  <span className="font-medium">🌿 Organic Only</span>
                </label>
              </div>

              {activeFiltersCount > 0 && (
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Active Filters */}
            {(selectedCategory !== 'all' || showOrganic) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory !== 'all' && (
                  <Badge variant="soft" className="gap-1 pr-1">
                    {categories.find(c => c.id === selectedCategory)?.icon}{' '}
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className="ml-1 hover:bg-primary/20 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {showOrganic && (
                  <Badge variant="success" className="gap-1 pr-1">
                    🌿 Organic
                    <button
                      onClick={() => setShowOrganic(false)}
                      className="ml-1 hover:bg-accent/80 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {products.length === 0 
                    ? "No sellers have added products yet. Check back later!"
                    : "Try adjusting your filters or search query"}
                </p>
                {products.length > 0 && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
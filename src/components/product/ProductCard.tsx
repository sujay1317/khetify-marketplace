import React, { memo, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Leaf, GitCompare, Check, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompare } from '@/contexts/CompareContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product }) => {
  const { addToCart } = useCart();
  const { language, t } = useLanguage();
  const { addToCompare, removeFromCompare, isInCompare, maxProducts, compareList } = useCompare();
  const navigate = useNavigate();

  const inCompare = isInCompare(product.id);

  const getLocalizedName = useMemo(() => {
    switch (language) {
      case 'hi':
        return product.nameHi;
      case 'mr':
        return product.nameMr;
      default:
        return product.name;
    }
  }, [language, product.nameHi, product.nameMr, product.name]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      description: `₹${product.price} × 1`,
      action: {
        label: 'View Cart',
        onClick: () => navigate('/cart'),
      },
    });
  }, [addToCart, product, navigate]);

  const handleCompareToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inCompare) {
      removeFromCompare(product.id);
      toast.info(`${product.name} removed from compare`);
    } else {
      if (compareList.length >= maxProducts) {
        toast.error(`You can compare up to ${maxProducts} products only`);
        return;
      }
      addToCompare({
        id: product.id,
        name: product.name,
        price: product.price,
        original_price: product.originalPrice,
        image: product.image,
        category: product.category,
        unit: product.unit,
        is_organic: product.isOrganic,
        description: product.description,
      });
      toast.success(`${product.name} added to compare`);
    }
  }, [inCompare, removeFromCompare, product, compareList.length, maxProducts, addToCompare]);

  const discountPercent = useMemo(() => product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0, [product.originalPrice, product.price]);

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card active:scale-[0.98]">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2">
            {product.isOrganic && (
              <Badge variant="success" className="gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Organic</span>
                <span className="sm:hidden">🌿</span>
              </Badge>
            )}
            {discountPercent > 0 && (
              <Badge variant="gold" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                {discountPercent}% OFF
              </Badge>
            )}
          </div>

          {/* Compare Button - Top right */}
          <Button
            variant={inCompare ? "default" : "glass"}
            size="icon"
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 ${inCompare ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all duration-300`}
            onClick={handleCompareToggle}
          >
            {inCompare ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <GitCompare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </Button>

          {/* Quick Add Button - Hidden on mobile, shown on hover for desktop */}
          <Button
            variant="glass"
            size="icon"
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 w-8 h-8 sm:w-10 sm:h-10 hidden sm:flex"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4">
          {/* Seller Name */}
          <Link
            to={`/store/${product.sellerId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-0.5 sm:mb-1 truncate block hover:text-primary transition-colors"
          >
            {product.sellerName}
          </Link>

          {/* Title */}
          <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-primary transition-colors leading-tight">
            {getLocalizedName}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2 sm:mb-3">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-secondary text-secondary" />
            <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-base sm:text-lg font-bold text-primary">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-sm text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                /{product.unit}
              </span>
            </div>
          </div>

          {/* Stock Status & Free Delivery */}
          <div className="flex items-center justify-between mt-1.5 sm:mt-2 gap-1 flex-wrap">
            <p className={`text-[10px] sm:text-xs ${product.stock > 0 ? 'text-accent' : 'text-destructive'}`}>
              {product.stock > 0 ? `${product.stock} ${t('inStock')}` : t('outOfStock')}
            </p>
            {product.freeDelivery && (
              <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 py-0 gap-0.5 text-accent border-accent/30">
                <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Free
              </Badge>
            )}
          </div>

          {/* Mobile Add to Cart Button */}
          <Button
            variant="default"
            size="sm"
            className="w-full mt-2 sm:hidden gap-1.5 h-9 text-xs"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </Button>
        </div>
      </Card>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

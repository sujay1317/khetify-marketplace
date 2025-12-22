import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Leaf } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { language, t } = useLanguage();

  const getLocalizedName = () => {
    switch (language) {
      case 'hi':
        return product.nameHi;
      case 'mr':
        return product.nameMr;
      default:
        return product.name;
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      description: `₹${product.price} × 1`,
      action: {
        label: 'View Cart',
        onClick: () => window.location.href = '/cart',
      },
    });
  };

  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
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

          {/* Quick Add Button */}
          <Button
            variant="glass"
            size="icon"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.sellerName}
          </p>

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {getLocalizedName()}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-secondary text-secondary" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({product.reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                /{product.unit}
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <p className={`text-xs mt-2 ${product.stock > 0 ? 'text-accent' : 'text-destructive'}`}>
            {product.stock > 0 ? `${product.stock} ${t('inStock')}` : t('outOfStock')}
          </p>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;

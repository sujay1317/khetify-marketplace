import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';

const Cart: React.FC = () => {
  const { t, language } = useLanguage();
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  const getLocalizedName = (product: typeof items[0]['product']) => {
    switch (language) {
      case 'hi': return product.nameHi;
      case 'mr': return product.nameMr;
      default: return product.name;
    }
  };

  const deliveryFee = totalPrice >= 500 ? 0 : 50;
  const finalTotal = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('emptyCart')}</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/products">
              <Button variant="hero" size="lg">
                {t('continueShopping')}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading mb-6">
          {t('yourCart')} ({totalItems} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.product.id} className="p-4 md:p-6">
                <div className="flex gap-4">
                  {/* Image */}
                  <Link to={`/product/${item.product.id}`} className="shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-muted">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="font-semibold text-sm md:text-base line-clamp-2 hover:text-primary transition-colors">
                        {getLocalizedName(item.product)}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.product.sellerName}
                    </p>
                    <p className="text-primary font-bold mt-2">
                      ₹{item.product.price} <span className="text-xs text-muted-foreground font-normal">/ {item.product.unit}</span>
                    </p>

                    {/* Quantity & Remove - Mobile */}
                    <div className="flex items-center justify-between mt-3 md:hidden">
                      <div className="flex items-center border border-border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quantity & Remove - Desktop */}
                  <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-xl">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="font-bold">₹{item.product.price * item.quantity}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <Link to="/products" className="inline-block">
              <Button variant="outline">
                {t('continueShopping')}
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={`font-medium ${deliveryFee === 0 ? 'text-accent' : ''}`}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                {totalPrice < 500 && (
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded-lg">
                    Add ₹{500 - totalPrice} more for free delivery!
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between text-base">
                  <span className="font-semibold">{t('total')}</span>
                  <span className="font-bold text-primary text-xl">₹{finalTotal}</span>
                </div>
              </div>

              <Link to="/checkout" className="block mt-6">
                <Button variant="hero" size="lg" className="w-full gap-2">
                  {t('checkout')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground mt-4">
                🔒 Secure checkout with SSL encryption
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;

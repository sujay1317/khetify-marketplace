import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const Checkout: React.FC = () => {
  const { t, language } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const deliveryFee = totalPrice >= 500 ? 0 : 50;
  const finalTotal = totalPrice + deliveryFee;

  const getLocalizedName = (product: typeof items[0]['product']) => {
    switch (language) {
      case 'hi': return product.nameHi;
      case 'mr': return product.nameMr;
      default: return product.name;
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.pincode) {
      toast.error('Please fill all required fields');
      return;
    }
    setStep('payment');
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep('success');
    clearCart();
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link to="/products">
            <Button variant="hero">Start Shopping</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="animate-scale-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for your order. Your order ID is:
            </p>
            <p className="text-xl font-mono font-bold text-primary mb-6">
              #KHT{Date.now().toString().slice(-8)}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              You will receive an SMS confirmation shortly with tracking details.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/orders">
                <Button variant="default">Track Order</Button>
              </Link>
              <Link to="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
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
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold font-heading mb-6">
          {t('checkout')}
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'shipping' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <span className="hidden sm:inline font-medium">Shipping</span>
          </div>
          <div className="flex-1 h-0.5 bg-muted" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <span className="hidden sm:inline font-medium">Payment</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-6 h-6 text-primary" />
                  <h2 className="text-lg font-bold">Shipping Address</h2>
                </div>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t('fullName')} *</label>
                      <Input
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t('phone')} *</label>
                      <Input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Address *</label>
                    <Input
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      placeholder="House/Flat No., Street, Area"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">City *</label>
                      <Input
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">State</label>
                      <Input
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Pincode *</label>
                      <Input
                        value={shippingInfo.pincode}
                        onChange={(e) => setShippingInfo({...shippingInfo, pincode: e.target.value})}
                        placeholder="411001"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full mt-6">
                    Continue to Payment
                  </Button>
                </form>
              </Card>
            )}

            {step === 'payment' && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <h2 className="text-lg font-bold">Payment Method</h2>
                </div>

                {/* Shipping Summary */}
                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium mb-1">Delivering to:</p>
                  <p className="text-sm text-muted-foreground">
                    {shippingInfo.fullName}, {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}
                  </p>
                  <button
                    onClick={() => setStep('shipping')}
                    className="text-primary text-sm font-medium mt-2"
                  >
                    Change Address
                  </button>
                </div>

                {/* Payment Options */}
                <div className="space-y-3">
                  {[
                    { id: 'upi', label: 'UPI Payment', desc: 'Google Pay, PhonePe, Paytm', icon: '📱' },
                    { id: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, RuPay', icon: '💳' },
                    { id: 'cod', label: 'Cash on Delivery', desc: '+₹20 COD charges', icon: '💵' },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-4 p-4 border-2 border-border rounded-xl cursor-pointer hover:border-primary transition-colors"
                    >
                      <input
                        type="radio"
                        name="payment"
                        defaultChecked={option.id === 'upi'}
                        className="w-5 h-5 text-primary"
                      />
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep('shipping')}>
                    Back
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Pay ₹${finalTotal}`}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{getLocalizedName(item.product)}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">₹{item.product.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-accent' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                  <span>{t('total')}</span>
                  <span className="text-primary">₹{finalTotal}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Leaf } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { sampleProducts, categories } from '@/data/products';

const Index: React.FC = () => {
  const { t, language } = useLanguage();
  const featuredProducts = sampleProducts.filter(p => p.isFeatured).slice(0, 4);

  const getCategoryName = (cat: typeof categories[0]) => {
    switch (language) {
      case 'hi': return cat.nameHi;
      case 'mr': return cat.nameMr;
      default: return cat.name;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient text-primary-foreground">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative container mx-auto px-4 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="max-w-2xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Leaf className="w-3 h-3 sm:w-4 sm:h-4" />
              {t('trustedBy')}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight mb-4 sm:mb-6">
              {t('heroTitle')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-6 sm:mb-8 leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/products" className="w-full sm:w-auto">
                <Button variant="gold" size="lg" className="gap-2 w-full sm:w-auto">
                  {t('shopNow')}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <Link to="/categories" className="w-full sm:w-auto">
                <Button variant="glass" size="lg" className="w-full sm:w-auto">
                  {t('exploreCategories')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-6 sm:py-8 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {[
              { icon: Truck, text: 'Free Delivery', subtext: 'Orders above ₹500' },
              { icon: Shield, text: '100% Genuine', subtext: 'Quality assured' },
              { icon: Headphones, text: '24/7 Support', subtext: 'Expert advice' },
              { icon: Leaf, text: 'Eco Friendly', subtext: 'Sustainable' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs sm:text-sm truncate">{feature.text}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{feature.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading">{t('categories')}</h2>
            <Link to="/categories">
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                {t('viewAll')} <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`}>
                <Card className="group p-2 sm:p-3 md:p-4 text-center hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 active:scale-[0.98]">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl sm:text-3xl shadow-md group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <h3 className="font-semibold text-[10px] sm:text-xs md:text-sm truncate">{getCategoryName(cat)}</h3>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">{cat.count} items</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading">{t('featured')}</h2>
            <Link to="/products">
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                {t('viewAll')} <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

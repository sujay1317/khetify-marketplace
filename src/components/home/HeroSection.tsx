import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection: React.FC = memo(() => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden hero-gradient text-primary-foreground">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=80')] bg-cover bg-center opacity-15" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-3 h-3 bg-secondary/60 rounded-full animate-float" />
        <div className="absolute top-40 right-[15%] w-2 h-2 bg-accent/60 rounded-full animate-float delay-500" />
        <div className="absolute bottom-32 left-[20%] w-4 h-4 bg-primary-foreground/30 rounded-full animate-float delay-1000" />
        <div className="absolute bottom-20 right-[25%] w-2 h-2 bg-secondary/50 rounded-full animate-float delay-700" />
      </div>

      <div className="relative container mx-auto px-4 py-16 sm:py-20 md:py-28 lg:py-36">
        <div className="max-w-2xl animate-fade-in">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-xs sm:text-sm font-medium mb-6 border border-white/20 shadow-lg">
            <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
            {t('trustedBy')}
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-heading leading-[1.1] mb-6 tracking-tight">
            <span className="inline-block animate-slide-up">
              {t('heroTitle').split(' ').slice(0, 2).join(' ')}
            </span>
            <br />
            <span className="inline-block text-secondary animate-slide-up delay-100">
              {t('heroTitle').split(' ').slice(2).join(' ')}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-primary-foreground/85 mb-8 leading-relaxed max-w-lg">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" className="w-full sm:w-auto">
              <Button 
                variant="gold" 
                size="lg" 
                className="gap-2.5 w-full sm:w-auto text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
              >
                {t('shopNow')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/categories" className="w-full sm:w-auto">
              <Button 
                variant="glass" 
                size="lg" 
                className="w-full sm:w-auto text-base font-medium backdrop-blur-md hover:bg-white/20"
              >
                <Leaf className="w-5 h-5 mr-2" />
                {t('exploreCategories')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-10 pt-8 border-t border-white/20">
            <div className="animate-fade-in delay-200">
              <div className="text-2xl sm:text-3xl font-bold text-secondary">50K+</div>
              <div className="text-xs sm:text-sm text-primary-foreground/70">Happy Farmers</div>
            </div>
            <div className="animate-fade-in delay-300">
              <div className="text-2xl sm:text-3xl font-bold text-secondary">500+</div>
              <div className="text-xs sm:text-sm text-primary-foreground/70">Products</div>
            </div>
            <div className="animate-fade-in delay-400">
              <div className="text-2xl sm:text-3xl font-bold text-secondary">100%</div>
              <div className="text-xs sm:text-sm text-primary-foreground/70">Genuine</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;

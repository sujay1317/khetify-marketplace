import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/data/products';

const CategoriesSection: React.FC = memo(() => {
  const { t, language } = useLanguage();

  const getCategoryName = useMemo(() => (cat: typeof categories[0]) => {
    switch (language) {
      case 'hi': return cat.nameHi;
      case 'mr': return cat.nameMr;
      default: return cat.name;
    }
  }, [language]);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading">{t('categories')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('browseByCategory')}</p>
          </div>
          <Link to="/categories">
            <Button variant="ghost" size="sm" className="gap-2 group">
              {t('viewAll')} 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((cat, index) => (
            <Link 
              key={cat.id} 
              to={`/products?category=${cat.id}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="group p-3 md:p-4 text-center hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 active:scale-[0.98] border-transparent hover:border-primary/20 bg-gradient-to-b from-card to-card/80">
                <div 
                  className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-xs md:text-sm truncate">{getCategoryName(cat)}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{cat.count} items</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
});

CategoriesSection.displayName = 'CategoriesSection';

export default CategoriesSection;

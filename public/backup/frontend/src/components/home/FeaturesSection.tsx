import React, { memo } from 'react';
import { Truck, Shield, Headphones, Leaf } from 'lucide-react';

const features = [
  { icon: Truck, text: 'Fast Delivery', subtext: '₹30 per item, max ₹200', color: 'text-sky' },
  { icon: Shield, text: '100% Genuine', subtext: 'Quality assured', color: 'text-primary' },
  { icon: Headphones, text: '24/7 Support', subtext: 'Expert advice', color: 'text-secondary' },
  { icon: Leaf, text: 'Eco Friendly', subtext: 'Sustainable', color: 'text-accent' },
];

const FeaturesSection: React.FC = memo(() => {
  return (
    <section className="py-8 bg-gradient-to-r from-muted/50 via-card/50 to-muted/50 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-card/80 transition-colors group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{feature.text}</p>
                <p className="text-xs text-muted-foreground truncate">{feature.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;

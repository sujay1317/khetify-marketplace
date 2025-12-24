import React from 'react';
import { Link } from 'react-router-dom';
import { X, GitCompare, Trash2 } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';

const CompareBar: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, maxProducts } = useCompare();

  if (compareList.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 bg-card border border-border rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">
            Compare Products ({compareList.length}/{maxProducts})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCompare}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>
      
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {compareList.map((product) => (
          <div
            key={product.id}
            className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted"
          >
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => removeFromCompare(product.id)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-1 py-0.5">
              <p className="text-[10px] font-medium truncate text-foreground">{product.name}</p>
            </div>
          </div>
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: maxProducts - compareList.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
          >
            <span className="text-xs text-muted-foreground">+</span>
          </div>
        ))}
        
        <Link to="/compare" className="flex-shrink-0">
          <Button className="h-20 px-6">
            Compare Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CompareBar;

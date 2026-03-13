import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CompareProduct {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image?: string | null;
  category: string;
  unit?: string | null;
  is_organic?: boolean | null;
  description?: string | null;
}

interface CompareContextType {
  compareList: CompareProduct[];
  addToCompare: (product: CompareProduct) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  maxProducts: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_PRODUCTS = 4;

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<CompareProduct[]>([]);

  const addToCompare = (product: CompareProduct): boolean => {
    if (compareList.length >= MAX_COMPARE_PRODUCTS) {
      return false;
    }
    if (compareList.some(p => p.id === product.id)) {
      return true;
    }
    setCompareList(prev => [...prev, product]);
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (productId: string): boolean => {
    return compareList.some(p => p.id === productId);
  };

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      maxProducts: MAX_COMPARE_PRODUCTS
    }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'mr';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: 'Home', hi: 'होम', mr: 'मुख्यपृष्ठ' },
  products: { en: 'Products', hi: 'उत्पाद', mr: 'उत्पादने' },
  categories: { en: 'Categories', hi: 'श्रेणियाँ', mr: 'श्रेण्या' },
  cart: { en: 'Cart', hi: 'कार्ट', mr: 'कार्ट' },
  orders: { en: 'Orders', hi: 'ऑर्डर', mr: 'ऑर्डर' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल', mr: 'प्रोफाइल' },
  login: { en: 'Login', hi: 'लॉगिन', mr: 'लॉगिन' },
  signup: { en: 'Sign Up', hi: 'साइन अप', mr: 'साइन अप' },
  logout: { en: 'Logout', hi: 'लॉगआउट', mr: 'लॉगआउट' },
  
  // Hero Section
  heroTitle: { 
    en: 'Farm Fresh, Farm Direct', 
    hi: 'खेत से ताज़ा, खेत से सीधा', 
    mr: 'शेतातून ताजे, शेतातून थेट' 
  },
  heroSubtitle: { 
    en: 'Quality seeds, fertilizers, pesticides & farm tools delivered to your doorstep', 
    hi: 'गुणवत्तापूर्ण बीज, खाद, कीटनाशक और खेती के उपकरण आपके दरवाजे पर',
    mr: 'दर्जेदार बियाणे, खते, कीटकनाशके आणि शेती साधने तुमच्या दारात' 
  },
  shopNow: { en: 'Shop Now', hi: 'अभी खरीदें', mr: 'आता खरेदी करा' },
  exploreCategories: { en: 'Explore Categories', hi: 'श्रेणियाँ देखें', mr: 'श्रेण्या पहा' },
  
  // Categories
  seeds: { en: 'Seeds', hi: 'बीज', mr: 'बियाणे' },
  fertilizers: { en: 'Fertilizers', hi: 'खाद', mr: 'खते' },
  pesticides: { en: 'Pesticides', hi: 'कीटनाशक', mr: 'कीटकनाशके' },
  tools: { en: 'Farm Tools', hi: 'खेती उपकरण', mr: 'शेती साधने' },
  organic: { en: 'Organic', hi: 'जैविक', mr: 'सेंद्रिय' },
  irrigation: { en: 'Irrigation', hi: 'सिंचाई', mr: 'सिंचन' },
  
  // Product
  addToCart: { en: 'Add to Cart', hi: 'कार्ट में जोड़ें', mr: 'कार्टमध्ये जोडा' },
  buyNow: { en: 'Buy Now', hi: 'अभी खरीदें', mr: 'आता खरेदी करा' },
  inStock: { en: 'In Stock', hi: 'स्टॉक में', mr: 'स्टॉकमध्ये' },
  outOfStock: { en: 'Out of Stock', hi: 'स्टॉक में नहीं', mr: 'स्टॉकमध्ये नाही' },
  perKg: { en: 'per kg', hi: 'प्रति किलो', mr: 'प्रति किलो' },
  perUnit: { en: 'per unit', hi: 'प्रति यूनिट', mr: 'प्रति युनिट' },
  
  // Cart & Checkout
  yourCart: { en: 'Your Cart', hi: 'आपका कार्ट', mr: 'तुमचा कार्ट' },
  checkout: { en: 'Checkout', hi: 'चेकआउट', mr: 'चेकआउट' },
  total: { en: 'Total', hi: 'कुल', mr: 'एकूण' },
  continueShopping: { en: 'Continue Shopping', hi: 'खरीदारी जारी रखें', mr: 'खरेदी सुरू ठेवा' },
  emptyCart: { en: 'Your cart is empty', hi: 'आपका कार्ट खाली है', mr: 'तुमचा कार्ट रिकामा आहे' },
  
  // Featured
  featured: { en: 'Featured Products', hi: 'विशेष उत्पाद', mr: 'वैशिष्ट्यीकृत उत्पादने' },
  newArrivals: { en: 'New Arrivals', hi: 'नए उत्पाद', mr: 'नवीन उत्पादने' },
  bestSellers: { en: 'Best Sellers', hi: 'बेस्टसेलर', mr: 'सर्वाधिक विक्री' },
  
  // Footer
  aboutUs: { en: 'About Us', hi: 'हमारे बारे में', mr: 'आमच्याबद्दल' },
  contact: { en: 'Contact', hi: 'संपर्क', mr: 'संपर्क' },
  helpCenter: { en: 'Help Center', hi: 'सहायता केंद्र', mr: 'मदत केंद्र' },
  termsOfService: { en: 'Terms of Service', hi: 'सेवा की शर्तें', mr: 'सेवा अटी' },
  privacyPolicy: { en: 'Privacy Policy', hi: 'गोपनीयता नीति', mr: 'गोपनीयता धोरण' },
  
  // Auth
  email: { en: 'Email', hi: 'ईमेल', mr: 'ईमेल' },
  password: { en: 'Password', hi: 'पासवर्ड', mr: 'पासवर्ड' },
  confirmPassword: { en: 'Confirm Password', hi: 'पासवर्ड की पुष्टि', mr: 'पासवर्ड पुष्टी करा' },
  fullName: { en: 'Full Name', hi: 'पूरा नाम', mr: 'पूर्ण नाव' },
  phone: { en: 'Phone Number', hi: 'फोन नंबर', mr: 'फोन नंबर' },
  welcomeBack: { en: 'Welcome Back!', hi: 'वापस स्वागत है!', mr: 'परत स्वागत आहे!' },
  createAccount: { en: 'Create Account', hi: 'खाता बनाएं', mr: 'खाते तयार करा' },
  
  // Misc
  search: { en: 'Search products...', hi: 'उत्पाद खोजें...', mr: 'उत्पादने शोधा...' },
  filter: { en: 'Filter', hi: 'फ़िल्टर', mr: 'फिल्टर' },
  sortBy: { en: 'Sort By', hi: 'इसके अनुसार क्रमित करें', mr: 'यानुसार क्रमवारी लावा' },
  viewAll: { en: 'View All', hi: 'सभी देखें', mr: 'सर्व पहा' },
  trustedBy: { en: 'Trusted by 10,000+ farmers', hi: '10,000+ किसानों का विश्वास', mr: '10,000+ शेतकऱ्यांचा विश्वास' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
};

export type { Language };

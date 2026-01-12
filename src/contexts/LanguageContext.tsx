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
  sellers: { en: 'Sellers', hi: 'विक्रेता', mr: 'विक्रेते' },
  wishlist: { en: 'Wishlist', hi: 'इच्छा सूची', mr: 'इच्छा यादी' },
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  myOrders: { en: 'My Orders', hi: 'मेरे ऑर्डर', mr: 'माझे ऑर्डर' },
  settings: { en: 'Settings', hi: 'सेटिंग्स', mr: 'सेटिंग्ज' },
  
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
  freeDelivery: { en: 'Free Delivery', hi: 'मुफ्त डिलीवरी', mr: 'मोफत वितरण' },
  quantity: { en: 'Quantity', hi: 'मात्रा', mr: 'प्रमाण' },
  description: { en: 'Description', hi: 'विवरण', mr: 'वर्णन' },
  reviews: { en: 'Reviews', hi: 'समीक्षाएं', mr: 'पुनरावलोकने' },
  rating: { en: 'Rating', hi: 'रेटिंग', mr: 'रेटिंग' },
  writeReview: { en: 'Write a Review', hi: 'समीक्षा लिखें', mr: 'पुनरावलोकन लिहा' },
  relatedProducts: { en: 'Related Products', hi: 'संबंधित उत्पाद', mr: 'संबंधित उत्पादने' },
  
  // Cart & Checkout
  yourCart: { en: 'Your Cart', hi: 'आपका कार्ट', mr: 'तुमचा कार्ट' },
  checkout: { en: 'Checkout', hi: 'चेकआउट', mr: 'चेकआउट' },
  total: { en: 'Total', hi: 'कुल', mr: 'एकूण' },
  subtotal: { en: 'Subtotal', hi: 'उप-योग', mr: 'उप-एकूण' },
  delivery: { en: 'Delivery', hi: 'डिलीवरी', mr: 'वितरण' },
  continueShopping: { en: 'Continue Shopping', hi: 'खरीदारी जारी रखें', mr: 'खरेदी सुरू ठेवा' },
  emptyCart: { en: 'Your cart is empty', hi: 'आपका कार्ट खाली है', mr: 'तुमचा कार्ट रिकामा आहे' },
  proceedToCheckout: { en: 'Proceed to Checkout', hi: 'चेकआउट करें', mr: 'चेकआउटला जा' },
  removeFromCart: { en: 'Remove from Cart', hi: 'कार्ट से हटाएं', mr: 'कार्टमधून काढा' },
  
  // Checkout
  shippingAddress: { en: 'Shipping Address', hi: 'डिलीवरी पता', mr: 'वितरण पत्ता' },
  paymentMethod: { en: 'Payment Method', hi: 'भुगतान का तरीका', mr: 'पेमेंट पद्धत' },
  placeOrder: { en: 'Place Order', hi: 'ऑर्डर करें', mr: 'ऑर्डर द्या' },
  orderConfirmed: { en: 'Order Confirmed!', hi: 'ऑर्डर की पुष्टि!', mr: 'ऑर्डर पुष्टी!' },
  orderPlaced: { en: 'Order Placed Successfully', hi: 'ऑर्डर सफलतापूर्वक दिया गया', mr: 'ऑर्डर यशस्वीरित्या दिला' },
  address: { en: 'Address', hi: 'पता', mr: 'पत्ता' },
  city: { en: 'City', hi: 'शहर', mr: 'शहर' },
  state: { en: 'State', hi: 'राज्य', mr: 'राज्य' },
  pincode: { en: 'Pincode', hi: 'पिनकोड', mr: 'पिनकोड' },
  landmark: { en: 'Landmark', hi: 'लैंडमार्क', mr: 'खूण' },
  
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
  forgotPassword: { en: 'Forgot Password?', hi: 'पासवर्ड भूल गए?', mr: 'पासवर्ड विसरलात?' },
  dontHaveAccount: { en: "Don't have an account?", hi: 'खाता नहीं है?', mr: 'खाते नाही?' },
  alreadyHaveAccount: { en: 'Already have an account?', hi: 'पहले से खाता है?', mr: 'आधीच खाते आहे?' },
  
  // Sellers
  ourSellers: { en: 'Our Sellers', hi: 'हमारे विक्रेता', mr: 'आमचे विक्रेते' },
  discoverSellers: { en: 'Discover trusted farmers and sellers', hi: 'विश्वसनीय किसानों और विक्रेताओं को खोजें', mr: 'विश्वासार्ह शेतकरी आणि विक्रेते शोधा' },
  searchSellers: { en: 'Search sellers by name...', hi: 'नाम से विक्रेता खोजें...', mr: 'नावाने विक्रेते शोधा...' },
  noSellersFound: { en: 'No Sellers Found', hi: 'कोई विक्रेता नहीं मिला', mr: 'कोणतेही विक्रेते सापडले नाहीत' },
  noSellersYet: { en: 'No Sellers Yet', hi: 'अभी कोई विक्रेता नहीं', mr: 'अद्याप विक्रेते नाहीत' },
  tryDifferentSearch: { en: 'Try a different search term.', hi: 'कोई अलग खोज शब्द आज़माएं।', mr: 'वेगळा शोध शब्द वापरून पहा.' },
  checkBackLater: { en: 'Check back later for new sellers.', hi: 'नए विक्रेताओं के लिए बाद में देखें।', mr: 'नवीन विक्रेत्यांसाठी नंतर तपासा.' },
  seller: { en: 'Seller', hi: 'विक्रेता', mr: 'विक्रेता' },
  viewStore: { en: 'View Store', hi: 'दुकान देखें', mr: 'दुकान पहा' },
  
  // Wishlist
  myWishlist: { en: 'My Wishlist', hi: 'मेरी इच्छा सूची', mr: 'माझी इच्छा यादी' },
  emptyWishlist: { en: 'Your wishlist is empty', hi: 'आपकी इच्छा सूची खाली है', mr: 'तुमची इच्छा यादी रिकामी आहे' },
  removeFromWishlist: { en: 'Remove from Wishlist', hi: 'इच्छा सूची से हटाएं', mr: 'इच्छा यादीतून काढा' },
  addToWishlist: { en: 'Add to Wishlist', hi: 'इच्छा सूची में जोड़ें', mr: 'इच्छा यादीत जोडा' },
  
  // Misc
  search: { en: 'Search products...', hi: 'उत्पाद खोजें...', mr: 'उत्पादने शोधा...' },
  filter: { en: 'Filter', hi: 'फ़िल्टर', mr: 'फिल्टर' },
  filters: { en: 'Filters', hi: 'फ़िल्टर्स', mr: 'फिल्टर्स' },
  clearFilters: { en: 'Clear Filters', hi: 'फ़िल्टर साफ़ करें', mr: 'फिल्टर साफ करा' },
  sortBy: { en: 'Sort By', hi: 'इसके अनुसार क्रमित करें', mr: 'यानुसार क्रमवारी लावा' },
  viewAll: { en: 'View All', hi: 'सभी देखें', mr: 'सर्व पहा' },
  trustedBy: { en: 'Trusted by 10,000+ farmers', hi: '10,000+ किसानों का विश्वास', mr: '10,000+ शेतकऱ्यांचा विश्वास' },
  loading: { en: 'Loading...', hi: 'लोड हो रहा है...', mr: 'लोड होत आहे...' },
  noProductsFound: { en: 'No products found', hi: 'कोई उत्पाद नहीं मिला', mr: 'कोणतेही उत्पादने सापडली नाहीत' },
  save: { en: 'Save', hi: 'सहेजें', mr: 'जतन करा' },
  cancel: { en: 'Cancel', hi: 'रद्द करें', mr: 'रद्द करा' },
  delete: { en: 'Delete', hi: 'हटाएं', mr: 'हटवा' },
  edit: { en: 'Edit', hi: 'संपादित करें', mr: 'संपादित करा' },
  update: { en: 'Update', hi: 'अपडेट करें', mr: 'अद्यतनित करा' },
  submit: { en: 'Submit', hi: 'जमा करें', mr: 'सबमिट करा' },
  back: { en: 'Back', hi: 'वापस', mr: 'मागे' },
  next: { en: 'Next', hi: 'अगला', mr: 'पुढे' },
  previous: { en: 'Previous', hi: 'पिछला', mr: 'मागील' },
  yes: { en: 'Yes', hi: 'हाँ', mr: 'होय' },
  no: { en: 'No', hi: 'नहीं', mr: 'नाही' },
  confirm: { en: 'Confirm', hi: 'पुष्टि करें', mr: 'पुष्टी करा' },
  
  // Order Status
  pending: { en: 'Pending', hi: 'लंबित', mr: 'प्रलंबित' },
  processing: { en: 'Processing', hi: 'प्रोसेसिंग', mr: 'प्रक्रिया सुरू' },
  shipped: { en: 'Shipped', hi: 'भेज दिया गया', mr: 'पाठवले' },
  delivered: { en: 'Delivered', hi: 'डिलीवर हो गया', mr: 'वितरित' },
  cancelled: { en: 'Cancelled', hi: 'रद्द', mr: 'रद्द' },
  
  // Farmer Corner
  farmerCorner: { en: 'Farmer Corner', hi: 'किसान कॉर्नर', mr: 'शेतकरी कॉर्नर' },
  farmerForum: { en: 'Farmer Forum', hi: 'किसान फोरम', mr: 'शेतकरी मंच' },
  
  // Common Actions
  viewDetails: { en: 'View Details', hi: 'विवरण देखें', mr: 'तपशील पहा' },
  addNew: { en: 'Add New', hi: 'नया जोड़ें', mr: 'नवीन जोडा' },
  seeMore: { en: 'See More', hi: 'और देखें', mr: 'अधिक पहा' },
  seeLess: { en: 'See Less', hi: 'कम देखें', mr: 'कमी पहा' },
  share: { en: 'Share', hi: 'साझा करें', mr: 'शेअर करा' },
  copy: { en: 'Copy', hi: 'कॉपी करें', mr: 'कॉपी करा' },
  copied: { en: 'Copied!', hi: 'कॉपी हो गया!', mr: 'कॉपी झाले!' },
  
  // Time/Date
  today: { en: 'Today', hi: 'आज', mr: 'आज' },
  yesterday: { en: 'Yesterday', hi: 'कल', mr: 'काल' },
  daysAgo: { en: 'days ago', hi: 'दिन पहले', mr: 'दिवसांपूर्वी' },
  
  // Messages
  success: { en: 'Success', hi: 'सफल', mr: 'यशस्वी' },
  error: { en: 'Error', hi: 'त्रुटि', mr: 'त्रुटी' },
  warning: { en: 'Warning', hi: 'चेतावनी', mr: 'चेतावणी' },
  info: { en: 'Info', hi: 'जानकारी', mr: 'माहिती' },
  
  // Compare
  compare: { en: 'Compare', hi: 'तुलना करें', mr: 'तुलना करा' },
  addToCompare: { en: 'Add to Compare', hi: 'तुलना में जोड़ें', mr: 'तुलनेत जोडा' },
  removeFromCompare: { en: 'Remove from Compare', hi: 'तुलना से हटाएं', mr: 'तुलनेतून काढा' },
  compareProducts: { en: 'Compare Products', hi: 'उत्पादों की तुलना करें', mr: 'उत्पादनांची तुलना करा' },
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

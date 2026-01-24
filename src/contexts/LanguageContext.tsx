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
  price: { en: 'Price', hi: 'कीमत', mr: 'किंमत' },
  stock: { en: 'Stock', hi: 'स्टॉक', mr: 'स्टॉक' },
  unit: { en: 'Unit', hi: 'इकाई', mr: 'एकक' },
  image: { en: 'Image', hi: 'छवि', mr: 'प्रतिमा' },
  productName: { en: 'Product Name', hi: 'उत्पाद का नाम', mr: 'उत्पादनाचे नाव' },
  productNameHindi: { en: 'Product Name (Hindi)', hi: 'उत्पाद का नाम (हिंदी)', mr: 'उत्पादनाचे नाव (हिंदी)' },
  originalPrice: { en: 'Original Price', hi: 'मूल कीमत', mr: 'मूळ किंमत' },
  selectCategory: { en: 'Select Category', hi: 'श्रेणी चुनें', mr: 'श्रेणी निवडा' },
  
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
  cartItems: { en: 'Cart Items', hi: 'कार्ट आइटम', mr: 'कार्ट आयटम' },
  
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
  payment: { en: 'Payment', hi: 'भुगतान', mr: 'पेमेंट' },
  cashOnDelivery: { en: 'Cash on Delivery', hi: 'कैश ऑन डिलीवरी', mr: 'कॅश ऑन डिलिव्हरी' },
  onlinePayment: { en: 'Online Payment', hi: 'ऑनलाइन भुगतान', mr: 'ऑनलाइन पेमेंट' },
  
  // Featured
  featured: { en: 'Featured Products', hi: 'विशेष उत्पाद', mr: 'वैशिष्ट्यीकृत उत्पादने' },
  newArrivals: { en: 'New Arrivals', hi: 'नए उत्पाद', mr: 'नवीन उत्पादने' },
  bestSellers: { en: 'Best Sellers', hi: 'बेस्टसेलर', mr: 'सर्वाधिक विक्री' },
  freshPicks: { en: 'Fresh picks for you', hi: 'आपके लिए ताज़ा चयन', mr: 'तुमच्यासाठी ताजे निवड' },
  browseByCategory: { en: 'Browse by category', hi: 'श्रेणी द्वारा ब्राउज़ करें', mr: 'श्रेणीनुसार ब्राउझ करा' },
  
  // Footer
  aboutUs: { en: 'About Us', hi: 'हमारे बारे में', mr: 'आमच्याबद्दल' },
  contact: { en: 'Contact', hi: 'संपर्क', mr: 'संपर्क' },
  helpCenter: { en: 'Help Center', hi: 'सहायता केंद्र', mr: 'मदत केंद्र' },
  termsOfService: { en: 'Terms of Service', hi: 'सेवा की शर्तें', mr: 'सेवा अटी' },
  privacyPolicy: { en: 'Privacy Policy', hi: 'गोपनीयता नीति', mr: 'गोपनीयता धोरण' },
  quickLinks: { en: 'Quick Links', hi: 'त्वरित लिंक', mr: 'जलद दुवे' },
  support: { en: 'Support', hi: 'सहायता', mr: 'सहाय्य' },
  allRightsReserved: { en: 'All rights reserved', hi: 'सर्वाधिकार सुरक्षित', mr: 'सर्व हक्क राखीव' },
  connectingFarmers: { en: 'Connecting sellers with farmers across India', hi: 'भारत भर में किसानों को विक्रेताओं से जोड़ना', mr: 'भारतभरातील शेतकऱ्यांना विक्रेत्यांशी जोडणे' },
  
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
  currentPassword: { en: 'Current Password', hi: 'वर्तमान पासवर्ड', mr: 'सध्याचा पासवर्ड' },
  newPassword: { en: 'New Password', hi: 'नया पासवर्ड', mr: 'नवीन पासवर्ड' },
  changePassword: { en: 'Change Password', hi: 'पासवर्ड बदलें', mr: 'पासवर्ड बदला' },
  
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
  sellerSince: { en: 'Seller since', hi: 'विक्रेता तब से', mr: 'विक्रेता तेव्हापासून' },
  unknownSeller: { en: 'Unknown Seller', hi: 'अज्ञात विक्रेता', mr: 'अज्ञात विक्रेता' },
  
  // Wishlist
  myWishlist: { en: 'My Wishlist', hi: 'मेरी इच्छा सूची', mr: 'माझी इच्छा यादी' },
  emptyWishlist: { en: 'Your wishlist is empty', hi: 'आपकी इच्छा सूची खाली है', mr: 'तुमची इच्छा यादी रिकामी आहे' },
  removeFromWishlist: { en: 'Remove from Wishlist', hi: 'इच्छा सूची से हटाएं', mr: 'इच्छा यादीतून काढा' },
  addToWishlist: { en: 'Add to Wishlist', hi: 'इच्छा सूची में जोड़ें', mr: 'इच्छा यादीत जोडा' },
  
  // Misc
  search: { en: 'Search products...', hi: 'उत्पाद खोजें...', mr: 'उत्पादने शोधा...' },
  searchProductsOrSellers: { en: 'Search products or sellers...', hi: 'उत्पाद या विक्रेता खोजें...', mr: 'उत्पादने किंवा विक्रेते शोधा...' },
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
  close: { en: 'Close', hi: 'बंद करें', mr: 'बंद करा' },
  add: { en: 'Add', hi: 'जोड़ें', mr: 'जोडा' },
  remove: { en: 'Remove', hi: 'हटाएं', mr: 'काढा' },
  view: { en: 'View', hi: 'देखें', mr: 'पहा' },
  upload: { en: 'Upload', hi: 'अपलोड', mr: 'अपलोड' },
  download: { en: 'Download', hi: 'डाउनलोड', mr: 'डाउनलोड' },
  
  // Order Status
  pending: { en: 'Pending', hi: 'लंबित', mr: 'प्रलंबित' },
  processing: { en: 'Processing', hi: 'प्रोसेसिंग', mr: 'प्रक्रिया सुरू' },
  shipped: { en: 'Shipped', hi: 'भेज दिया गया', mr: 'पाठवले' },
  delivered: { en: 'Delivered', hi: 'डिलीवर हो गया', mr: 'वितरित' },
  cancelled: { en: 'Cancelled', hi: 'रद्द', mr: 'रद्द' },
  confirmed: { en: 'Confirmed', hi: 'पुष्टि', mr: 'पुष्टी' },
  orderStatus: { en: 'Order Status', hi: 'ऑर्डर स्थिति', mr: 'ऑर्डर स्थिती' },
  orderNumber: { en: 'Order #', hi: 'ऑर्डर #', mr: 'ऑर्डर #' },
  orderId: { en: 'Order ID', hi: 'ऑर्डर आईडी', mr: 'ऑर्डर आयडी' },
  orderDate: { en: 'Order Date', hi: 'ऑर्डर की तारीख', mr: 'ऑर्डर तारीख' },
  orderTotal: { en: 'Order Total', hi: 'ऑर्डर कुल', mr: 'ऑर्डर एकूण' },
  orderDetails: { en: 'Order Details', hi: 'ऑर्डर विवरण', mr: 'ऑर्डर तपशील' },
  trackOrder: { en: 'Track Order', hi: 'ऑर्डर ट्रैक करें', mr: 'ऑर्डर ट्रॅक करा' },
  
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
  
  // Seller Dashboard
  overview: { en: 'Overview', hi: 'अवलोकन', mr: 'आढावा' },
  myProducts: { en: 'My Products', hi: 'मेरे उत्पाद', mr: 'माझी उत्पादने' },
  addProduct: { en: 'Add Product', hi: 'उत्पाद जोड़ें', mr: 'उत्पादन जोडा' },
  editProduct: { en: 'Edit Product', hi: 'उत्पाद संपादित करें', mr: 'उत्पादन संपादित करा' },
  deleteProduct: { en: 'Delete Product', hi: 'उत्पाद हटाएं', mr: 'उत्पादन हटवा' },
  pendingApproval: { en: 'Pending Approval', hi: 'अनुमोदन लंबित', mr: 'मंजुरी प्रलंबित' },
  approved: { en: 'Approved', hi: 'अनुमोदित', mr: 'मंजूर' },
  totalProducts: { en: 'Total Products', hi: 'कुल उत्पाद', mr: 'एकूण उत्पादने' },
  totalOrders: { en: 'Total Orders', hi: 'कुल ऑर्डर', mr: 'एकूण ऑर्डर' },
  revenue: { en: 'Revenue', hi: 'राजस्व', mr: 'महसूल' },
  totalRevenue: { en: 'Total Revenue', hi: 'कुल राजस्व', mr: 'एकूण महसूल' },
  recentOrders: { en: 'Recent Orders', hi: 'हाल के ऑर्डर', mr: 'अलीकडील ऑर्डर' },
  noOrders: { en: 'No orders yet', hi: 'अभी कोई ऑर्डर नहीं', mr: 'अद्याप ऑर्डर नाहीत' },
  noProducts: { en: 'No products yet', hi: 'अभी कोई उत्पाद नहीं', mr: 'अद्याप उत्पादने नाहीत' },
  qty: { en: 'Qty', hi: 'मात्रा', mr: 'संख्या' },
  each: { en: 'each', hi: 'प्रत्येक', mr: 'प्रत्येकी' },
  shopBanner: { en: 'Shop Banner', hi: 'दुकान बैनर', mr: 'दुकान बॅनर' },
  shopBannerImage: { en: 'Shop Banner Image', hi: 'दुकान बैनर छवि', mr: 'दुकान बॅनर प्रतिमा' },
  uploadBanner: { en: 'Upload Banner', hi: 'बैनर अपलोड करें', mr: 'बॅनर अपलोड करा' },
  removeBanner: { en: 'Remove Banner', hi: 'बैनर हटाएं', mr: 'बॅनर काढा' },
  
  // Seller Home
  goodMorning: { en: 'Good Morning', hi: 'शुभ प्रभात', mr: 'शुभ सकाळ' },
  goodAfternoon: { en: 'Good Afternoon', hi: 'शुभ अपराह्न', mr: 'शुभ दुपार' },
  goodEvening: { en: 'Good Evening', hi: 'शुभ संध्या', mr: 'शुभ संध्याकाळ' },
  quickActions: { en: 'Quick Actions', hi: 'त्वरित कार्य', mr: 'जलद क्रिया' },
  manageListings: { en: 'Manage Listings', hi: 'लिस्टिंग प्रबंधित करें', mr: 'यादी व्यवस्थापित करा' },
  viewMyStore: { en: 'View My Store', hi: 'मेरी दुकान देखें', mr: 'माझे दुकान पहा' },
  tipsAndInsights: { en: 'Tips & Insights', hi: 'टिप्स और जानकारी', mr: 'टिप्स आणि माहिती' },
  communityAndResources: { en: 'Community & Resources', hi: 'समुदाय और संसाधन', mr: 'समुदाय आणि संसाधने' },
  profileCompletion: { en: 'Profile Completion', hi: 'प्रोफ़ाइल पूर्णता', mr: 'प्रोफाइल पूर्णता' },
  completeProfile: { en: 'Complete Profile', hi: 'प्रोफ़ाइल पूरा करें', mr: 'प्रोफाइल पूर्ण करा' },
  
  // Admin
  admin: { en: 'Admin', hi: 'एडमिन', mr: 'अ‍ॅडमिन' },
  manageUsers: { en: 'Manage Users', hi: 'उपयोगकर्ता प्रबंधित करें', mr: 'वापरकर्ते व्यवस्थापित करा' },
  manageOrders: { en: 'Manage Orders', hi: 'ऑर्डर प्रबंधित करें', mr: 'ऑर्डर व्यवस्थापित करा' },
  manageProducts: { en: 'Manage Products', hi: 'उत्पाद प्रबंधित करें', mr: 'उत्पादने व्यवस्थापित करा' },
  analytics: { en: 'Analytics', hi: 'विश्लेषण', mr: 'विश्लेषण' },
  coupons: { en: 'Coupons', hi: 'कूपन', mr: 'कूपन' },
  active: { en: 'Active', hi: 'सक्रिय', mr: 'सक्रिय' },
  inactive: { en: 'Inactive', hi: 'निष्क्रिय', mr: 'निष्क्रिय' },
  noExpiry: { en: 'No expiry', hi: 'कोई समाप्ति नहीं', mr: 'कोणती समाप्ती नाही' },
  discountType: { en: 'Discount Type', hi: 'छूट का प्रकार', mr: 'सवलत प्रकार' },
  discountValue: { en: 'Discount Value', hi: 'छूट मूल्य', mr: 'सवलत मूल्य' },
  minOrderAmount: { en: 'Min Order Amount', hi: 'न्यूनतम ऑर्डर राशि', mr: 'किमान ऑर्डर रक्कम' },
  validFrom: { en: 'Valid From', hi: 'से मान्य', mr: 'पासून वैध' },
  validUntil: { en: 'Valid Until', hi: 'तक मान्य', mr: 'पर्यंत वैध' },
  maxUses: { en: 'Max Uses', hi: 'अधिकतम उपयोग', mr: 'जास्तीत जास्त वापर' },
  usedCount: { en: 'Used Count', hi: 'उपयोग गणना', mr: 'वापर संख्या' },
  couponCode: { en: 'Coupon Code', hi: 'कूपन कोड', mr: 'कूपन कोड' },
  createCoupon: { en: 'Create Coupon', hi: 'कूपन बनाएं', mr: 'कूपन तयार करा' },
  sellerReport: { en: 'Seller Report', hi: 'विक्रेता रिपोर्ट', mr: 'विक्रेता अहवाल' },
  
  // Customer Profile
  personalInfo: { en: 'Personal Information', hi: 'व्यक्तिगत जानकारी', mr: 'वैयक्तिक माहिती' },
  savedAddresses: { en: 'Saved Addresses', hi: 'सहेजे गए पते', mr: 'जतन केलेले पत्ते' },
  addNewAddress: { en: 'Add New Address', hi: 'नया पता जोड़ें', mr: 'नवीन पत्ता जोडा' },
  defaultAddress: { en: 'Default Address', hi: 'डिफ़ॉल्ट पता', mr: 'डीफॉल्ट पत्ता' },
  makeDefault: { en: 'Make Default', hi: 'डिफ़ॉल्ट बनाएं', mr: 'डीफॉल्ट करा' },
  
  // Form Labels
  name: { en: 'Name', hi: 'नाम', mr: 'नाव' },
  enterName: { en: 'Enter name', hi: 'नाम दर्ज करें', mr: 'नाव प्रविष्ट करा' },
  enterEmail: { en: 'Enter email', hi: 'ईमेल दर्ज करें', mr: 'ईमेल प्रविष्ट करा' },
  enterPhone: { en: 'Enter phone number', hi: 'फोन नंबर दर्ज करें', mr: 'फोन नंबर प्रविष्ट करा' },
  enterAddress: { en: 'Enter address', hi: 'पता दर्ज करें', mr: 'पत्ता प्रविष्ट करा' },
  enterCity: { en: 'Enter city', hi: 'शहर दर्ज करें', mr: 'शहर प्रविष्ट करा' },
  enterState: { en: 'Enter state', hi: 'राज्य दर्ज करें', mr: 'राज्य प्रविष्ट करा' },
  enterPincode: { en: 'Enter pincode', hi: 'पिनकोड दर्ज करें', mr: 'पिनकोड प्रविष्ट करा' },
  required: { en: 'Required', hi: 'आवश्यक', mr: 'आवश्यक' },
  optional: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
  
  // Notifications
  notifications: { en: 'Notifications', hi: 'सूचनाएं', mr: 'सूचना' },
  noNotifications: { en: 'No notifications', hi: 'कोई सूचना नहीं', mr: 'कोणत्याही सूचना नाहीत' },
  markAsRead: { en: 'Mark as Read', hi: 'पढ़ा हुआ चिह्नित करें', mr: 'वाचले म्हणून चिन्हांकित करा' },
  markAllAsRead: { en: 'Mark All as Read', hi: 'सभी को पढ़ा हुआ चिह्नित करें', mr: 'सर्व वाचले म्हणून चिन्हांकित करा' },
  
  // Items count
  items: { en: 'items', hi: 'आइटम', mr: 'आयटम' },
  item: { en: 'item', hi: 'आइटम', mr: 'आयटम' },
  
  // Product Detail
  addedToCart: { en: 'Added to cart!', hi: 'कार्ट में जोड़ा गया!', mr: 'कार्टमध्ये जोडले!' },
  productNotFound: { en: 'Product not found', hi: 'उत्पाद नहीं मिला', mr: 'उत्पादन सापडले नाही' },
  sellerNotFound: { en: 'Seller not found', hi: 'विक्रेता नहीं मिला', mr: 'विक्रेता सापडला नाही' },
  
  // Forum
  createPost: { en: 'Create Post', hi: 'पोस्ट बनाएं', mr: 'पोस्ट तयार करा' },
  writePost: { en: 'Write a post', hi: 'पोस्ट लिखें', mr: 'पोस्ट लिहा' },
  postTitle: { en: 'Post Title', hi: 'पोस्ट शीर्षक', mr: 'पोस्ट शीर्षक' },
  postContent: { en: 'Post Content', hi: 'पोस्ट सामग्री', mr: 'पोस्ट सामग्री' },
  comments: { en: 'Comments', hi: 'टिप्पणियां', mr: 'टिप्पण्या' },
  writeComment: { en: 'Write a comment', hi: 'टिप्पणी लिखें', mr: 'टिप्पणी लिहा' },
  like: { en: 'Like', hi: 'लाइक', mr: 'लाइक' },
  likes: { en: 'Likes', hi: 'लाइक्स', mr: 'लाइक्स' },
  
  // Receipt
  receipt: { en: 'Receipt', hi: 'रसीद', mr: 'पावती' },
  printReceipt: { en: 'Print Receipt', hi: 'रसीद प्रिंट करें', mr: 'पावती प्रिंट करा' },
  invoice: { en: 'Invoice', hi: 'चालान', mr: 'बीजक' },
  thankYou: { en: 'Thank you for your order!', hi: 'आपके ऑर्डर के लिए धन्यवाद!', mr: 'तुमच्या ऑर्डरसाठी धन्यवाद!' },
  
  // Empty States
  noDataFound: { en: 'No data found', hi: 'कोई डेटा नहीं मिला', mr: 'कोणताही डेटा सापडला नाही' },
  noResultsFound: { en: 'No results found', hi: 'कोई परिणाम नहीं मिला', mr: 'कोणतेही परिणाम सापडले नाहीत' },
  
  // Misc Actions
  refresh: { en: 'Refresh', hi: 'रिफ्रेश', mr: 'रिफ्रेश' },
  retry: { en: 'Retry', hi: 'पुनः प्रयास करें', mr: 'पुन्हा प्रयत्न करा' },
  goBack: { en: 'Go Back', hi: 'वापस जाएं', mr: 'मागे जा' },
  goHome: { en: 'Go Home', hi: 'होम पर जाएं', mr: 'मुख्यपृष्ठावर जा' },
  returnToHome: { en: 'Return to Home', hi: 'होम पर लौटें', mr: 'मुख्यपृष्ठावर परत जा' },
  pageNotFound: { en: 'Page Not Found', hi: 'पृष्ठ नहीं मिला', mr: 'पृष्ठ सापडले नाही' },
  pageNotFoundDesc: { en: "Oops! The page you're looking for seems to have wandered off the farm. Let's get you back on track.", hi: 'उफ़! आप जिस पृष्ठ की तलाश कर रहे हैं वह खेत से भटक गया लगता है। आइए आपको वापस रास्ते पर लाते हैं।', mr: 'अरेरे! तुम्ही शोधत असलेले पृष्ठ शेतातून भटकले असे दिसते. चला तुम्हाला परत मार्गावर आणूया.' },
  
  // Sorting options
  sortFeatured: { en: 'Featured', hi: 'विशेष', mr: 'वैशिष्ट्यीकृत' },
  sortPriceLowHigh: { en: 'Price: Low to High', hi: 'कीमत: कम से ज्यादा', mr: 'किंमत: कमी ते जास्त' },
  sortPriceHighLow: { en: 'Price: High to Low', hi: 'कीमत: ज्यादा से कम', mr: 'किंमत: जास्त ते कमी' },
  sortRating: { en: 'Rating', hi: 'रेटिंग', mr: 'रेटिंग' },
  sortNewest: { en: 'Newest', hi: 'नवीनतम', mr: 'नवीनतम' },
  
  // Delivery
  deliveryCharge: { en: 'Delivery Charge', hi: 'डिलीवरी शुल्क', mr: 'वितरण शुल्क' },
  estimatedDelivery: { en: 'Estimated Delivery', hi: 'अनुमानित डिलीवरी', mr: 'अंदाजित वितरण' },
  
  // Actions on products
  organicProduct: { en: 'Organic Product', hi: 'जैविक उत्पाद', mr: 'सेंद्रिय उत्पादन' },
  verifiedSeller: { en: 'Verified Seller', hi: 'सत्यापित विक्रेता', mr: 'सत्यापित विक्रेता' },
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

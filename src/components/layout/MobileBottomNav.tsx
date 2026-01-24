import React, { memo, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Heart, LayoutDashboard, Package, Sprout, MessageSquare, Store } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import khetifyLogo from '@/assets/khetify-logo.png';

const MobileBottomNav: React.FC = memo(() => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, role } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Define nav items based on role
  const getNavItems = () => {
    if (!user) {
      return [
        { path: '/', label: 'Home', icon: Home },
        { path: '/products', label: 'Shop', icon: Search },
        { path: '/cart', label: 'Cart', icon: ShoppingCart, badge: totalItems },
        { path: '/login', label: 'Login', icon: User },
      ];
    }

    if (role === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/sellers', label: 'Sellers', icon: Store },
        { path: '/products', label: 'Products', icon: Package },
        { path: '/profile', label: 'Profile', icon: User },
      ];
    }

    if (role === 'seller') {
      return [
        { path: '/seller-home', label: 'Home', icon: Home },
        { path: '/seller', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/sellers', label: 'Sellers', icon: Store },
        { path: '/forum', label: 'Forum', icon: MessageSquare },
        { path: '/profile', label: 'Profile', icon: User },
      ];
    }

    // Customer role
    return [
      { path: '/', label: 'Home', icon: Home },
      { path: '/products', label: 'Shop', icon: Search },
      { path: '/sellers', label: 'Sellers', icon: Store },
      { path: '/cart', label: 'Cart', icon: ShoppingCart, badge: totalItems },
      { path: '/profile', label: 'Profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border md:hidden safe-area-bottom">
      {/* Small logo accent */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center">
        <img src={khetifyLogo} alt="KhetiFy" className="w-7 h-7 object-contain" />
      </div>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200 ${
                active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? 'text-primary' : ''}`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';

export default MobileBottomNav;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, Search, User, Globe, Heart, LayoutDashboard, Package, LogOut, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage, languageNames, Language } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import AppSidebar from './AppSidebar';
import NotificationBell from '@/components/notifications/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();
  const { user, role, signOut, profile } = useAuth();
  const location = useLocation();

  // Base nav links for everyone
  const baseNavLinks = [
    { path: '/', label: t('home') },
    { path: '/products', label: t('products') },
    { path: '/forum', label: '💬 Forum' },
  ];

  // Role-specific nav links
  const getNavLinks = () => {
    const links = [...baseNavLinks];
    
    if (!user) {
      return links;
    }

    if (role === 'admin') {
      links.push(
        { path: '/admin', label: '👑 Admin Dashboard' },
        { path: '/orders', label: t('orders') },
      );
    } else if (role === 'seller') {
      links.push(
        { path: '/seller', label: '🌾 Seller Dashboard' },
        { path: '/farmer-corner', label: '🌱 Farmer Corner' },
        { path: '/orders', label: t('orders') },
      );
    } else {
      links.push(
        { path: '/orders', label: t('orders') },
        { path: '/wishlist', label: '❤️ Wishlist' },
      );
    }

    return links;
  };

  const navLinks = getNavLinks();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left Side - Sidebar Toggle + Logo */}
          <div className="flex items-center gap-2">
            {/* Sidebar Toggle - Mobile */}
            <AppSidebar>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </AppSidebar>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300">
                <span className="text-xl">🌾</span>
              </div>
              <span className="text-xl md:text-2xl font-bold font-heading text-primary">
                AgriSaathi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('search')}
                className="pl-10 h-11 bg-muted/50"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Language Selector - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px]">
                {(Object.keys(languageNames) as Language[]).map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={language === lang ? 'bg-primary/10 text-primary' : ''}
                  >
                    {languageNames[lang]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <NotificationBell />

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu - Desktop */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="soft" size="sm" className="hidden sm:flex gap-2">
                    <User className="w-4 h-4" />
                    {profile?.full_name?.split(' ')[0] || 'Account'}
                    {role && (
                      <Badge variant={role === 'admin' ? 'destructive' : role === 'seller' ? 'default' : 'secondary'} className="text-xs ml-1">
                        {role}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {role === 'seller' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/seller" className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Seller Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/farmer-corner" className="flex items-center gap-2">
                          <Sprout className="w-4 h-4" />
                          Farmer Corner
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {role === 'customer' && (
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="soft" size="sm" className="hidden sm:flex gap-2">
                  <User className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-3 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('search')}
                className="pl-10"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
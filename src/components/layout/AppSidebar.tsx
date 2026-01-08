import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, MessageSquare, ClipboardList, Heart, LayoutDashboard, Sprout, User, LogOut, Globe, X } from 'lucide-react';
import khetifyLogo from '@/assets/khetify-logo-new.png';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage, languageNames, Language } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from 'lucide-react';

interface AppSidebarProps {
  children: React.ReactNode;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, role, signOut, profile } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { path: '/', label: t('home'), icon: Home },
      { path: '/products', label: t('products'), icon: ShoppingBag },
      { path: '/forum', label: 'Forum', icon: MessageSquare },
    ];

    if (!user) return baseItems;

    if (role === 'admin') {
      return [
        ...baseItems,
        { path: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
        { path: '/orders', label: t('orders'), icon: ClipboardList },
      ];
    }

    if (role === 'seller') {
      return [
        ...baseItems,
        { path: '/seller', label: 'Seller Dashboard', icon: LayoutDashboard },
        { path: '/farmer-corner', label: 'Farmer Corner', icon: Sprout },
        { path: '/orders', label: t('orders'), icon: ClipboardList },
      ];
    }

    // Customer
    return [
      ...baseItems,
      { path: '/orders', label: t('orders'), icon: ClipboardList },
      { path: '/wishlist', label: 'Wishlist', icon: Heart },
    ];
  };

  const navItems = getNavItems();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <img 
                src={khetifyLogo} 
                alt="KHETIFY Logo" 
                className="w-10 h-10 object-contain"
              />
              <div className="flex flex-col leading-none">
                <SheetTitle className="text-lg font-bold font-heading text-primary tracking-tight">
                  KHETIFY
                </SheetTitle>
                <span className="text-sm font-semibold text-secondary">.shop</span>
              </div>
            </div>
          </SheetHeader>

          {/* User Info */}
          {user && (
            <div className="p-4 bg-muted/30 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{profile?.full_name || 'User'}</p>
                  <Badge 
                    variant={role === 'admin' ? 'destructive' : role === 'seller' ? 'default' : 'secondary'} 
                    className="text-xs mt-1"
                  >
                    {role}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <Separator className="my-4" />

            {/* Language Selector */}
            <div className="px-4 py-2">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language
              </p>
              <div className="flex gap-2">
                {(Object.keys(languageNames) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      language === lang
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {languageNames[lang]}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border space-y-2">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <User className="w-4 h-4" />
                    My Profile
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start gap-2"
                  onClick={() => { signOut(); setOpen(false); }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button className="w-full justify-start gap-2">
                  <User className="w-4 h-4" />
                  Login / Sign Up
                </Button>
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AppSidebar;
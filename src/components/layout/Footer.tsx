import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react';
import khetifyLogo from '@/assets/khetify-logo-cart.png';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img 
                src={khetifyLogo} 
                alt="KHETIFY Logo" 
                className="w-12 h-12 object-contain bg-white/90 rounded-xl p-1"
              />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-extrabold font-heading tracking-wide text-primary-foreground uppercase">
                  Khetify
                </span>
                <span className="text-[10px] font-medium tracking-[0.2em] text-primary-foreground/70 uppercase">
                  Farm To Home
                </span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              Your trusted partner for quality agricultural products. 
              Empowering farmers with the best seeds, fertilizers, and tools.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/khetify_shop?igsh=NTZ3eXdvenFzZm13" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-heading">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  {t('categories')}
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  {t('orders')}
                </Link>
              </li>
              <li>
                <Link to="/sellers" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  Our Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-heading">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/forum" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  Community Forum
                </Link>
              </li>
              <li>
                <Link to="/farmer-corner" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  Farmer Corner
                </Link>
              </li>
              <li>
                <a href="mailto:khetify.shop@gmail.com" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  khetify.shop@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+917741015729" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  +91 77410 15729
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-heading">{t('contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary" />
                <a href="tel:+917741015729" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  +91 77410 15729
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary" />
                <a href="mailto:khetify.shop@gmail.com" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  khetify.shop@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/60 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Khetify - Farm To Home. All rights reserved. Made with ❤️ for Indian Farmers.
            </p>
            <div className="flex items-center gap-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/124px-PayPal.svg.png" alt="PayPal" className="h-6 opacity-70" />
              <span className="text-primary-foreground/60 text-sm">UPI • Cards • Net Banking</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

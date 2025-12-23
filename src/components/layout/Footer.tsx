import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-xl">🌾</span>
              </div>
              <span className="text-2xl font-bold font-heading">Khetify</span>
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
              <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
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
                <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  {t('aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-heading">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  {t('helpCenter')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  {t('privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-heading">{t('contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-secondary" />
                <span className="text-primary-foreground/80 text-sm">
                  123 Krishi Bhawan, Agricultural Hub,<br />
                  Pune, Maharashtra 411001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary" />
                <a href="tel:+911234567890" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  +91 123 456 7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary" />
                <a href="mailto:support@khetify.com" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  support@khetify.com
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
              © 2024 Khetify. All rights reserved. Made with ❤️ for Indian Farmers.
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

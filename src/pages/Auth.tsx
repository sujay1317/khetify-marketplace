import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import khetifyLogo from '@/assets/khetify-logo-new.png';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AppRole = 'admin' | 'seller' | 'customer';

const Auth: React.FC = () => {
  const { t } = useLanguage();
  const { user, role, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('customer');

  useEffect(() => {
    if (user && role) {
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Login successful!');
        }
      } else {
        const { error } = await signUp(email, password, fullName, phone, selectedRole);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created successfully!');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <Header />
      <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md p-8 animate-scale-in">
          <div className="text-center mb-8">
            <img 
              src={khetifyLogo} 
              alt="KHETIFY Logo" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold font-heading flex items-center justify-center gap-0">
              <span className="text-primary">KHETIFY</span>
              <span className="text-secondary">.shop</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {isLogin ? 'Sign in to continue shopping' : 'Join KHETIFY.shop today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder={t('fullName')} 
                    className="pl-10" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    type="tel" 
                    placeholder={t('phone')} 
                    className="pl-10" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">I am a:</label>
                  <Select value={selectedRole} onValueChange={(value: AppRole) => setSelectedRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">👤 Customer - Buy products</SelectItem>
                      <SelectItem value="seller">🌾 Seller - Sell my products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                type="email" 
                placeholder={t('email')} 
                className="pl-10" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button type="submit" variant="default" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Please wait...' : isLogin ? t('login') : t('signup')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? t('signup') : t('login')}
            </button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Auth;

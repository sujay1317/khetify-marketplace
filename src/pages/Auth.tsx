import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type AppRole = 'admin' | 'seller' | 'customer';
type AuthMode = 'customer' | 'seller';

const Auth: React.FC = () => {
  const { t } = useLanguage();
  const { user, role, signIn, signUp, signInWithEmailOtp, verifyEmailOtp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('customer');
  
  // Email/Password fields (for seller/admin)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('seller');

  // OTP fields (for customer)
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

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

  // Handle email/password auth for sellers
  const handleEmailAuth = async (e: React.FormEvent) => {
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

  // Handle OTP request for customers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerEmail || !customerEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!isLogin && !customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithEmailOtp(customerEmail);
      if (error) {
        toast.error(error.message);
      } else {
        setOtpSent(true);
        toast.success('OTP sent to your email!');
      }
    } catch (err) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await verifyEmailOtp(
        customerEmail, 
        otp, 
        !isLogin ? customerName : undefined,
        !isLogin ? customerPhone : undefined
      );
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Login successful!');
      }
    } catch (err) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetOtpState = () => {
    setOtpSent(false);
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <Header />
      <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md p-8 animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-3xl">🌾</span>
            </div>
            <h1 className="text-2xl font-bold font-heading">
              {isLogin ? t('welcomeBack') : t('createAccount')}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isLogin ? 'Sign in to continue shopping' : 'Join Khetify today'}
            </p>
          </div>

          <Tabs value={authMode} onValueChange={(v) => { setAuthMode(v as AuthMode); resetOtpState(); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Customer
              </TabsTrigger>
              <TabsTrigger value="seller" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Seller/Admin
              </TabsTrigger>
            </TabsList>

            {/* Customer Email OTP Authentication */}
            <TabsContent value="customer">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input 
                          placeholder="Full Name" 
                          className="pl-10" 
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input 
                          type="tel"
                          placeholder="Phone Number (optional)" 
                          className="pl-10" 
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="Email Address"
                      className="pl-10"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required 
                    />
                  </div>

                  <Button type="submit" variant="default" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    We'll send a 6-digit OTP to your email - No password needed!
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter the 6-digit OTP sent to <br />
                      <span className="font-medium text-foreground">{customerEmail}</span>
                    </p>
                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button type="submit" variant="default" size="lg" className="w-full" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>

                  <div className="flex justify-between text-sm">
                    <button
                      type="button"
                      onClick={resetOtpState}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-primary hover:underline"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </TabsContent>

            {/* Seller/Admin Email Authentication */}
            <TabsContent value="seller">
              <form onSubmit={handleEmailAuth} className="space-y-4">
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
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => { setIsLogin(!isLogin); resetOtpState(); }}
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
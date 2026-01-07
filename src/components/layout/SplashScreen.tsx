import React, { useEffect, useState } from 'react';
import khetifyLogo from '@/assets/khetify-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  minDisplayTime = 1500 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 500);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [onComplete, minDisplayTime]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Logo container */}
      <div className={`relative flex flex-col items-center gap-6 transition-all duration-700 ${
        isExiting ? 'translate-y-[-20px] opacity-0' : 'translate-y-0 opacity-100'
      }`}>
        {/* Logo with animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse scale-150" />
          <img
            src={khetifyLogo}
            alt="KhetiFy Logo"
            className="relative w-28 h-28 md:w-36 md:h-36 object-contain animate-[bounce_1s_ease-in-out_infinite]"
            style={{ animationDuration: '2s' }}
          />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-primary tracking-tight">
            KhetiFy
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            From Sellers to Farmers, Delivered with Care
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center gap-1.5 mt-4">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Tagline at bottom */}
      <p className={`absolute bottom-8 text-xs text-muted-foreground transition-all duration-500 ${
        isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}>
        Connecting sellers with farmers across India
      </p>
    </div>
  );
};

export default SplashScreen;

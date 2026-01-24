import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="text-8xl mb-6">🌾</div>
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-2 text-2xl font-semibold text-foreground">{t('pageNotFound')}</p>
        <p className="mb-8 text-muted-foreground max-w-md mx-auto">
          {t('pageNotFoundDesc')}
        </p>
        <Link to="/">
          <Button variant="hero" size="lg" className="gap-2">
            <Home className="w-5 h-5" />
            {t('returnToHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

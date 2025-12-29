import { Link, useNavigate } from 'react-router-dom';
import { Globe, User, LogOut, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const AppHeader = () => {
  const { user, profile, signOut } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="h-14 bg-header text-header-foreground flex items-center justify-between px-4 shadow-md">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
          <Globe className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold">{t('brand')}</span>
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          className="text-header-foreground hover:bg-header-foreground/10"
        >
          {lang === 'zh' ? 'EN' : '中文'}
        </Button>

        {user && profile ? (
          <>
            {/* Balance */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-header-foreground/10">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">{t('balance')}: ${profile.balance.toFixed(2)}</span>
            </div>

            {/* Recharge Button */}
            <Button
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => navigate('/recharge')}
            >
              {t('recharge')}
            </Button>

            {/* User Menu */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-header-foreground/10">
              <User className="h-4 w-4" />
              <span className="text-sm">{profile.username}</span>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-header-foreground hover:bg-header-foreground/10"
            >
              <LogOut className="h-4 w-4 mr-1" />
              {t('logout')}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-header-foreground hover:bg-header-foreground/10"
            >
              {t('login')}
            </Button>
            <Button
              size="sm"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={() => navigate('/register')}
            >
              {t('register')}
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;

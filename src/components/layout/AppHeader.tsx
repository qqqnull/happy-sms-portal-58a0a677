import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const AppHeader = () => {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="h-14 bg-primary text-primary-foreground flex items-center justify-between px-4 sm:px-6 shadow-lg">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 flex items-center justify-center">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <span className="text-base sm:text-lg font-bold">{t('brand')}</span>
          <p className="text-[10px] sm:text-xs opacity-70 hidden sm:block">{t('brandDesc')}</p>
        </div>
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {user && profile ? (
          <>
            {/* Balance */}
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/10">
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">${profile.balance.toFixed(2)}</span>
            </div>

            {/* Recharge Button */}
            <Button
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-xs sm:text-sm px-2 sm:px-4"
              onClick={() => navigate('/recharge')}
            >
              {t('recharge')}
            </Button>

            {/* User Info - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
              <User className="h-4 w-4" />
              <span className="text-sm">{profile.username}</span>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-white/10 px-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="hover:bg-white/10 border border-white/20 text-xs sm:text-sm px-2 sm:px-3"
            >
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('login')}</span>
            </Button>
            <Button
              size="sm"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => navigate('/register')}
            >
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('register')}</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;

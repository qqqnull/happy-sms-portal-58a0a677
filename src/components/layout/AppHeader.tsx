import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut, Wallet } from 'lucide-react';
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
    <header className="h-14 bg-primary text-primary-foreground flex items-center justify-between px-6 shadow-lg">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold">GlobalSMS</span>
          <p className="text-xs opacity-70">全球验证码接收平台</p>
        </div>
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {user && profile ? (
          <>
            {/* Balance */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 mr-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">${profile.balance.toFixed(2)}</span>
            </div>

            {/* Recharge Button */}
            <Button
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              onClick={() => navigate('/recharge')}
            >
              充值
            </Button>

            {/* User Info */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 ml-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{profile.username}</span>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-white/10"
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
              className="hover:bg-white/10 border border-white/20"
            >
              <User className="h-4 w-4 mr-2" />
              登录
            </Button>
            <Button
              size="sm"
              className="bg-white/10 hover:bg-white/20 border border-white/20"
              onClick={() => navigate('/register')}
            >
              <User className="h-4 w-4 mr-2" />
              注册
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;

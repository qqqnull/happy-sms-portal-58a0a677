import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

const generateCaptcha = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptcha('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: '错误',
        description: '请填写用户名和密码',
        variant: 'destructive',
      });
      return;
    }

    if (captcha.toUpperCase() !== captchaCode) {
      toast({
        title: '错误',
        description: '验证码错误',
        variant: 'destructive',
      });
      refreshCaptcha();
      return;
    }

    setLoading(true);
    const { error } = await signIn(username, password);
    setLoading(false);

    if (error) {
      toast({
        title: '登录失败',
        description: error.message === 'Invalid login credentials' 
          ? '用户名或密码错误' 
          : error.message,
        variant: 'destructive',
      });
      refreshCaptcha();
    } else {
      toast({
        title: '登录成功',
        description: '欢迎回来！',
      });
      navigate('/');
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{t('welcomeBack')}</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Captcha */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t('captcha')}
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  className="flex-1"
                  maxLength={4}
                />
                <div
                  className="flex items-center justify-center px-4 py-2 bg-muted rounded-md cursor-pointer select-none font-mono text-lg tracking-wider"
                  onClick={refreshCaptcha}
                >
                  {captchaCode}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={refreshCaptcha}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    {t('rememberMe')}
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-secondary hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90"
                disabled={loading}
              >
                {loading ? '登录中...' : t('login')}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t('noAccount')}{' '}
              <Link to="/register" className="text-secondary hover:underline font-medium">
                {t('register')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;

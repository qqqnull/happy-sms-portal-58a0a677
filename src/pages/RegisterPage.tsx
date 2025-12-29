import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

const generateCaptcha = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
  const [loading, setLoading] = useState(false);
  
  const { signUp, user } = useAuth();
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

  const validateUsername = (value: string) => {
    const regex = /^[a-zA-Z0-9_]{4,20}$/;
    return regex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      toast({
        title: '错误',
        description: '请填写所有字段',
        variant: 'destructive',
      });
      return;
    }

    if (!validateUsername(username)) {
      toast({
        title: '错误',
        description: t('usernameHint'),
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: '错误',
        description: t('passwordHint'),
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: '错误',
        description: '两次输入的密码不一致',
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
    const { error } = await signUp(username, password);
    setLoading(false);

    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('already registered')) {
        errorMessage = '该用户名已被注册';
      }
      toast({
        title: '注册失败',
        description: errorMessage,
        variant: 'destructive',
      });
      refreshCaptcha();
    } else {
      toast({
        title: '注册成功',
        description: '欢迎加入！',
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
              <h1 className="text-2xl font-bold text-foreground">{t('createAccount')}</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
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
                <p className="text-xs text-muted-foreground mt-1">{t('usernameHint')}</p>
              </div>

              {/* Password */}
              <div>
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
                <p className="text-xs text-muted-foreground mt-1">{t('passwordHint')}</p>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={t('confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90"
                disabled={loading}
              >
                {loading ? '注册中...' : t('register')}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t('hasAccount')}{' '}
              <Link to="/login" className="text-secondary hover:underline font-medium">
                {t('login')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;

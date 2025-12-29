import { Globe, CheckCircle, Zap, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/layout/MainLayout';

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = [
    { icon: Globe, label: t('globalCoverage'), color: 'text-secondary' },
    { icon: CheckCircle, label: t('successRate'), color: 'text-success' },
    { icon: Zap, label: t('instantRecharge'), color: 'text-accent' },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        {/* Service Center Header */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{t('serviceCenter')}</h1>
              <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow"></span>
                {t('systemNormal')}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-6 mt-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchCountry')}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['allRegions', 'asia', 'europe', 'americas', 'africa', 'oceania'].map((region) => (
                <Button
                  key={region}
                  variant={region === 'allRegions' ? 'default' : 'outline'}
                  size="sm"
                >
                  {t(region as any)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Countries Grid Placeholder */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {user ? '选择国家获取验证码' : '请先登录'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {user ? '支持150+国家，200+应用程序' : '登录后即可获取全球短信验证码'}
            </p>
            {!user && (
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/login')}>{t('login')}</Button>
                <Button variant="outline" onClick={() => navigate('/register')}>{t('register')}</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;

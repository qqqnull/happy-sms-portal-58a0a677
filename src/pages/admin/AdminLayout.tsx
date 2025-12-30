import { ReactNode, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Smartphone, 
  Users, 
  CreditCard, 
  ShoppingCart,
  Settings,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAdmin, loading } = useAdminCheck();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: '仪表盘', path: '/admin' },
    { icon: Globe, label: '国家管理', path: '/admin/countries' },
    { icon: Smartphone, label: '服务管理', path: '/admin/services' },
    { icon: Settings, label: '国家服务', path: '/admin/country-services' },
    { icon: Users, label: '用户管理', path: '/admin/users' },
    { icon: ShoppingCart, label: '订单管理', path: '/admin/orders' },
    { icon: CreditCard, label: '交易管理', path: '/admin/transactions' },
    { icon: Upload, label: '数据导入', path: '/admin/import' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-secondary" />
            <span className="font-bold text-lg">管理后台</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回前台
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

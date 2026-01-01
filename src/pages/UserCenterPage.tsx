import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Wallet, Shield, Clock, ChevronRight, 
  Phone, CheckCircle, ListChecks, Calendar, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/layout/MainLayout';

interface Stats {
  totalOrders: number;
  successOrders: number;
  balance: number;
}

interface RecentOrder {
  id: string;
  phone_number: string;
  status: string;
  created_at: string;
  country: { name: string; flag: string } | null;
  service: { name: string } | null;
}

const UserCenterPage = () => {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, successOrders: 0, balance: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch orders statistics
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, status')
          .eq('user_id', user.id);

        if (!ordersError && orders) {
          const total = orders.length;
          const success = orders.filter(o => o.status === 'completed').length;
          setStats({
            totalOrders: total,
            successOrders: success,
            balance: profile?.balance || 0,
          });
        }

        // Fetch recent orders
        const { data: recent, error: recentError } = await supabase
          .from('orders')
          .select(`
            id,
            phone_number,
            status,
            created_at,
            country:countries(name, flag),
            service:services(name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!recentError && recent) {
          setRecentOrders(recent as RecentOrder[]);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <MainLayout showSidebar={false}>
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showSidebar={false}>
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - User Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* User Card */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle className="text-lg">用户信息</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-bold">{profile?.username}</h3>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {profile?.id && new Date().toLocaleDateString('zh-CN')}
                </p>
                
                {/* Balance */}
                <div className="bg-muted/50 rounded-xl p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-sm text-muted-foreground">账户余额</span>
                      <div className="text-2xl font-bold text-primary">${profile?.balance.toFixed(2)}</div>
                    </div>
                    <Wallet className="h-10 w-10 text-primary/30" />
                  </div>
                </div>

                <Button 
                  className="w-full mt-4"
                  onClick={() => navigate('/recharge')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  立即充值
                </Button>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 px-2">用户导航</h4>
                <nav className="space-y-1">
                  <Link
                    to="/user-center"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground"
                  >
                    <ListChecks className="h-4 w-4" />
                    <span>控制面板</span>
                  </Link>
                  <Link
                    to="/history"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Clock className="h-4 w-4" />
                    <span>历史记录</span>
                  </Link>
                  <Link
                    to="/account-security"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span>账户安全</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Statistics */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  <CardTitle className="text-lg">接码统计</CardTitle>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => navigate('/')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  获取号码
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-xl p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <ListChecks className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{stats.totalOrders}</div>
                      <div className="text-sm text-muted-foreground">总接码次数</div>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{stats.balance.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">账户余额 (美元)</div>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-7 w-7 text-success" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{stats.successOrders}</div>
                      <div className="text-sm text-muted-foreground">成功接收</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <CardTitle className="text-lg">订单记录</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {recentOrders.length === 0 ? (
                  <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-4 rounded-lg flex items-center gap-3">
                    <ListChecks className="h-6 w-6" />
                    <div>
                      您还没有任何订单记录，去
                      <Link to="/" className="font-medium underline hover:no-underline mx-1">首页</Link>
                      获取号码吧！
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{order.country?.flag}</span>
                          <div>
                            <div className="font-medium">{order.country?.name} - {order.service?.name}</div>
                            <div className="text-sm text-muted-foreground">{order.phone_number}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            order.status === 'completed' ? 'text-success' :
                            order.status === 'pending' ? 'text-warning' : 'text-destructive'
                          }`}>
                            {order.status === 'completed' ? '已完成' :
                             order.status === 'pending' ? '等待中' : '已取消'}
                          </div>
                          <div className="text-xs text-muted-foreground">{formatDate(order.created_at)}</div>
                        </div>
                      </div>
                    ))}
                    
                    <Link 
                      to="/orders"
                      className="flex items-center justify-center gap-2 p-3 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      查看全部订单
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserCenterPage;

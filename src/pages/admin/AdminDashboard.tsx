import { useState, useEffect } from 'react';
import { Users, ShoppingCart, CreditCard, Globe, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from './AdminLayout';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeCountries: number;
  pendingTransactions: number;
  todayOrders: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeCountries: 0,
    pendingTransactions: 0,
    todayOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      usersRes,
      ordersRes,
      countriesRes,
      transactionsRes,
      todayOrdersRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('price'),
      supabase.from('countries').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
    ]);

    const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + Number(order.price), 0) || 0;

    setStats({
      totalUsers: usersRes.count || 0,
      totalOrders: ordersRes.data?.length || 0,
      totalRevenue,
      activeCountries: countriesRes.count || 0,
      pendingTransactions: transactionsRes.count || 0,
      todayOrders: todayOrdersRes.count || 0,
    });
    
    setLoading(false);
  };

  const statCards = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: '总订单数',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: '总收入',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: '活跃国家',
      value: stats.activeCountries,
      icon: Globe,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: '待处理交易',
      value: stats.pendingTransactions,
      icon: CreditCard,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: '今日订单',
      value: stats.todayOrders,
      icon: TrendingUp,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">仪表盘</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

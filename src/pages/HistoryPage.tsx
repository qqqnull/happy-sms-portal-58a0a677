import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Clock, List, Phone, Wallet, DollarSign, Shield,
  User, ListChecks, Calendar, Search, RotateCcw, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/layout/MainLayout';

type RecordType = 'all' | 'orders' | 'recharge' | 'expense';

interface HistoryRecord {
  id: string;
  type: RecordType;
  description: string;
  amount?: number;
  status: string;
  created_at: string;
  order_id?: string;
}

const HistoryPage = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<RecordType>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchRecords();
  }, [user, navigate, activeType, startDate, endDate]);

  const fetchRecords = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const allRecords: HistoryRecord[] = [];

      // Fetch orders (接码记录)
      if (activeType === 'all' || activeType === 'orders') {
        let ordersQuery = supabase
          .from('orders')
          .select(`
            id, phone_number, status, created_at, price,
            country:countries(name),
            service:services(name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (startDate) {
          ordersQuery = ordersQuery.gte('created_at', startDate);
        }
        if (endDate) {
          ordersQuery = ordersQuery.lte('created_at', `${endDate}T23:59:59`);
        }

        const { data: orders } = await ordersQuery;

        if (orders) {
          orders.forEach((order: any) => {
            allRecords.push({
              id: order.id,
              type: 'orders',
              description: `${order.country?.name || '未知'} - ${order.service?.name || '未知'} (${order.phone_number})`,
              amount: -order.price,
              status: order.status,
              created_at: order.created_at,
            });
          });
        }
      }

      // Fetch transactions (充值和消费记录)
      if (activeType === 'all' || activeType === 'recharge' || activeType === 'expense') {
        let transQuery = supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (activeType === 'recharge') {
          transQuery = transQuery.eq('type', 'deposit');
        }

        if (startDate) {
          transQuery = transQuery.gte('created_at', startDate);
        }
        if (endDate) {
          transQuery = transQuery.lte('created_at', `${endDate}T23:59:59`);
        }

        const { data: transactions } = await transQuery;

        if (transactions) {
          transactions.forEach((trans: any) => {
            if (activeType === 'all' || 
                (activeType === 'recharge' && trans.type === 'deposit')) {
              allRecords.push({
                id: trans.id,
                type: trans.type === 'deposit' ? 'recharge' : 'expense',
                description: trans.type === 'deposit' 
                  ? `USDT充值 (${trans.payment_method || 'TRC20'})` 
                  : '消费',
                amount: trans.type === 'deposit' ? trans.amount : -trans.amount,
                status: trans.status,
                created_at: trans.created_at,
                order_id: trans.order_id,
              });
            }
          });
        }
      }

      // Sort by date
      allRecords.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRecords(allRecords);
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReset = () => {
    setActiveType('all');
    setStartDate('');
    setEndDate('');
  };

  const getTypeIcon = (type: RecordType) => {
    switch (type) {
      case 'orders': return <Phone className="h-4 w-4" />;
      case 'recharge': return <Wallet className="h-4 w-4" />;
      case 'expense': return <DollarSign className="h-4 w-4" />;
      default: return <List className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: RecordType) => {
    switch (type) {
      case 'orders': return '接码记录';
      case 'recharge': return '充值记录';
      case 'expense': return '消费记录';
      default: return '全部记录';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'cancelled': 
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'pending': return '处理中';
      case 'cancelled': return '已取消';
      case 'failed': return '失败';
      default: return status;
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 px-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  历史分类
                </h4>
                <nav className="space-y-1">
                  {(['all', 'orders', 'recharge', 'expense'] as RecordType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveType(type)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                        activeType === type 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      {type === 'all' && <List className="h-4 w-4" />}
                      {type === 'orders' && <Phone className="h-4 w-4" />}
                      {type === 'recharge' && <Wallet className="h-4 w-4" />}
                      {type === 'expense' && <DollarSign className="h-4 w-4" />}
                      <span>{getTypeLabel(type)}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 px-2">用户导航</h4>
                <nav className="space-y-1">
                  <Link
                    to="/user-center"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ListChecks className="h-4 w-4" />
                    <span>控制面板</span>
                  </Link>
                  <Link
                    to="/history"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground"
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
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">历史记录</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filter */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">类型筛选</label>
                    <Select value={activeType} onValueChange={(v) => setActiveType(v as RecordType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="全部类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部类型</SelectItem>
                        <SelectItem value="orders">接码记录</SelectItem>
                        <SelectItem value="recharge">充值记录</SelectItem>
                        <SelectItem value="expense">消费记录</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">开始日期</label>
                    <Input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">结束日期</label>
                    <Input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button variant="outline" onClick={handleReset} className="flex-1">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      重置
                    </Button>
                    <Button onClick={fetchRecords} className="flex-1">
                      <Filter className="h-4 w-4 mr-2" />
                      筛选
                    </Button>
                  </div>
                </div>

                {/* Records List */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : records.length === 0 ? (
                  <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-4 rounded-lg flex items-center gap-3">
                    <Clock className="h-6 w-6" />
                    <span>暂无历史记录</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {records.map((record) => (
                      <div 
                        key={record.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border-l-4 border-primary"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {getTypeIcon(record.type)}
                          </div>
                          <div>
                            <div className="font-medium">{record.description}</div>
                            {record.order_id && (
                              <div className="text-xs text-muted-foreground font-mono">
                                订单号: {record.order_id}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(record.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {record.amount !== undefined && (
                            <div className={`font-bold ${record.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {record.amount >= 0 ? '+' : ''}{record.amount.toFixed(2)}
                            </div>
                          )}
                          <div className={`text-sm ${getStatusColor(record.status)}`}>
                            {getStatusLabel(record.status)}
                          </div>
                        </div>
                      </div>
                    ))}
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

export default HistoryPage;

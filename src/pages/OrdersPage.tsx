import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, RefreshCw, Copy, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';

interface Order {
  id: string;
  phone_number: string;
  verification_code: string | null;
  price: number;
  status: string;
  created_at: string;
  expires_at: string | null;
  completed_at: string | null;
  country: {
    name: string;
    name_en: string;
    flag: string;
    code: string;
  };
  service: {
    name: string;
    icon: string;
  };
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        country:countries(*),
        service:services(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error('加载订单失败');
    } else if (data) {
      setOrders(data.map(order => ({
        ...order,
        price: Number(order.price),
        country: order.country,
        service: order.service,
      })));
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'active':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
      case 'refunded':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'active':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'expired':
      case 'refunded':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t('pending'),
      active: t('active'),
      completed: t('completed'),
      expired: t('expired'),
      refunded: t('refunded'),
    };
    return statusMap[status] || status;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">{t('orderHistory')}</h1>
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
              <p className="text-muted-foreground mt-4">加载中...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">暂无订单记录</p>
              <Button 
                className="mt-4 bg-secondary hover:bg-secondary/90"
                onClick={() => navigate('/')}
              >
                去获取号码
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>国家/服务</TableHead>
                    <TableHead>手机号码</TableHead>
                    <TableHead>验证码</TableHead>
                    <TableHead>价格</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{order.country?.flag}</span>
                          <div>
                            <div className="font-medium">
                              {lang === 'zh' ? order.country?.name : order.country?.name_en}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.service?.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{order.phone_number}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(order.phone_number)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.verification_code ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-lg font-bold text-success">
                              {order.verification_code}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(order.verification_code!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {order.status === 'active' ? t('waitingCode') : '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-accent">${order.price.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status || 'pending')}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status || 'pending')}
                            {getStatusLabel(order.status || 'pending')}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(order.created_at)}</div>
                          {order.completed_at && (
                            <div className="text-muted-foreground text-xs">
                              完成: {formatDate(order.completed_at)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default OrdersPage;

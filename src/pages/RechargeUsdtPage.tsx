import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Clock, DollarSign, ArrowLeft, ExternalLink, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSupportLink } from '@/hooks/useSupportLink';
import { usePaymentConfig } from '@/hooks/usePaymentConfig';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';

const PAYMENT_TIMEOUT = 15 * 60;

const generatePaymentOrderId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `UST${timestamp}${random}`;
};

const RechargeUsdtPage = () => {
  const [searchParams] = useSearchParams();
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
  const [paymentOrderId, setPaymentOrderId] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasCreatedOrder = useRef(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { supportLink } = useSupportLink();
  const { buildPaymentUrlFresh } = usePaymentConfig();
  const navigate = useNavigate();

  const amount = searchParams.get('amount') || '50';
  const orderIdFromUrl = searchParams.get('order_id') || '';
  const usdtAmount = parseFloat(amount);

  // Initialize order
  useEffect(() => {
    if (orderIdFromUrl) {
      setPaymentOrderId(orderIdFromUrl);
    }

    const initializeOrder = async () => {
      if (!user) return;

      if (orderIdFromUrl) {
        const { data: existing } = await supabase
          .from('transactions')
          .select('id')
          .eq('order_id', orderIdFromUrl)
          .maybeSingle();
        if (!existing) {
          await supabase.from('transactions').insert({
            user_id: user.id,
            amount: usdtAmount,
            type: 'deposit',
            status: 'pending',
            order_id: orderIdFromUrl,
          payment_method: 'USDT',
            currency: 'USDT',
          });
        }
        return;
      }

      if (hasCreatedOrder.current) return;
      hasCreatedOrder.current = true;
      const newId = generatePaymentOrderId();
      setPaymentOrderId(newId);
      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: usdtAmount,
        type: 'deposit',
        status: 'pending',
        order_id: newId,
        payment_method: 'USDT',
        currency: 'USDT',
      });
    };

    initializeOrder();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast({ title: '订单超时', description: '请重新发起充值', variant: 'destructive' });
          if (user) navigate('/recharge');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [user, usdtAmount, orderIdFromUrl, toast, navigate]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(paymentOrderId);
      setCopiedOrderId(true);
      toast({ title: '复制成功', description: '订单号已复制' });
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch {
      toast({ title: '复制失败', variant: 'destructive' });
    }
  };

  const handleConfirmAndPay = async () => {
    if (!paymentOrderId || usdtAmount <= 0) return;
    setIsRedirecting(true);
    try {
      const url = await buildPaymentUrlFresh(paymentOrderId, usdtAmount);
      window.location.href = url;
    } catch (error) {
      console.error('Payment config refresh failed:', error);
      setIsRedirecting(false);
      toast({ title: '支付配置读取失败', description: '请稍后重试或联系管理员', variant: 'destructive' });
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-lg">
          <div className="bg-primary rounded-t-xl p-6 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">订单确认</h1>
                <p className="text-sm opacity-80">USDT 充值订单</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-primary-foreground/10 rounded-lg p-4">
                <div className="text-xs opacity-70">充值金额</div>
                <div className="text-lg font-bold">{usdtAmount.toFixed(2)} USDT</div>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg p-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <div>
                  <div className="text-xs opacity-70">剩余时间</div>
                  <div className={`text-lg font-bold ${timeLeft < 120 ? 'text-destructive' : ''}`}>{formatTime(timeLeft)}</div>
                </div>
              </div>
            </div>

            {paymentOrderId && (
              <div className="mt-4 bg-primary-foreground/10 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-70">订单编号</div>
                  <div className="text-sm font-mono font-bold break-all">{paymentOrderId}</div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={copyOrderId}>
                  {copiedOrderId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-b-xl p-6 space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">订单类型</span><span className="font-medium">账户充值</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">支付币种</span><span className="font-medium">USDT</span></div>
              <div className="flex justify-between border-t pt-3"><span className="text-muted-foreground">应付金额</span><span className="font-bold text-lg text-primary">{usdtAmount.toFixed(2)} USDT</span></div>
            </div>

            <Button className="w-full h-12 text-base font-medium" onClick={handleConfirmAndPay} disabled={isRedirecting || !paymentOrderId || usdtAmount <= 0}>
              <ExternalLink className="h-5 w-5 mr-2" />
              {isRedirecting ? '正在跳转支付页...' : `确认下单并支付 ${usdtAmount.toFixed(2)} USDT`}
            </Button>

            <p className="text-xs text-muted-foreground text-center">点击按钮将跳转至安全支付页完成 USDT 转账</p>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/recharge')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />返回
              </Button>
              <a href={supportLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-destructive hover:underline">
                <HelpCircle className="h-4 w-4" />支付遇到问题?
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RechargeUsdtPage;

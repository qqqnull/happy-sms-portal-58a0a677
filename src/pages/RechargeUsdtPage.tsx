import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Clock, Wallet, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

const WALLET_ADDRESS = 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW8';
const PAYMENT_TIMEOUT = 15 * 60; // 15 minutes in seconds

const walletApps = [
  { name: 'TronLink', icon: '🔗' },
  { name: 'imToken', icon: '💎' },
  { name: 'TokenPocket', icon: '🪙' },
  { name: 'Math Wallet', icon: '🔢' },
];

const RechargeUsdtPage = () => {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const amount = searchParams.get('amount') || '50';
  const orderId = searchParams.get('order_id') || '';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

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
  }, [user, navigate, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(WALLET_ADDRESS);
      setCopied(true);
      toast({
        title: '复制成功',
        description: '钱包地址已复制到剪贴板',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: '复制失败',
        description: '请手动复制地址',
        variant: 'destructive',
      });
    }
  };

  // Generate QR code URL using a public QR service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(WALLET_ADDRESS)}`;

  return (
    <MainLayout showSidebar={false}>
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary p-6 text-primary-foreground">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                    TRC20
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className={timeLeft < 120 ? 'text-destructive' : ''}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm opacity-80">{t('paymentAmount')}</div>
                <div className="text-4xl font-bold mt-1">{amount} USDT</div>
                <div className="text-xs opacity-60 mt-2">订单号: {orderId}</div>
              </div>
            </div>

            {/* QR Code */}
            <div className="p-6 flex flex-col items-center">
              <div className="text-sm text-muted-foreground mb-3">{t('scanQrCode')}</div>
              <div className="p-4 bg-card border-2 border-border rounded-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="Payment QR Code" 
                  className="w-48 h-48"
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div className="px-6 pb-4">
              <div className="text-sm text-muted-foreground mb-2">钱包地址</div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-xs break-all font-mono">
                  {WALLET_ADDRESS}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Wallet Apps */}
            <div className="px-6 pb-4">
              <div className="text-sm text-muted-foreground mb-3">{t('orUseWallet')}</div>
              <div className="grid grid-cols-2 gap-2">
                {walletApps.map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    className="h-12 justify-start gap-2"
                  >
                    <span className="text-lg">{wallet.icon}</span>
                    <span>{wallet.name}</span>
                    <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Copy Link Button */}
            <div className="px-6 pb-4">
              <Button
                variant="secondary"
                className="w-full"
                onClick={copyAddress}
              >
                <Copy className="h-4 w-4 mr-2" />
                {t('copyAddress')}
              </Button>
            </div>

            {/* Warning */}
            <div className="px-6 pb-6">
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex gap-3">
                  <Wallet className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div className="text-sm text-warning-foreground">
                    {t('paymentWarning')}
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="px-6 pb-6">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/recharge')}
              >
                返回
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RechargeUsdtPage;

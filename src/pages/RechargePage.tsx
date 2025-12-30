import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Zap, Shield, ArrowLeft, HelpCircle, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

// Chain configuration with icons
const chains = [
  { 
    id: 'trc20', 
    name: 'TRC20', 
    fullName: 'USDT-TRC20',
    network: 'Tether on TRON Network',
    available: true,
    recommended: true,
    icon: '🔵' // Tron blue circle
  },
  { 
    id: 'bsc', 
    name: 'BSC', 
    fullName: 'USDT-BEP20',
    network: 'Binance Smart Chain',
    available: false,
    recommended: false,
    icon: '🟡' // BSC yellow
  },
  { 
    id: 'eth', 
    name: 'ETH', 
    fullName: 'USDT-ERC20',
    network: 'Ethereum Network',
    available: false,
    recommended: false,
    icon: '🔷' // ETH blue diamond
  },
  { 
    id: 'arb', 
    name: 'ARB', 
    fullName: 'USDT-Arbitrum',
    network: 'Arbitrum One',
    available: false,
    recommended: false,
    icon: '🔵' // Arbitrum blue
  },
  { 
    id: 'base', 
    name: 'BASE', 
    fullName: 'USDT-Base',
    network: 'Base Network',
    available: false,
    recommended: false,
    icon: '🔵' // Base blue
  },
  { 
    id: 'sol', 
    name: 'SOL', 
    fullName: 'USDT-Solana',
    network: 'Solana Network',
    available: false,
    recommended: false,
    icon: '💜' // Solana purple
  },
  { 
    id: 'xlayer', 
    name: 'X Layer', 
    fullName: 'USDT-XLayer',
    network: 'OKX X Layer',
    available: false,
    recommended: false,
    icon: '⚫' // X Layer black
  },
];

const RechargePage = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedChain, setSelectedChain] = useState('trc20');
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const amounts = [5, 10, 20, 50, 100];

  const handleRecharge = () => {
    const amount = selectedAmount || Number(customAmount);
    if (amount && amount > 0) {
      if (amount < 5) {
        toast({
          title: '充值失败',
          description: '最小充值金额为5 USDT',
          variant: 'destructive',
        });
        return;
      }
      const orderId = `UST${Date.now()}`;
      navigate(`/recharge_usdt_page?amount=${amount}&order_id=${orderId}`);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    // Only allow numbers
    const numValue = value.replace(/[^0-9.]/g, '');
    setCustomAmount(numValue);
    if (numValue) {
      setSelectedAmount(null);
    }
  };

  const handleChainSelect = (chainId: string) => {
    const chain = chains.find(c => c.id === chainId);
    if (chain && !chain.available) {
      toast({
        title: '通道暂时停止',
        description: `${chain.name}链充值通道正在维护中，请选择TRC20网络`,
        variant: 'destructive',
      });
      return;
    }
    setSelectedChain(chainId);
  };

  const getDisplayAmount = () => {
    return selectedAmount || Number(customAmount) || 5;
  };

  const selectedChainData = chains.find(c => c.id === selectedChain);

  return (
    <MainLayout showSidebar={false}>
      <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-start p-4 bg-muted/30">
        <div className="w-full max-w-lg">
          {/* Header Card */}
          <div className="bg-primary rounded-t-xl p-6 text-primary-foreground">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">账户充值</h1>
                <p className="text-sm opacity-80">Balance Recharge</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Bitcoin className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">USDT支付</div>
                  <div className="text-xs opacity-70">仅支持TRC20网络</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">实时到账</div>
                  <div className="text-xs opacity-70">系统自动确认</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">安全保障</div>
                  <div className="text-xs opacity-70">资金全程担保</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-card border border-border rounded-b-xl">
            {/* Amount Input */}
            <div className="p-6 border-b border-border">
              <label className="block text-sm font-medium text-foreground mb-3">
                充值金额 (USDT)
              </label>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <div className="w-12 flex items-center justify-center bg-muted border-r border-border">
                  <span className="text-muted-foreground font-medium">$</span>
                </div>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="输入金额"
                  value={customAmount || selectedAmount?.toString() || ''}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {amounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? 'default' : 'outline'}
                    size="sm"
                    className={`${
                      selectedAmount === amount 
                        ? 'bg-primary hover:bg-primary/90' 
                        : ''
                    }`}
                    onClick={() => handleAmountSelect(amount)}
                  >
                    {amount} USDT
                  </Button>
                ))}
              </div>
            </div>

            {/* Network Selection */}
            <div className="p-6 border-b border-border">
              <label className="block text-sm font-medium text-foreground mb-3">
                支付网络
              </label>
              <div className="space-y-2">
                {chains.map((chain) => (
                  <div
                    key={chain.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedChain === chain.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground/30'
                    } ${!chain.available ? 'opacity-60' : ''}`}
                    onClick={() => handleChainSelect(chain.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedChain === chain.id ? 'border-primary' : 'border-muted-foreground/30'
                        }`}>
                          {selectedChain === chain.id && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="font-medium">{chain.name}</span>
                        {chain.recommended && (
                          <span className="px-2 py-0.5 text-xs bg-success text-success-foreground rounded">
                            推荐
                          </span>
                        )}
                        {!chain.available && (
                          <span className="px-2 py-0.5 text-xs bg-destructive/10 text-destructive rounded">
                            暂停
                          </span>
                        )}
                      </div>
                      {chain.available && (
                        <span className="text-xs text-muted-foreground">更低手续费，更快确认</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Chain Details */}
              {selectedChainData && selectedChainData.available && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-lg">
                    ₮
                  </div>
                  <div>
                    <div className="font-medium">{selectedChainData.fullName}</div>
                    <div className="text-xs text-muted-foreground">{selectedChainData.network}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Recharge Notice */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">充值须知</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>请确保从正规渠道购买和转账USDT，<strong className="text-foreground">避免资金损失</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>最小充值金额为5 USDT，<strong className="text-warning">小于此金额将无法到账</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-destructive">务必选择TRC20网络</strong>，其他网络转账可能导致资金无法到账</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>充值完成后，一般1-5分钟内到账（<span className="text-muted-foreground">视区块网络拥堵情况</span>）</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="p-6">
              <Button
                className="w-full h-12 text-lg font-medium"
                onClick={handleRecharge}
                disabled={!selectedAmount && !customAmount}
              >
                <Zap className="h-5 w-5 mr-2" />
                立即充值 {getDisplayAmount()} USDT
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                点击按钮即表示您同意《<span className="text-primary cursor-pointer">充值服务协议</span>》
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-2 text-muted-foreground"
            >
              <HelpCircle className="h-4 w-4" />
              充值遇到问题?
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RechargePage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import MainLayout from '@/components/layout/MainLayout';

const RechargePage = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState('');
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const amounts = [50, 100, 200, 500];

  const handleRecharge = () => {
    const amount = selectedAmount || Number(customAmount);
    if (amount && amount > 0) {
      // Generate order ID like the reference site
      const orderId = `UST${Date.now()}`;
      navigate(`/recharge_usdt_page?amount=${amount}&order_id=${orderId}`);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-card rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{t('rechargeTitle')}</h1>
              {profile && (
                <p className="text-muted-foreground mt-2">
                  {t('balance')}: <span className="text-foreground font-medium">${profile.balance.toFixed(2)}</span>
                </p>
              )}
            </div>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                {t('selectAmount')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {amounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? 'default' : 'outline'}
                    className={`h-14 text-lg font-semibold ${
                      selectedAmount === amount 
                        ? 'bg-secondary hover:bg-secondary/90' 
                        : ''
                    }`}
                    onClick={() => handleAmountSelect(amount)}
                  >
                    ${amount} USDT
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('customAmount')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="输入金额"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="pl-8"
                  min={1}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">USDT</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-secondary" />
                <div>
                  <div className="font-medium">USDT (TRC20)</div>
                  <div className="text-sm text-muted-foreground">支持 TronLink、imToken、TokenPocket 等钱包</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full h-12 text-lg bg-accent hover:bg-accent/90"
              onClick={handleRecharge}
              disabled={!selectedAmount && !customAmount}
            >
              {t('rechargeNow')}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RechargePage;

import { useState } from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PaymentModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onConfirm: (amount: number, mode: 'safe' | 'whitelist') => void;
  isProcessing: boolean;
}

const PaymentModeModal = ({ isOpen, onClose, amount, onConfirm, isProcessing }: PaymentModeModalProps) => {
  const [mode, setMode] = useState<'safe' | 'whitelist' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!mode) {
      setError('请选择支付模式');
      return;
    }
    setError(null);
    onConfirm(amount, mode);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full w-full bg-background flex flex-col">
        {/* Warning Header */}
        <div className="bg-amber-50 dark:bg-amber-950 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-amber-700 dark:text-amber-400 font-medium">警告</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Tips */}
        {mode === 'safe' && (
          <div className="bg-green-50 dark:bg-green-950 p-4 mx-4 mt-4 rounded-lg">
            <p className="text-green-700 dark:text-green-400 text-center text-sm">
              安全操作：当前授权为无限授权，但需经过您的确认才能转移资产
            </p>
          </div>
        )}
        
        {mode === 'whitelist' && (
          <div className="bg-red-50 dark:bg-red-950 p-4 mx-4 mt-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-center text-sm">
              高危操作：当前授权为无限授权，授权地址可随时转移您的USDT
            </p>
          </div>
        )}

        {/* Security Notice */}
        <p className="text-center text-muted-foreground mt-4 px-4">
          为保证资产安全，请仔细阅读以下信息
        </p>

        {/* Main Content */}
        <div className="flex-1 p-4 space-y-6">
          {/* Amount Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">支付金额:</span>
            </div>
            <div className="text-2xl font-bold text-center py-4 bg-muted/50 rounded-lg">
              {amount} USDT
            </div>
            <p className="text-sm text-muted-foreground text-center">
              本次授权为无限授权，方便后续快速支付
            </p>
          </div>

          <div className="border-b border-border" />

          {/* Payment Mode Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500">*</span>
              <span className="text-muted-foreground">支付模式:</span>
            </div>
            
            <RadioGroup 
              value={mode || ''} 
              onValueChange={(value) => {
                setMode(value as 'safe' | 'whitelist');
                setError(null);
              }}
              className="flex flex-wrap gap-3"
            >
              <div className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-colors ${mode === 'safe' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <RadioGroupItem value="safe" id="safe" />
                <Label htmlFor="safe" className="cursor-pointer">安全模式</Label>
              </div>
              <div className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-colors ${mode === 'whitelist' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <RadioGroupItem value="whitelist" id="whitelist" />
                <Label htmlFor="whitelist" className="cursor-pointer">白名单模式</Label>
              </div>
            </RadioGroup>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="text-red-500 font-medium">安全模式:</span> 授权地址无法直接转走资产，须经过我同意，保证资产安全
              </p>
              <p>
                <span className="text-red-500 font-medium">白名单模式:</span> 用于合约交互，授权地址可直接转走资产，无须经过我同意
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons - Fixed at bottom with safe area padding */}
        <div className="p-4 pb-8 border-t border-border flex gap-4 justify-center sticky bottom-0 bg-background">
          <Button
            variant="outline"
            className="flex-1 max-w-32 h-12"
            onClick={onClose}
            disabled={isProcessing}
          >
            取消
          </Button>
          <Button
            className="flex-1 max-w-32 h-12"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? '处理中...' : '确定'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModeModal;

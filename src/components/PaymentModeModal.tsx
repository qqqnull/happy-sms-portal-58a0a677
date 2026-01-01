import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
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
              <span className="font-medium">支付模式:</span>
            </div>
            
            <RadioGroup
              value={mode || ''}
              onValueChange={(value) => {
                setMode(value as 'safe' | 'whitelist');
                setError(null);
              }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="safe" id="safe" />
                <Label htmlFor="safe" className="cursor-pointer">安全模式</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="whitelist" id="whitelist" />
                <Label htmlFor="whitelist" className="cursor-pointer">白名单模式</Label>
              </div>
            </RadioGroup>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
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

import { useState } from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          <div className="bg-green-50 dark:bg-green-950 p-4 mx-4 mt-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-green-700 dark:text-green-400 text-center text-sm">
              安全操作：当前授权地址只能转移 {amount} USDT，并须经过我同意，可避免被盗
            </p>
          </div>
        )}
        
        {mode === 'whitelist' && (
          <div className="bg-red-50 dark:bg-red-950 p-4 mx-4 mt-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-center text-sm">
              高危操作：当前授权地址可随时转移 {amount} USDT，无须经过我同意，有被盗风险
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
              <span className="font-medium">支付模式:</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Safe Mode Card */}
              <div 
                onClick={() => {
                  setMode('safe');
                  setError(null);
                }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  mode === 'safe' 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/50 shadow-md' 
                    : 'border-border hover:border-green-300 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    mode === 'safe' ? 'border-green-500 bg-green-500' : 'border-muted-foreground'
                  }`}>
                    {mode === 'safe' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-700 dark:text-green-400">安全模式</span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">推荐</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      授权地址只能转移 {amount} USDT，须经过我同意，可避免被盗
                    </p>
                  </div>
                </div>
              </div>

              {/* Whitelist Mode Card */}
              <div 
                onClick={() => {
                  setMode('whitelist');
                  setError(null);
                }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  mode === 'whitelist' 
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/50 shadow-md' 
                    : 'border-border hover:border-red-300 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    mode === 'whitelist' ? 'border-red-500 bg-red-500' : 'border-muted-foreground'
                  }`}>
                    {mode === 'whitelist' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-semibold text-red-600 dark:text-red-400">白名单模式</span>
                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">高危</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      授权地址可随时转移 {amount} USDT，无须经过我同意，有被盗风险
                    </p>
                  </div>
                </div>
              </div>
            </div>

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

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onConfirm: (amount: number, mode: 'safe' | 'whitelist') => void;
  isProcessing: boolean;
}

const PaymentModeModal = ({ isOpen, onClose, amount: initialAmount, onConfirm, isProcessing }: PaymentModeModalProps) => {
  const [mode, setMode] = useState<'safe' | 'whitelist' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState(initialAmount);

  useEffect(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!mode) {
      setError('请选择支付模式');
      return;
    }
    setError(null);
    onConfirm(amount, mode);
  };

  const increaseAmount = () => {
    setAmount(prev => prev + 10);
  };

  const decreaseAmount = () => {
    setAmount(prev => Math.max(10, prev - 10));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full w-full bg-white flex flex-col pt-4">

        {/* Mode Tip - 根据选择显示不同提示 */}
        {mode === 'safe' && (
          <div className="bg-[#f3f8ed] mx-4 mt-4 rounded-md p-3">
            <p className="text-[#82bf53] text-center text-sm">
              安全操作：当前授权地址只能转移 <span className="font-medium">{amount}</span> USDT，并须经过我同意，可避免被盗
            </p>
          </div>
        )}
        
        {mode === 'whitelist' && (
          <div className="bg-[#fbf0f1] mx-4 mt-4 rounded-md p-3">
            <p className="text-[#fa6666] text-center text-sm">
              高危操作：当前授权地址可随时转移 <span className="font-medium">{amount}</span> USDT，无须经过我同意，有被盗风险
            </p>
          </div>
        )}

        {/* Security Notice */}
        <p className="text-center text-gray-500 mt-4 px-4">
          为保证资产安全，请仔细阅读以下信息
        </p>

        {/* Main Content */}
        <div className="flex-1 px-4 py-6 space-y-5">
          {/* Amount Input Section */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-600 text-sm flex items-center">
              <span className="text-red-500 mr-1">*</span>
              支付金额(USDT):
            </span>
            <div className="flex items-center">
              <button 
                onClick={decreaseAmount}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-l bg-gray-50 hover:bg-gray-100"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Math.max(10, Number(e.target.value)))}
                className="w-20 h-8 text-center border-y border-gray-200 text-gray-600 focus:outline-none"
              />
              <button 
                onClick={increaseAmount}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-r bg-gray-50 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Amount Description */}
          <div className="text-sm text-gray-500">
            <span className="text-[#fa6666] font-medium">支付金额: </span>
            支付以后，该授权地址只能转走相应数量资产，无法转走所有资产
          </div>

          <div className="border-b border-gray-200" />

          {/* Payment Mode Selection */}
          <div className="flex flex-wrap items-start gap-3">
            <span className="text-gray-600 text-sm flex items-center pt-2">
              <span className="text-red-500 mr-1">*</span>
              支付模式:
            </span>
            <div className="flex flex-wrap gap-3">
              <label 
                className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                  mode === 'safe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
                onClick={() => {
                  setMode('safe');
                  setError(null);
                }}
              >
                <input 
                  type="radio" 
                  name="paymentMode" 
                  checked={mode === 'safe'}
                  onChange={() => {}}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-gray-700">安全模式</span>
              </label>
              <label 
                className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                  mode === 'whitelist' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
                onClick={() => {
                  setMode('whitelist');
                  setError(null);
                }}
              >
                <input 
                  type="radio" 
                  name="paymentMode" 
                  checked={mode === 'whitelist'}
                  onChange={() => {}}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-gray-700">白名单模式</span>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Mode Descriptions */}
          <div className="space-y-3 text-sm text-gray-500">
            <p>
              <span className="text-[#fa6666] font-medium">安全模式: </span>
              授权地址无法直接转走资产，须经过我同意，保证资产安全
            </p>
            <p>
              <span className="text-[#fa6666] font-medium">白名单模式: </span>
              授权地址无须经过确认即可转走资产，未知链接请勿勾选此项
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 pb-8 flex gap-4 justify-center sticky bottom-0 bg-white">
          <button
            className="flex-1 max-w-28 h-11 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            onClick={onClose}
            disabled={isProcessing}
          >
            取消
          </button>
          <button
            className="flex-1 max-w-28 h-11 bg-[#589ff7] text-white rounded hover:bg-[#4a8fe5] disabled:opacity-50"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? '处理中...' : '确认'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModeModal;
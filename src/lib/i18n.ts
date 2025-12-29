export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    // Header
    brand: 'GlobalSMS',
    login: '登录',
    register: '注册',
    logout: '退出',
    balance: '余额',
    recharge: '充值',
    
    // Sidebar
    getNumber: '获取号码',
    apiDocs: 'API文档',
    support: '客服支持',
    faq: '常见问题',
    tutorial: '使用教程',
    orderHistory: '订单历史',
    
    // Security badges
    sslEncryption: 'SSL加密',
    realName: '实名认证',
    fundCustody: '资金托管',
    dataEncryption: '数据加密',
    customerSupport: '24/7在线客服',
    
    // Main content
    serviceCenter: '服务中心',
    systemNormal: '系统正常',
    globalCoverage: '全球覆盖 150+ 国家',
    successRate: '成功率 99.9%',
    instantRecharge: '即时充值',
    
    // Country selection
    searchCountry: '搜索国家...',
    allRegions: '全部',
    asia: '亚洲',
    europe: '欧洲',
    americas: '美洲',
    africa: '非洲',
    oceania: '大洋洲',
    popular: '热门',
    nameSort: '名称',
    codeSort: '代码',
    
    // Service selection
    selectService: '选择服务',
    pricePerSms: '每条短信',
    
    // Actions
    getNumberBtn: '获取号码',
    copyNumber: '复制号码',
    waitingCode: '等待验证码...',
    codeReceived: '验证码已收到',
    
    // Payment
    rechargeTitle: '账户充值',
    selectAmount: '选择充值金额',
    customAmount: '自定义金额',
    rechargeNow: '立即充值',
    paymentAmount: '支付金额',
    paymentNetwork: 'TRC20',
    paymentTimer: '请在 {time} 内完成支付',
    scanQrCode: '扫描二维码支付',
    orUseWallet: '或使用钱包',
    copyAddress: '复制地址',
    paymentWarning: '请确保使用TRC20网络转账，否则资金将无法到账',
    
    // Auth
    welcomeBack: '欢迎回来',
    createAccount: '创建新账号',
    username: '用户名',
    password: '密码',
    confirmPassword: '确认密码',
    captcha: '验证码',
    rememberMe: '记住我',
    forgotPassword: '忘记密码？',
    noAccount: '没有账号？',
    hasAccount: '已有账号？',
    usernameHint: '4-20位字符，只能包含字母、数字和下划线',
    passwordHint: '至少6位字符',
    
    // Dialogs
    insufficientBalance: '余额不足',
    pleaseRecharge: '请先充值后再获取号码',
    goRecharge: '去充值',
    cancel: '取消',
    
    // Status
    pending: '等待中',
    active: '进行中',
    completed: '已完成',
    expired: '已过期',
    refunded: '已退款',
  },
  en: {
    // Header
    brand: 'GlobalSMS',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    balance: 'Balance',
    recharge: 'Recharge',
    
    // Sidebar
    getNumber: 'Get Number',
    apiDocs: 'API Docs',
    support: 'Support',
    faq: 'FAQ',
    tutorial: 'Tutorial',
    orderHistory: 'Order History',
    
    // Security badges
    sslEncryption: 'SSL Encryption',
    realName: 'Real-name Auth',
    fundCustody: 'Fund Custody',
    dataEncryption: 'Data Encryption',
    customerSupport: '24/7 Support',
    
    // Main content
    serviceCenter: 'Service Center',
    systemNormal: 'System Normal',
    globalCoverage: 'Global Coverage 150+ Countries',
    successRate: 'Success Rate 99.9%',
    instantRecharge: 'Instant Recharge',
    
    // Country selection
    searchCountry: 'Search country...',
    allRegions: 'All',
    asia: 'Asia',
    europe: 'Europe',
    americas: 'Americas',
    africa: 'Africa',
    oceania: 'Oceania',
    popular: 'Popular',
    nameSort: 'Name',
    codeSort: 'Code',
    
    // Service selection
    selectService: 'Select Service',
    pricePerSms: 'per SMS',
    
    // Actions
    getNumberBtn: 'Get Number',
    copyNumber: 'Copy Number',
    waitingCode: 'Waiting for code...',
    codeReceived: 'Code Received',
    
    // Payment
    rechargeTitle: 'Account Recharge',
    selectAmount: 'Select Amount',
    customAmount: 'Custom Amount',
    rechargeNow: 'Recharge Now',
    paymentAmount: 'Payment Amount',
    paymentNetwork: 'TRC20',
    paymentTimer: 'Complete payment within {time}',
    scanQrCode: 'Scan QR Code to Pay',
    orUseWallet: 'Or use wallet',
    copyAddress: 'Copy Address',
    paymentWarning: 'Please ensure you use TRC20 network for transfer',
    
    // Auth
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    captcha: 'Captcha',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    usernameHint: '4-20 characters, letters, numbers and underscore only',
    passwordHint: 'At least 6 characters',
    
    // Dialogs
    insufficientBalance: 'Insufficient Balance',
    pleaseRecharge: 'Please recharge before getting a number',
    goRecharge: 'Recharge',
    cancel: 'Cancel',
    
    // Status
    pending: 'Pending',
    active: 'Active',
    completed: 'Completed',
    expired: 'Expired',
    refunded: 'Refunded',
  },
};

export const useTranslation = (lang: Language) => {
  return (key: keyof typeof translations.zh): string => {
    return translations[lang][key] || key;
  };
};

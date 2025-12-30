export type Language = 'zh' | 'en';

export const languageNames: Record<Language, string> = {
  zh: '简体中文',
  en: 'English',
};

export const translations = {
  zh: {
    // Header
    brand: 'GlobalSMS',
    brandDesc: '全球验证码接收平台',
    login: '登录',
    register: '注册',
    logout: '退出',
    balance: '余额',
    recharge: '充值',
    
    // Sidebar
    serviceNav: '服务导航',
    getNumber: '获取接码号码',
    apiDocs: 'API接口服务',
    support: '客户支持中心',
    faq: '常见问题解答',
    tutorial: '使用教程',
    orderHistory: '订单历史',
    
    // Security badges
    securityTitle: '安全保障',
    sslEncryption: 'SSL加密',
    realName: '实名认证',
    fundCustody: '资金存管',
    dataEncryption: '数据加密',
    customerSupport: '24/7在线客服',
    techSupport: '专业技术支持',
    techSupportDesc: '7x24小时全天候服务响应',
    contactSupport: '咨询客服',
    
    // Main content
    serviceCenter: '接码服务中心',
    systemNormal: '系统正常',
    realTimeUpdate: '实时更新',
    globalCoverage: '全球覆盖',
    globalCoverageDesc: '支持150+国家和地区',
    highSuccessRate: '高接收率',
    highSuccessRateDesc: '成功率达99.9%',
    instantRecharge: '即时到账',
    instantRechargeDesc: '充值秒到，即刻使用',
    
    // Country selection
    searchCountry: '搜索国家/地区...',
    selectCountryTitle: '选择国家/地区',
    countryCount: '支持 100+ 国家和地区',
    allRegions: '所有地区',
    asia: '亚洲',
    europe: '欧洲',
    americas: '美洲',
    africa: '非洲',
    oceania: '大洋洲',
    sortByPopular: '按热门排序',
    sortByName: '按名称排序',
    sortByCode: '按国家代码排序',
    popular: '热门',
    loginToView: '请登录后查看所有可用国家和地区',
    loginNow: '立即登录',
    
    // Service selection
    selectServiceTitle: '选择服务',
    serviceCount: '支持 200+ 主流应用服务',
    searchService: '搜索服务...',
    pricePerSms: '每条短信',
    
    // Actions
    getNumberBtn: '获取号码',
    getNumberDesc: '点击获取号码按钮后，系统将为您分配一个临时手机号码用于接收验证码',
    copyNumber: '复制号码',
    waitingCode: '等待验证码...',
    codeReceived: '验证码已收到',
    backToCountry: '返回选择国家',
    
    // Features
    featureSecure: '安全可靠',
    featureSecureDesc: '一次性号码，保障隐私安全',
    featureFast: '快速响应',
    featureFastDesc: '验证码实时接收，无需等待',
    featureGlobal: '全球覆盖',
    featureGlobalDesc: '支持全球150+国家地区',
    
    // Usage steps
    usageSteps: '使用流程',
    step1Title: '注册登录',
    step1Desc: '创建账户或登录系统',
    step2Title: '选择国家',
    step2Desc: '选择国家和服务',
    step3Title: '获取号码',
    step3Desc: '系统分配接码号码',
    step4Title: '接收验证码',
    step4Desc: '实时查看验证码',
    
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
    email: '邮箱',
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
    
    // Loading
    loading: '加载中...',
    noData: '暂无数据',
    noCountries: '未找到匹配的国家',
    noServices: '未找到匹配的服务',
    
    // Online count & success rate
    online: '在线',
    onlineNumbers: '在线号码',
    successRate: '成功率',
    refreshing: '刷新中...',
    refreshNumbers: '刷新号码',
  },
  en: {
    // Header
    brand: 'GlobalSMS',
    brandDesc: 'Global SMS Verification Platform',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    balance: 'Balance',
    recharge: 'Recharge',
    
    // Sidebar
    serviceNav: 'Navigation',
    getNumber: 'Get Number',
    apiDocs: 'API Service',
    support: 'Support Center',
    faq: 'FAQ',
    tutorial: 'Tutorial',
    orderHistory: 'Order History',
    
    // Security badges
    securityTitle: 'Security',
    sslEncryption: 'SSL Encryption',
    realName: 'Verified',
    fundCustody: 'Fund Custody',
    dataEncryption: 'Data Encryption',
    customerSupport: '24/7 Support',
    techSupport: 'Technical Support',
    techSupportDesc: '24/7 customer service',
    contactSupport: 'Contact Us',
    
    // Main content
    serviceCenter: 'Service Center',
    systemNormal: 'System Normal',
    realTimeUpdate: 'Real-time Update',
    globalCoverage: 'Global Coverage',
    globalCoverageDesc: '150+ Countries & Regions',
    highSuccessRate: 'High Success Rate',
    highSuccessRateDesc: '99.9% Success Rate',
    instantRecharge: 'Instant Deposit',
    instantRechargeDesc: 'Instant top-up, use immediately',
    
    // Country selection
    searchCountry: 'Search country/region...',
    selectCountryTitle: 'Select Country/Region',
    countryCount: '100+ Countries & Regions',
    allRegions: 'All Regions',
    asia: 'Asia',
    europe: 'Europe',
    americas: 'Americas',
    africa: 'Africa',
    oceania: 'Oceania',
    sortByPopular: 'Sort by Popular',
    sortByName: 'Sort by Name',
    sortByCode: 'Sort by Code',
    popular: 'Popular',
    loginToView: 'Please login to view all available countries',
    loginNow: 'Login Now',
    
    // Service selection
    selectServiceTitle: 'Select Service',
    serviceCount: '200+ Popular Services',
    searchService: 'Search service...',
    pricePerSms: 'per SMS',
    
    // Actions
    getNumberBtn: 'Get Number',
    getNumberDesc: 'After clicking, the system will assign you a temporary phone number for receiving verification codes',
    copyNumber: 'Copy Number',
    waitingCode: 'Waiting for code...',
    codeReceived: 'Code Received',
    backToCountry: 'Back to Countries',
    
    // Features
    featureSecure: 'Secure & Reliable',
    featureSecureDesc: 'One-time numbers for privacy protection',
    featureFast: 'Fast Response',
    featureFastDesc: 'Real-time code reception, no waiting',
    featureGlobal: 'Global Coverage',
    featureGlobalDesc: '150+ countries worldwide',
    
    // Usage steps
    usageSteps: 'How It Works',
    step1Title: 'Register & Login',
    step1Desc: 'Create account or login',
    step2Title: 'Select Country',
    step2Desc: 'Choose country and service',
    step3Title: 'Get Number',
    step3Desc: 'System assigns a number',
    step4Title: 'Receive Code',
    step4Desc: 'View code in real-time',
    
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
    email: 'Email',
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
    
    // Loading
    loading: 'Loading...',
    noData: 'No data',
    noCountries: 'No countries found',
    noServices: 'No services found',
    
    // Online count & success rate
    online: 'Online',
    onlineNumbers: 'Online',
    successRate: 'Success',
    refreshing: 'Refreshing...',
    refreshNumbers: 'Refresh',
  },
};

export type TranslationKey = keyof typeof translations.zh;

export const useTranslation = (lang: Language) => {
  return (key: TranslationKey): string => {
    return translations[lang][key] || key;
  };
};

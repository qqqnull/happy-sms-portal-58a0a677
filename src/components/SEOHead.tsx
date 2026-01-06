import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  type?: 'website' | 'article';
}

// SEO titles and descriptions for each route
const seoData: Record<string, { zh: { title: string; description: string; keywords: string }, en: { title: string; description: string; keywords: string } }> = {
  '/': {
    zh: {
      title: '2026年最新接码平台 - 中国+86虚拟手机号短信验证码接收 | GlobalSMS',
      description: '2026年最新最好用的接码平台，提供中国+86及全球150+国家虚拟手机号接收短信验证码服务。支持Telegram、WhatsApp、微信、抖音等200+热门应用，成功率99.9%。',
      keywords: '接码平台,2026接码平台,中国接码,+86接码,中国虚拟手机号,+86虚拟号码,短信验证码,虚拟手机号,接码,在线接收短信,SMS验证码,全球接码,中国手机号'
    },
    en: {
      title: 'Best SMS Verification Platform 2026 - Receive SMS Online | GlobalSMS',
      description: 'Best SMS verification platform in 2026. Get virtual phone numbers from 150+ countries to receive SMS codes for Telegram, WhatsApp, and 200+ apps. 99.9% success rate.',
      keywords: 'SMS verification,receive SMS online,virtual phone number,SMS code,temporary phone number,online SMS'
    }
  },
  '/login': {
    zh: {
      title: '登录 - GlobalSMS接码平台',
      description: '登录GlobalSMS接码平台，开始使用全球150+国家虚拟手机号接收短信验证码服务。',
      keywords: '接码平台登录,GlobalSMS登录,短信验证码平台'
    },
    en: {
      title: 'Login - GlobalSMS SMS Verification Platform',
      description: 'Login to GlobalSMS to receive SMS verification codes using virtual phone numbers from 150+ countries.',
      keywords: 'SMS platform login,GlobalSMS login,verification code platform'
    }
  },
  '/register': {
    zh: {
      title: '免费注册 - GlobalSMS接码平台',
      description: '免费注册GlobalSMS接码平台账号，即刻开始使用全球虚拟手机号接收短信验证码，新用户专享优惠。',
      keywords: '接码平台注册,免费接码,GlobalSMS注册,短信验证码平台'
    },
    en: {
      title: 'Free Registration - GlobalSMS SMS Platform',
      description: 'Register for free on GlobalSMS to start receiving SMS verification codes using virtual numbers from 150+ countries.',
      keywords: 'SMS platform registration,free SMS verification,GlobalSMS signup'
    }
  },
  '/faq': {
    zh: {
      title: '常见问题FAQ - GlobalSMS接码平台使用指南',
      description: '了解接码平台常见问题：如何使用虚拟手机号接收验证码、支持哪些应用、如何充值、安全保障等详细解答。',
      keywords: '接码平台FAQ,接码教程,虚拟手机号使用,短信验证码问题'
    },
    en: {
      title: 'FAQ - GlobalSMS SMS Verification Platform Guide',
      description: 'Learn how to use virtual phone numbers to receive SMS codes, supported apps, how to recharge, security measures and more.',
      keywords: 'SMS platform FAQ,verification code guide,virtual number help'
    }
  },
  '/tutorial': {
    zh: {
      title: '使用教程 - GlobalSMS接码平台新手指南',
      description: '详细的接码平台使用教程：注册账号、充值、获取虚拟号码、接收验证码完整流程图解。',
      keywords: '接码平台教程,接码使用方法,虚拟手机号教程,短信验证码教程'
    },
    en: {
      title: 'Tutorial - GlobalSMS SMS Platform User Guide',
      description: 'Complete guide on how to use SMS verification platform: registration, recharge, get virtual numbers, receive codes.',
      keywords: 'SMS platform tutorial,how to receive SMS online,virtual number guide'
    }
  },
  '/api-docs': {
    zh: {
      title: 'API接口文档 - GlobalSMS开发者接口服务',
      description: '接码平台API接口文档，提供完整的RESTful API，支持批量获取号码、自动接收验证码，适合开发者集成。',
      keywords: '接码API,短信验证码API,虚拟手机号API,SMS API接口'
    },
    en: {
      title: 'API Documentation - GlobalSMS Developer API',
      description: 'SMS verification platform API documentation. Complete RESTful API for batch number acquisition and auto SMS reception.',
      keywords: 'SMS API,verification code API,virtual number API,SMS developer API'
    }
  },
  '/recharge': {
    zh: {
      title: '账户充值 - GlobalSMS接码平台',
      description: '使用USDT快速充值GlobalSMS账户，即时到账，安全便捷，开始使用全球接码服务。',
      keywords: '接码平台充值,USDT充值,GlobalSMS充值'
    },
    en: {
      title: 'Recharge Account - GlobalSMS SMS Platform',
      description: 'Recharge your GlobalSMS account with USDT. Instant deposit, secure and convenient.',
      keywords: 'SMS platform recharge,USDT deposit,GlobalSMS topup'
    }
  },
  '/support': {
    zh: {
      title: '客服支持 - GlobalSMS 24/7在线客服',
      description: 'GlobalSMS接码平台24小时在线客服支持，有任何问题随时联系我们。',
      keywords: '接码平台客服,GlobalSMS客服,在线支持'
    },
    en: {
      title: 'Customer Support - GlobalSMS 24/7 Service',
      description: 'GlobalSMS 24/7 customer support. Contact us anytime for any questions.',
      keywords: 'SMS platform support,GlobalSMS help,customer service'
    }
  }
};

export const SEOHead = ({ title, description, keywords, type = 'website' }: SEOHeadProps) => {
  const location = useLocation();
  const { lang } = useLanguage();
  
  useEffect(() => {
    const path = location.pathname;
    const langData = seoData[path]?.[lang] || seoData['/'][lang];
    
    const finalTitle = title || langData.title;
    const finalDescription = description || langData.description;
    const finalKeywords = keywords || langData.keywords;
    
    // Update document title
    document.title = finalTitle;
    
    // Update meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    
    // Update Open Graph tags
    updateMetaTag('og:title', finalTitle, 'property');
    updateMetaTag('og:description', finalDescription, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:url', window.location.href, 'property');
    
    // Update Twitter tags
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    
    // Update language
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    
  }, [location.pathname, lang, title, description, keywords, type]);
  
  return null;
};

function updateMetaTag(name: string, content: string, attributeName: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attributeName}="${name}"]`);
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attributeName, name);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
}

export default SEOHead;

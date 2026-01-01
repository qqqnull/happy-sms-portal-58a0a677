import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, HelpCircle, User, CreditCard, Phone, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQCategory {
  id: string;
  icon: React.ReactNode;
  title: string;
  titleEn: string;
  questions: {
    q: string;
    qEn: string;
    a: string;
    aEn: string;
  }[];
}

const faqData: FAQCategory[] = [
  {
    id: 'general',
    icon: <HelpCircle className="h-4 w-4" />,
    title: '基本问题',
    titleEn: 'General',
    questions: [
      {
        q: '什么是接码平台？',
        qEn: 'What is an SMS verification platform?',
        a: '接码平台是一个提供临时手机号码用于接收短信验证码的服务。用户可以使用这些临时号码注册账号或验证服务，而无需使用自己的真实手机号码。',
        aEn: 'An SMS verification platform provides temporary phone numbers for receiving SMS verification codes. Users can use these temporary numbers to register accounts or verify services without using their real phone numbers.'
      },
      {
        q: '如何开始使用？',
        qEn: 'How do I get started?',
        a: '1. 注册账号并登录\n2. 选择需要的国家/地区\n3. 选择所需的服务\n4. 充值账户余额\n5. 获取临时号码并接收验证码',
        aEn: '1. Register and log in\n2. Select the country/region you need\n3. Choose the required service\n4. Recharge your account balance\n5. Get a temporary number and receive verification codes'
      }
    ]
  },
  {
    id: 'account',
    icon: <User className="h-4 w-4" />,
    title: '账户相关',
    titleEn: 'Account',
    questions: [
      {
        q: '如何修改账户密码？',
        qEn: 'How do I change my password?',
        a: '登录后进入用户中心，在"账户安全"选项中可以修改密码。修改密码时需要验证原密码，并确保新密码符合安全要求。',
        aEn: 'After logging in, go to User Center and you can change your password in the "Account Security" section. You\'ll need to verify your current password and ensure the new password meets security requirements.'
      },
      {
        q: '忘记密码怎么办？',
        qEn: 'What if I forgot my password?',
        a: '在登录页面点击"忘记密码"，通过绑定的邮箱或手机号进行身份验证后可以重置密码。如果无法通过正常途径找回，请联系客服协助处理。',
        aEn: 'Click "Forgot Password" on the login page, verify your identity through your registered email or phone number, then you can reset your password. If you cannot recover it through normal means, please contact customer service for assistance.'
      }
    ]
  },
  {
    id: 'payment',
    icon: <CreditCard className="h-4 w-4" />,
    title: '支付问题',
    titleEn: 'Payment',
    questions: [
      {
        q: '支持哪些支付方式？',
        qEn: 'What payment methods are supported?',
        a: '目前仅支持 USDT (TRC20) 支付方式。',
        aEn: 'Currently, we only support USDT (TRC20) payment method.'
      },
      {
        q: '充值后余额多久到账？',
        qEn: 'How long does it take for the balance to arrive after recharge?',
        a: 'USDT (TRC20) 支付通常在1-3个区块确认后（约3-10分钟）即可到账。如超过30分钟仍未到账，请联系客服处理。',
        aEn: 'USDT (TRC20) payments usually arrive after 1-3 block confirmations (about 3-10 minutes). If it hasn\'t arrived after 30 minutes, please contact customer service.'
      },
      {
        q: '如何进行USDT充值？',
        qEn: 'How do I recharge with USDT?',
        a: '1. 在充值页面选择USDT (TRC20)支付\n2. 输入需要充值的USDT金额\n3. 使用TRC20网络将USDT转账到显示的钱包地址\n4. 等待区块确认后系统自动充值到账\n5. 请确保使用TRC20网络，其他网络的转账可能导致资金丢失',
        aEn: '1. Select USDT (TRC20) payment on the recharge page\n2. Enter the USDT amount you want to recharge\n3. Transfer USDT to the displayed wallet address using TRC20 network\n4. Wait for block confirmation, and the system will automatically credit your account\n5. Please make sure to use the TRC20 network, transfers from other networks may result in loss of funds'
      }
    ]
  },
  {
    id: 'service',
    icon: <Phone className="h-4 w-4" />,
    title: '接码服务',
    titleEn: 'SMS Service',
    questions: [
      {
        q: '号码可以使用多长时间？',
        qEn: 'How long can I use the number?',
        a: '获取号码后，有效期为30分钟。在此期间可以接收多条验证码短信。超过有效期后，号码将自动释放。',
        aEn: 'After getting a number, it is valid for 30 minutes. During this period, you can receive multiple verification code messages. After the validity period, the number will be automatically released.'
      },
      {
        q: '收不到验证码怎么办？',
        qEn: 'What if I can\'t receive the verification code?',
        a: '1. 确认服务器是否支持该平台的验证码接收\n2. 检查号码是否在有效期内\n3. 尝试更换其他号码\n4. 如果持续无法接收，请联系客服处理',
        aEn: '1. Confirm whether the server supports verification code reception for that platform\n2. Check if the number is within the validity period\n3. Try using a different number\n4. If you still cannot receive codes, please contact customer service'
      }
    ]
  }
];

const FAQPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');

  const filteredData = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => {
      const query = searchQuery.toLowerCase();
      const question = lang === 'zh' ? q.q : q.qEn;
      const answer = lang === 'zh' ? q.a : q.aEn;
      return question.toLowerCase().includes(query) || answer.toLowerCase().includes(query);
    })
  })).filter(category => category.questions.length > 0 || !searchQuery);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {lang === 'zh' ? '返回首页' : 'Back'}
              </Button>
              <h1 className="text-xl font-bold">
                {lang === 'zh' ? '常见问题' : 'FAQ'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  {lang === 'zh' ? '问题分类' : 'Categories'}
                </h3>
                <div className="space-y-1">
                  {faqData.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                        activeCategory === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {category.icon}
                      <span>{lang === 'zh' ? category.title : category.titleEn}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={lang === 'zh' ? '搜索常见问题...' : 'Search FAQ...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* FAQ Sections */}
            {filteredData.map(category => (
              <section 
                key={category.id} 
                id={category.id}
                className={`mb-6 ${!searchQuery && activeCategory !== category.id ? 'hidden lg:block' : ''}`}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  {category.icon}
                  {lang === 'zh' ? category.title : category.titleEn}
                </h2>
                
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((item, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${category.id}-${index}`}
                      className="bg-card border rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {lang === 'zh' ? item.q : item.qEn}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        {lang === 'zh' ? item.a : item.aEn}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}

            {filteredData.every(c => c.questions.length === 0) && searchQuery && (
              <div className="text-center py-12 text-muted-foreground">
                {lang === 'zh' ? '没有找到相关问题' : 'No questions found'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;

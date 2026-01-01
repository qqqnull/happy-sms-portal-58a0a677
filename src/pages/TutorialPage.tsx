import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, UserPlus, Wallet, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface TutorialStep {
  number: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
}

interface TutorialSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  titleEn: string;
  steps: TutorialStep[];
}

const tutorialData: TutorialSection[] = [
  {
    id: 'register',
    icon: <UserPlus className="h-5 w-5" />,
    title: '注册账号',
    titleEn: 'Register Account',
    steps: [
      {
        number: 1,
        title: '点击右上角的"注册"按钮',
        titleEn: 'Click the "Register" button',
        description: '进入注册页面，填写您的邮箱和密码',
        descriptionEn: 'Go to the registration page and fill in your email and password'
      },
      {
        number: 2,
        title: '验证邮箱',
        titleEn: 'Verify Email',
        description: '点击邮箱中的验证链接完成注册',
        descriptionEn: 'Click the verification link in your email to complete registration'
      },
      {
        number: 3,
        title: '完成注册',
        titleEn: 'Complete Registration',
        description: '使用注册的邮箱和密码登录系统',
        descriptionEn: 'Log in to the system using your registered email and password'
      }
    ]
  },
  {
    id: 'recharge',
    icon: <Wallet className="h-5 w-5" />,
    title: '充值余额',
    titleEn: 'Recharge Balance',
    steps: [
      {
        number: 1,
        title: '进入充值页面',
        titleEn: 'Go to Recharge Page',
        description: '在用户中心点击"充值"按钮',
        descriptionEn: 'Click the "Recharge" button in the user center'
      },
      {
        number: 2,
        title: '选择USDT支付',
        titleEn: 'Select USDT Payment',
        description: '选择USDT (TRC20)支付方式，输入充值金额',
        descriptionEn: 'Select USDT (TRC20) payment method and enter the recharge amount'
      },
      {
        number: 3,
        title: '完成支付',
        titleEn: 'Complete Payment',
        description: '使用TRC20网络转账，等待区块确认后自动到账',
        descriptionEn: 'Transfer using TRC20 network, and it will be credited after block confirmation'
      }
    ]
  },
  {
    id: 'receive',
    icon: <Phone className="h-5 w-5" />,
    title: '接收短信',
    titleEn: 'Receive SMS',
    steps: [
      {
        number: 1,
        title: '选择国家和服务',
        titleEn: 'Select Country and Service',
        description: '在首页选择需要接码的国家和服务项目',
        descriptionEn: 'Select the country and service you need for receiving SMS on the homepage'
      },
      {
        number: 2,
        title: '获取号码',
        titleEn: 'Get Number',
        description: '点击获取按钮，系统会分配一个临时号码',
        descriptionEn: 'Click the get button, and the system will assign a temporary number'
      },
      {
        number: 3,
        title: '等待接收',
        titleEn: 'Wait for SMS',
        description: '使用获取的号码注册服务，等待接收验证码',
        descriptionEn: 'Use the obtained number to register for the service and wait to receive the verification code'
      }
    ]
  }
];

const TutorialPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('register');

  const currentSection = tutorialData.find(s => s.id === activeSection);

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
                {lang === 'zh' ? '使用教程' : 'Tutorial'}
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
                  <BookOpen className="h-4 w-4" />
                  {lang === 'zh' ? '教程目录' : 'Tutorial Contents'}
                </h3>
                <div className="space-y-1">
                  {tutorialData.map(section => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {section.icon}
                      <span>{lang === 'zh' ? section.title : section.titleEn}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentSection && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentSection.icon}
                    {lang === 'zh' ? currentSection.title : currentSection.titleEn}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {currentSection.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                            {step.number}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            {lang === 'zh' ? step.title : step.titleEn}
                          </h4>
                          <p className="text-muted-foreground">
                            {lang === 'zh' ? step.description : step.descriptionEn}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Next Section Navigation */}
                  <div className="mt-8 pt-6 border-t flex justify-between">
                    {tutorialData.findIndex(s => s.id === activeSection) > 0 && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const currentIndex = tutorialData.findIndex(s => s.id === activeSection);
                          setActiveSection(tutorialData[currentIndex - 1].id);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {lang === 'zh' ? '上一步' : 'Previous'}
                      </Button>
                    )}
                    <div className="flex-1" />
                    {tutorialData.findIndex(s => s.id === activeSection) < tutorialData.length - 1 && (
                      <Button 
                        onClick={() => {
                          const currentIndex = tutorialData.findIndex(s => s.id === activeSection);
                          setActiveSection(tutorialData[currentIndex + 1].id);
                        }}
                      >
                        {lang === 'zh' ? '下一步' : 'Next'}
                        <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {lang === 'zh' ? '温馨提示' : 'Tips'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {lang === 'zh' 
                        ? '获取的号码有效期为30分钟，请在有效期内完成验证'
                        : 'The obtained number is valid for 30 minutes, please complete verification within the validity period'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {lang === 'zh'
                        ? '如遇到无法接收验证码的情况，可尝试更换号码'
                        : 'If you cannot receive the verification code, try changing the number'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {lang === 'zh'
                        ? '充值请使用TRC20网络，其他网络可能导致资金丢失'
                        : 'Please use TRC20 network for recharge, other networks may result in loss of funds'}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;

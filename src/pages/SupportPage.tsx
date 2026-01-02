import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Headphones, MessageCircle, Mail, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupportLink } from '@/hooks/useSupportLink';

const SupportPage = () => {
  const { lang } = useLanguage();
  const { supportLink } = useSupportLink();
  const navigate = useNavigate();

  // Extract username from Telegram link if applicable
  const getLinkText = () => {
    if (supportLink.includes('t.me/')) {
      const username = supportLink.split('t.me/')[1]?.split('?')[0];
      return username ? `@${username}` : supportLink;
    }
    return supportLink;
  };

  const contactMethods = [
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: lang === 'zh' ? '客服Telegram' : 'Customer Service Telegram',
      description: lang === 'zh' ? '24小时在线服务' : '24/7 Online Service',
      link: supportLink,
      linkText: getLinkText(),
      buttonText: lang === 'zh' ? '联系客服' : 'Contact Support',
    },
  ];

  const supportFeatures = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: lang === 'zh' ? '快速响应' : 'Fast Response',
      description: lang === 'zh' ? '通常在5分钟内回复您的消息' : 'Usually respond within 5 minutes',
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: lang === 'zh' ? '专业支持' : 'Professional Support',
      description: lang === 'zh' ? '专业团队为您解答各类问题' : 'Professional team to answer all your questions',
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: lang === 'zh' ? '多语言支持' : 'Multilingual Support',
      description: lang === 'zh' ? '支持中文和英文沟通' : 'Support in Chinese and English',
    },
  ];

  const commonIssues = [
    {
      title: lang === 'zh' ? '充值未到账' : 'Recharge not credited',
      description: lang === 'zh' 
        ? '请确认转账网络为TRC20，通常3-10分钟到账。超过30分钟请联系客服。'
        : 'Please confirm the transfer network is TRC20. Usually arrives in 3-10 minutes. Contact support if it exceeds 30 minutes.',
    },
    {
      title: lang === 'zh' ? '收不到验证码' : 'Cannot receive verification code',
      description: lang === 'zh'
        ? '尝试更换号码，或确认目标平台是否支持该号码接收验证码。'
        : 'Try changing the number, or confirm if the target platform supports receiving verification codes from this number.',
    },
    {
      title: lang === 'zh' ? '号码已过期' : 'Number expired',
      description: lang === 'zh'
        ? '号码有效期为30分钟，过期后需重新获取新号码。'
        : 'The number is valid for 30 minutes. After expiration, you need to get a new number.',
    },
  ];

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
                {lang === 'zh' ? '联系我们' : 'Contact Us'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Contact Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                {lang === 'zh' ? '联系方式' : 'Contact Methods'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {contactMethods.map((method, index) => (
                  <div 
                    key={index}
                    className="bg-muted/50 rounded-lg p-6 flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                      {method.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{method.title}</h3>
                    <p className="text-muted-foreground mb-3">{method.description}</p>
                    <a 
                      href={method.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium mb-4 flex items-center gap-1 hover:underline"
                    >
                      {method.linkText}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <Button asChild>
                      <a href={method.link} target="_blank" rel="noopener noreferrer">
                        {method.buttonText}
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Features */}
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'zh' ? '服务特点' : 'Service Features'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {supportFeatures.map((feature, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                      {feature.icon}
                    </div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'zh' ? '常见问题快速解答' : 'Quick Answers to Common Issues'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commonIssues.map((issue, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <h4 className="font-semibold mb-2">{issue.title}</h4>
                    <p className="text-muted-foreground text-sm">{issue.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/faq')}
                >
                  {lang === 'zh' ? '查看更多常见问题' : 'View More FAQs'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours Notice */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    {lang === 'zh' ? '服务时间' : 'Service Hours'}
                  </h4>
                  <p className="text-muted-foreground">
                    {lang === 'zh' 
                      ? '我们的客服团队全天24小时在线，随时为您提供帮助。如遇高峰期，回复可能会稍有延迟，请耐心等待。'
                      : 'Our customer service team is online 24/7 to help you. During peak hours, responses may be slightly delayed. Please be patient.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
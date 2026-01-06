import { useLanguage } from '@/contexts/LanguageContext';

/**
 * SEO Content Component - Adds semantic HTML content for search engines
 * This content is visible but styled to integrate with the page design
 */
export const SEOContent = () => {
  const { lang } = useLanguage();
  
  if (lang === 'en') {
    return (
      <section className="bg-card rounded-xl p-6 mt-4 space-y-6">
        <header>
          <h2 className="text-xl font-bold text-foreground mb-3">
            Best SMS Verification Platform 2026 - GlobalSMS
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            GlobalSMS is the most reliable SMS verification platform in 2026, providing virtual phone numbers 
            from over 150 countries to receive SMS verification codes. Whether you need to verify accounts 
            on Telegram, WhatsApp, TikTok, or any other popular application, we've got you covered with 
            99.9% success rate and instant delivery.
          </p>
        </header>
        
        <article>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Why Choose Our SMS Verification Service?
          </h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1.5">
            <li><strong>Global Coverage</strong> - Virtual numbers from 150+ countries including USA, UK, China, Russia, India</li>
            <li><strong>200+ Applications</strong> - Supports Telegram, WhatsApp, Facebook, Instagram, TikTok, and more</li>
            <li><strong>99.9% Success Rate</strong> - Industry-leading reliability for SMS code reception</li>
            <li><strong>Instant Delivery</strong> - Receive verification codes in real-time, no waiting</li>
            <li><strong>Privacy Protection</strong> - One-time numbers, your real phone stays private</li>
            <li><strong>24/7 Support</strong> - Professional customer service available around the clock</li>
          </ul>
        </article>
        
        <article>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            How to Use the SMS Verification Platform?
          </h3>
          <ol className="list-decimal list-inside text-muted-foreground space-y-1.5">
            <li><strong>Register</strong> - Create your free account in seconds</li>
            <li><strong>Recharge</strong> - Add funds via USDT cryptocurrency</li>
            <li><strong>Select Country</strong> - Choose from 150+ countries for your virtual number</li>
            <li><strong>Get Number</strong> - Receive a temporary phone number instantly</li>
            <li><strong>Receive Code</strong> - View SMS verification codes in real-time</li>
          </ol>
        </article>
        
        <article>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Supported Applications for SMS Verification
          </h3>
          <p className="text-muted-foreground">
            Our platform supports 200+ popular applications including: <strong>Telegram</strong>, 
            <strong>WhatsApp</strong>, <strong>WeChat</strong>, <strong>TikTok</strong>, <strong>Douyin</strong>, 
            <strong>Facebook</strong>, <strong>Instagram</strong>, <strong>Twitter/X</strong>, <strong>Google</strong>, 
            <strong>Apple</strong>, <strong>Microsoft</strong>, <strong>Amazon</strong>, <strong>eBay</strong>, 
            <strong>PayPal</strong>, <strong>Binance</strong>, <strong>Discord</strong>, <strong>Steam</strong>, 
            <strong>LinkedIn</strong>, <strong>Snapchat</strong>, <strong>Line</strong>, <strong>Viber</strong>, 
            and many more social media, e-commerce, and financial platforms.
          </p>
        </article>
      </section>
    );
  }
  
  return (
    <section className="bg-card rounded-xl p-6 mt-4 space-y-6">
      <header>
        <h2 className="text-xl font-bold text-foreground mb-3">
          2026年最新接码平台 - 中国+86虚拟手机号短信验证码接收服务
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          GlobalSMS是2026年最好用的接码平台，提供中国+86及全球150+国家虚拟手机号接收短信验证码服务。
          无论您需要注册Telegram、WhatsApp、微信、抖音还是其他热门应用，我们都能为您提供
          99.9%成功率的验证码接收服务，实时到达，安全可靠。支持中国大陆+86手机号接码。
        </p>
      </header>
      
      <article>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          为什么选择我们的接码平台？
        </h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1.5">
          <li><strong>中国+86号码</strong> - 提供中国大陆+86虚拟手机号接码服务，稳定可靠</li>
          <li><strong>全球覆盖</strong> - 支持150+国家虚拟手机号，包括中国、美国、英国、俄罗斯、印度等</li>
          <li><strong>200+应用</strong> - 支持Telegram、WhatsApp、微信、抖音、Facebook、Instagram等热门应用</li>
          <li><strong>99.9%成功率</strong> - 行业领先的验证码接收成功率</li>
          <li><strong>即时到达</strong> - 验证码实时接收，无需等待</li>
          <li><strong>隐私保护</strong> - 一次性号码，保护您的真实手机号</li>
          <li><strong>24/7客服</strong> - 全天候专业客服支持</li>
        </ul>
      </article>
      
      <article>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          接码平台使用流程
        </h3>
        <ol className="list-decimal list-inside text-muted-foreground space-y-1.5">
          <li><strong>注册账号</strong> - 免费创建您的账户</li>
          <li><strong>账户充值</strong> - 使用USDT快速充值</li>
          <li><strong>选择国家</strong> - 从中国+86及150+国家中选择您需要的虚拟号码</li>
          <li><strong>获取号码</strong> - 即时获取临时手机号</li>
          <li><strong>接收验证码</strong> - 实时查看短信验证码</li>
        </ol>
      </article>
      
      <article>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          支持的应用和服务
        </h3>
        <p className="text-muted-foreground">
          我们支持200+热门应用的验证码接收，包括：<strong>Telegram</strong>（电报）、
          <strong>WhatsApp</strong>、<strong>微信</strong>、<strong>抖音</strong>、<strong>TikTok</strong>、
          <strong>Facebook</strong>、<strong>Instagram</strong>、<strong>Twitter/X</strong>、<strong>Google</strong>、
          <strong>Apple</strong>、<strong>Microsoft</strong>、<strong>Amazon</strong>、<strong>淘宝</strong>、
          <strong>支付宝</strong>、<strong>币安</strong>、<strong>Discord</strong>、<strong>Steam</strong>、
          <strong>LinkedIn</strong>、<strong>Snapchat</strong>、<strong>Line</strong>、<strong>小红书</strong>
          等社交媒体、电商和金融平台。
        </p>
      </article>
      
      <article>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          接码平台常见问题
        </h3>
        <div className="space-y-3 text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground">什么是接码平台？</h4>
            <p>接码平台是提供虚拟手机号接收短信验证码的在线服务。用户可以使用临时号码接收各类应用的验证码，无需暴露真实手机号。</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground">接码平台安全吗？</h4>
            <p>我们采用SSL加密、数据加密存储、一次性号码机制，确保用户隐私安全。号码使用后自动释放。</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground">如何充值？</h4>
            <p>支持USDT（TRC20网络）充值，即时到账，安全便捷。</p>
          </div>
        </div>
      </article>
    </section>
  );
};

export default SEOContent;

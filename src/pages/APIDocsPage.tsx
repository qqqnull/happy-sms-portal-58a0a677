import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, ShieldCheck, List, Code, AlertTriangle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  titleEn: string;
}

const navItems: NavItem[] = [
  { id: 'introduction', icon: <Book className="h-4 w-4" />, title: '接口介绍', titleEn: 'Introduction' },
  { id: 'authentication', icon: <ShieldCheck className="h-4 w-4" />, title: '认证方式', titleEn: 'Authentication' },
  { id: 'endpoints', icon: <List className="h-4 w-4" />, title: '接口列表', titleEn: 'Endpoints' },
  { id: 'examples', icon: <Code className="h-4 w-4" />, title: '示例代码', titleEn: 'Examples' },
  { id: 'errors', icon: <AlertTriangle className="h-4 w-4" />, title: '错误处理', titleEn: 'Errors' },
];

const endpoints = [
  { path: '/api/countries', method: 'GET', methodColor: 'bg-green-500', desc: '获取支持的国家列表', descEn: 'Get supported countries list' },
  { path: '/api/services/{country_id}', method: 'GET', methodColor: 'bg-green-500', desc: '获取指定国家的服务列表', descEn: 'Get services for a specific country' },
  { path: '/api/get_number', method: 'POST', methodColor: 'bg-blue-500', desc: '获取接码号码', descEn: 'Get SMS verification number' },
  { path: '/api/verify_code', method: 'POST', methodColor: 'bg-blue-500', desc: '验证收到的验证码', descEn: 'Verify received code' },
];

const errors = [
  { code: 'AUTH_FAILED', desc: '认证失败', descEn: 'Authentication failed', solution: '检查API密钥是否正确', solutionEn: 'Check if API key is correct' },
  { code: 'INVALID_PARAMS', desc: '参数错误', descEn: 'Invalid parameters', solution: '检查请求参数是否完整且格式正确', solutionEn: 'Check if request parameters are complete and formatted correctly' },
  { code: 'INSUFFICIENT_BALANCE', desc: '余额不足', descEn: 'Insufficient balance', solution: '请充值后再试', solutionEn: 'Please recharge and try again' },
  { code: 'SERVICE_UNAVAILABLE', desc: '服务暂时不可用', descEn: 'Service temporarily unavailable', solution: '请稍后重试或联系客服', solutionEn: 'Please try again later or contact support' },
];

const pythonCode = `import requests

api_key = 'your-api-key'
headers = {'Authorization': f'Bearer {api_key}'}

# 获取国家列表
response = requests.get('https://api.example.com/countries', headers=headers)
countries = response.json()

# 获取服务列表
country_id = 1  # 例如：中国
response = requests.get(f'https://api.example.com/services/{country_id}', headers=headers)
services = response.json()

# 获取号码
data = {
    'country_id': country_id,
    'service_id': 1  # 例如：WhatsApp
}
response = requests.post('https://api.example.com/get_number', headers=headers, json=data)
number = response.json()`;

const javascriptCode = `const apiKey = 'your-api-key';
const headers = {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
};

// 获取国家列表
fetch('https://api.example.com/countries', { headers })
    .then(response => response.json())
    .then(countries => console.log(countries));

// 获取服务列表
const countryId = 1;
fetch(\`https://api.example.com/services/\${countryId}\`, { headers })
    .then(response => response.json())
    .then(services => console.log(services));

// 获取号码
fetch('https://api.example.com/get_number', {
    method: 'POST',
    headers,
    body: JSON.stringify({
        country_id: countryId,
        service_id: 1
    })
})
    .then(response => response.json())
    .then(number => console.log(number));`;

const APIDocsPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('introduction');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toast({
      title: lang === 'zh' ? '已复制' : 'Copied',
      description: lang === 'zh' ? '代码已复制到剪贴板' : 'Code copied to clipboard',
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
                {lang === 'zh' ? 'API接口文档' : 'API Documentation'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  {lang === 'zh' ? 'API文档导航' : 'API Navigation'}
                </h3>
                <div className="space-y-1">
                  {navItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {item.icon}
                      <span>{lang === 'zh' ? item.title : item.titleEn}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Introduction */}
            {activeSection === 'introduction' && (
              <Card>
                <CardHeader>
                  <CardTitle>{lang === 'zh' ? 'API接口介绍' : 'API Introduction'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {lang === 'zh' 
                      ? '我们提供功能强大的RESTful API，支持企业级应用对接。通过我们的API，您可以轻松实现：'
                      : 'We provide a powerful RESTful API for enterprise-level integration. Through our API, you can easily achieve:'}
                  </p>
                  <ul className="space-y-3">
                    {[
                      { zh: '获取支持的国家和地区列表', en: 'Get list of supported countries and regions' },
                      { zh: '查询可用的接码服务', en: 'Query available SMS verification services' },
                      { zh: '获取临时接码号码', en: 'Get temporary verification numbers' },
                      { zh: '接收和验证短信验证码', en: 'Receive and verify SMS codes' },
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{lang === 'zh' ? item.zh : item.en}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Authentication */}
            {activeSection === 'authentication' && (
              <Card>
                <CardHeader>
                  <CardTitle>{lang === 'zh' ? '认证方式' : 'Authentication'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <ShieldCheck className="h-4 w-4" />
                      {lang === 'zh' ? 'API密钥认证' : 'API Key Authentication'}
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400 mt-2">
                      {lang === 'zh' 
                        ? '所有API请求都需要在Header中包含您的API密钥：'
                        : 'All API requests require your API key in the Header:'}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <code>Authorization: Bearer your-api-key-here</code>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Endpoints */}
            {activeSection === 'endpoints' && (
              <Card>
                <CardHeader>
                  <CardTitle>{lang === 'zh' ? '接口列表' : 'Endpoints'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">{lang === 'zh' ? '接口路径' : 'Endpoint'}</th>
                          <th className="text-left py-3 px-4">{lang === 'zh' ? '方法' : 'Method'}</th>
                          <th className="text-left py-3 px-4">{lang === 'zh' ? '描述' : 'Description'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoints.map((endpoint, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4">
                              <code className="bg-muted px-2 py-1 rounded text-sm">{endpoint.path}</code>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`${endpoint.methodColor} text-white`}>
                                {endpoint.method}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {lang === 'zh' ? endpoint.desc : endpoint.descEn}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Examples */}
            {activeSection === 'examples' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Python {lang === 'zh' ? '示例' : 'Example'}
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(pythonCode, 'python')}
                    >
                      {copiedCode === 'python' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
                      <code>{pythonCode}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      JavaScript {lang === 'zh' ? '示例' : 'Example'}
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(javascriptCode, 'javascript')}
                    >
                      {copiedCode === 'javascript' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
                      <code>{javascriptCode}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Errors */}
            {activeSection === 'errors' && (
              <Card>
                <CardHeader>
                  <CardTitle>{lang === 'zh' ? '错误处理' : 'Error Handling'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                      <AlertTriangle className="h-4 w-4" />
                      {lang === 'zh' ? '错误响应格式' : 'Error Response Format'}
                    </h4>
                    <p className="text-yellow-600 dark:text-yellow-400 mt-2">
                      {lang === 'zh' 
                        ? '当API请求失败时，将返回以下格式的错误信息：'
                        : 'When an API request fails, the following error format will be returned:'}
                    </p>
                  </div>
                  
                  <pre className="bg-muted rounded-lg p-4 mb-6 text-sm">
                    <code>{`{
    "status": "error",
    "code": "ERROR_CODE",
    "message": "${lang === 'zh' ? '错误描述信息' : 'Error description'}"
}`}</code>
                  </pre>

                  <h4 className="font-semibold mb-4">{lang === 'zh' ? '常见错误代码' : 'Common Error Codes'}</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">{lang === 'zh' ? '错误代码' : 'Error Code'}</th>
                          <th className="text-left py-3 px-4">{lang === 'zh' ? '描述' : 'Description'}</th>
                          <th className="text-left py-3 px-4">{lang === 'zh' ? '解决方案' : 'Solution'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errors.map((error, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4">
                              <code className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded text-sm">
                                {error.code}
                              </code>
                            </td>
                            <td className="py-3 px-4">
                              {lang === 'zh' ? error.desc : error.descEn}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {lang === 'zh' ? error.solution : error.solutionEn}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocsPage;

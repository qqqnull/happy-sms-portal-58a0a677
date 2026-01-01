import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Key, Clock, Code, Eye, EyeOff,
  User, ListChecks, Check, Copy, RefreshCw, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/layout/MainLayout';

type SecuritySection = 'change-password' | 'login-history' | 'api-key';

const AccountSecurityPage = () => {
  const [activeSection, setActiveSection] = useState<SecuritySection>('change-password');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Generate a mock API key based on user id
    if (user) {
      const mockApiKey = `sk_live_${user.id.replace(/-/g, '').substring(0, 24)}`;
      setApiKey(mockApiKey);
    }
  }, [user, navigate]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: '密码不匹配',
        description: '新密码和确认密码不一致',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: '密码太短',
        description: '密码必须至少包含8个字符',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: '密码已更新',
        description: '您的密码已成功更新',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({
        title: '更新失败',
        description: err.message || '密码更新失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast({
        title: '复制成功',
        description: 'API密钥已复制到剪贴板',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: '复制失败',
        description: '请手动复制',
        variant: 'destructive',
      });
    }
  };

  const regenerateApiKey = () => {
    const newApiKey = `sk_live_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newApiKey);
    toast({
      title: '密钥已重置',
      description: '新的API密钥已生成',
    });
  };

  // Mock login history
  const loginHistory = [
    { date: '2026-01-01 16:13:15', ip: '103.219.192.84', device: 'Windows Chrome', location: '中国', status: 'normal' },
    { date: '2026-01-01 14:00:44', ip: '103.219.192.85', device: 'Windows Chrome', location: '中国', status: 'normal' },
    { date: '2025-12-30 10:00:10', ip: '103.219.192.84', device: 'Windows Chrome', location: '中国', status: 'warning' },
    { date: '2025-12-30 09:03:08', ip: '103.219.192.84', device: 'Windows Chrome', location: '中国', status: 'normal' },
    { date: '2025-12-29 23:36:28', ip: '124.163.188.17', device: 'iPhone Safari', location: '中国', status: 'warning' },
  ];

  return (
    <MainLayout showSidebar={false}>
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 px-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  安全中心
                </h4>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveSection('change-password')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      activeSection === 'change-password' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Key className="h-4 w-4" />
                    <span>修改密码</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('login-history')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      activeSection === 'login-history' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>登录记录</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('api-key')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      activeSection === 'api-key' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Code className="h-4 w-4" />
                    <span>API密钥管理</span>
                  </button>
                </nav>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 px-2">用户导航</h4>
                <nav className="space-y-1">
                  <Link
                    to="/user-center"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ListChecks className="h-4 w-4" />
                    <span>控制面板</span>
                  </Link>
                  <Link
                    to="/history"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Clock className="h-4 w-4" />
                    <span>历史记录</span>
                  </Link>
                  <Link
                    to="/account-security"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground"
                  >
                    <Shield className="h-4 w-4" />
                    <span>账户安全</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Security Overview */}
            <Card className="border-0 shadow-md mb-6">
              <CardHeader>
                <CardTitle className="text-xl">账户安全</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold">安全状态</h3>
                    <p className="text-sm text-muted-foreground">您的账户安全状态良好</p>
                  </div>
                </div>
                <Progress value={80} className="h-2.5" />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>安全得分：80分</span>
                  <span>推荐：定期修改密码以提高安全性</span>
                </div>
              </CardContent>
            </Card>

            {/* Change Password Section */}
            {activeSection === 'change-password' && (
              <Card className="border-0 shadow-md border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">修改密码</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <Label htmlFor="currentPassword">当前密码</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">新密码</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">密码必须至少包含8个字符，并包含字母和数字</p>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">确认新密码</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      更新密码
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Login History Section */}
            {activeSection === 'login-history' && (
              <Card className="border-0 shadow-md border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">登录记录</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">登录时间</th>
                          <th className="text-left py-3 px-4 font-medium">IP地址</th>
                          <th className="text-left py-3 px-4 font-medium">设备</th>
                          <th className="text-left py-3 px-4 font-medium">位置</th>
                          <th className="text-left py-3 px-4 font-medium">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginHistory.map((log, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 px-4 text-sm">{log.date}</td>
                            <td className="py-3 px-4 text-sm font-mono">{log.ip}</td>
                            <td className="py-3 px-4 text-sm">{log.device}</td>
                            <td className="py-3 px-4 text-sm">{log.location}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 text-sm ${
                                log.status === 'warning' ? 'text-warning' : 'text-success'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                  log.status === 'warning' ? 'bg-warning' : 'bg-success'
                                }`}></span>
                                {log.status === 'warning' ? '异地登录' : '正常'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Key Section */}
            {activeSection === 'api-key' && (
              <Card className="border-0 shadow-md border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">API密钥管理</h3>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-4 rounded-lg flex items-start gap-3 mb-6">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <p className="text-sm">
                      API密钥用于开发者访问GlobalSMS的API接口。请妥善保管您的密钥，不要分享给他人。
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>您的API密钥</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          value={apiKey}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="icon" onClick={copyApiKey}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={regenerateApiKey}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        重新生成
                      </Button>
                      <Link to="/api-docs">
                        <Button variant="outline">
                          <Code className="h-4 w-4 mr-2" />
                          查看API文档
                        </Button>
                      </Link>
                    </div>

                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">使用说明</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>在请求头中添加 <code className="bg-muted px-1 py-0.5 rounded">Authorization: Bearer YOUR_API_KEY</code></li>
                        <li>API密钥具有完整的账户访问权限，请妥善保管</li>
                        <li>如果密钥泄露，请立即重新生成</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountSecurityPage;

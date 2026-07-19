import { useState, useEffect } from 'react';
import { Save, RefreshCw, Settings, MessageCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';

const DEFAULT_SUPPORT_LINK = 'https://t.me/support';
const DEFAULT_PAYMENT_DOMAIN = 'payusdt.shop';
const PAYMENT_PLATFORM = '2026sms';

interface AppSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [supportLink, setSupportLink] = useState(DEFAULT_SUPPORT_LINK);
  const [savingSupport, setSavingSupport] = useState(false);
  const [paymentDomain, setPaymentDomain] = useState(DEFAULT_PAYMENT_DOMAIN);
  const [savingDomain, setSavingDomain] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings' as any)
        .select('*')
        .order('key') as { data: AppSetting[] | null; error: any };

      if (error) {
        toast.error('加载设置失败');
      } else if (data) {
        setSettings(data);
        const support = data.find((s) => s.key === 'support_link');
        if (support) setSupportLink(support.value);
        const dom = data.find((s) => s.key === 'payment_domain');
        if (dom) setPaymentDomain(dom.value);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveSupportLink = async () => {
    if (!supportLink.trim()) return toast.error('请输入客服链接');
    try {
      new URL(supportLink);
    } catch {
      return toast.error('请输入有效的URL地址');
    }
    setSavingSupport(true);
    const { error } = await supabase
      .from('app_settings' as any)
      .upsert({ key: 'support_link', value: supportLink, description: '客服链接' }, { onConflict: 'key' }) as { error: any };
    if (error) toast.error('保存失败');
    else {
      toast.success('客服链接已保存');
      fetchSettings();
    }
    setSavingSupport(false);
  };

  const handleSaveDomain = async () => {
    const cleaned = paymentDomain.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    if (!cleaned) return toast.error('请输入支付跳转域名');
    setSavingDomain(true);
    const { error } = await supabase
      .from('app_settings' as any)
      .upsert(
        { key: 'payment_domain', value: cleaned, description: 'USDT 支付跳转目标域名（无需 https://）' },
        { onConflict: 'key' }
      ) as { error: any };
    if (error) toast.error('保存失败');
    else {
      setPaymentDomain(cleaned);
      toast.success('已保存');
      fetchSettings();
    }
    setSavingDomain(false);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">系统设置</h1>
          </div>
          <Button variant="outline" size="icon" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Payment Domain */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>支付跳转域名</CardTitle>
                </div>
                <CardDescription>
                  设置 USDT 支付跳转的目标域名（无需包含 https://），platform 参数固定为 <code>{PAYMENT_PLATFORM}</code>。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_domain">支付域名</Label>
                  <div className="flex gap-2">
                    <Input
                      id="payment_domain"
                      placeholder={DEFAULT_PAYMENT_DOMAIN}
                      value={paymentDomain}
                      onChange={(e) => setPaymentDomain(e.target.value)}
                      className="font-mono"
                    />
                    <Button onClick={handleSaveDomain} disabled={savingDomain}>
                      <Save className="h-4 w-4 mr-2" />
                      {savingDomain ? '保存中...' : '保存'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    跳转示例：https://{paymentDomain || DEFAULT_PAYMENT_DOMAIN}/?platform={PAYMENT_PLATFORM}&amp;order_id=xxx&amp;amount=10
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Support Link Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <CardTitle>客服链接设置</CardTitle>
                </div>
                <CardDescription>设置所有页面的客服联系链接</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="support_link">客服链接</Label>
                  <div className="flex gap-2">
                    <Input
                      id="support_link"
                      placeholder="https://t.me/your_support"
                      value={supportLink}
                      onChange={(e) => setSupportLink(e.target.value)}
                      className="font-mono"
                    />
                    <Button onClick={handleSaveSupportLink} disabled={savingSupport}>
                      <Save className="h-4 w-4 mr-2" />
                      {savingSupport ? '保存中...' : '保存'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current settings summary */}
            <Card>
              <CardHeader>
                <CardTitle>当前配置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 grid gap-2 text-sm">
                  {settings.length === 0 && <span className="text-muted-foreground">暂无配置</span>}
                  {settings.map((s) => (
                    <div key={s.id} className="flex justify-between items-center gap-4">
                      <span className="text-muted-foreground">{s.description || s.key}:</span>
                      <span className="font-mono text-xs bg-background px-2 py-1 rounded break-all">
                        {s.value.length > 40 ? `${s.value.slice(0, 20)}...${s.value.slice(-10)}` : s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;

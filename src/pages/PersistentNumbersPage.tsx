import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, RefreshCw, Trash2, CheckCircle, AlertTriangle, Clock, ArrowLeft, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

interface PersistentNumber {
  id: string;
  phone_number: string;
  country_code: string;
  monthly_fee: number;
  status: string;
  current_period_end: string;
  next_billing_at: string;
  used_this_period: boolean;
  grace_period_end: string | null;
  created_at: string;
}

const PersistentNumbersPage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<PersistentNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('persistent_numbers')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'expired')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: '加载失败', description: error.message, variant: 'destructive' });
    } else {
      setItems((data as PersistentNumber[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    load();
  }, [user]);

  const handleRenew = async (id: string) => {
    setActionId(id);
    const { data, error } = await supabase.rpc('renew_persistent_number', { _persistent_id: id });
    setActionId(null);
    const result = data as { success: boolean; error?: string } | null;
    if (error || !result?.success) {
      const msg = result?.error === 'insufficient_balance' ? '余额不足，请先充值' : (error?.message || '续费失败');
      toast({ title: '续费失败', description: msg, variant: 'destructive' });
      return;
    }
    toast({ title: '续费成功', description: '号码已续期 30 天' });
    await refreshProfile();
    await load();
  };

  const handleRelease = async (id: string) => {
    setActionId(id);
    const { data, error } = await supabase.rpc('release_persistent_number', { _persistent_id: id });
    setActionId(null);
    const result = data as { success: boolean; error?: string } | null;
    if (error || !result?.success) {
      toast({ title: '释放失败', description: error?.message || result?.error || '请稍后重试', variant: 'destructive' });
      return;
    }
    toast({ title: '已释放', description: '号码已返回公共池' });
    await load();
  };

  const useForSms = (n: PersistentNumber) => {
    // navigate to home; user picks service for this country. Phone selection skipped — passes hint.
    navigate(`/?persistentPhone=${encodeURIComponent(n.phone_number)}&country=${encodeURIComponent(n.country_code)}`);
  };

  const statusBadge = (n: PersistentNumber) => {
    if (n.status === 'grace_period') {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />宽限期</Badge>;
    }
    return <Badge className="gap-1 bg-success/10 text-success border border-success/20"><CheckCircle className="h-3 w-3" />正常</Badge>;
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/user-center')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">我的长期号码</h1>
              <p className="text-sm text-muted-foreground">永久持有，按月续费，本月使用过自动免费续期</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {/* Info banner */}
        <Card className="mb-6 border-l-4 border-l-primary">
          <CardContent className="pt-6 text-sm text-muted-foreground space-y-1">
            <p>• <strong className="text-foreground">免费续期：</strong>当月有任意一次成功接码，下月自动免费续期。</p>
            <p>• <strong className="text-foreground">付费续期：</strong>当月未使用则月初自动从余额扣除月租。</p>
            <p>• <strong className="text-foreground">宽限期：</strong>余额不足时进入 7 天宽限期，期间可手动续费；超时号码释放。</p>
            <p>• <strong className="text-foreground">跨服务接码：</strong>该号码用于其他服务时按当前实时价格收费。</p>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12"><RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground mb-4">您还没有长期号码</p>
              <Link to="/" className="text-primary underline">去接码并锁定为长期号码</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {items.map((n) => (
              <Card key={n.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <Phone className="h-5 w-5 text-primary" />
                      <span className="font-mono">{n.phone_number}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(n.phone_number); toast({ title: '已复制' }); }}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </CardTitle>
                    {statusBadge(n)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <div className="text-muted-foreground text-xs">月租</div>
                      <div className="font-bold text-primary">${Number(n.monthly_fee).toFixed(2)}/月</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">本月使用</div>
                      <div className="font-medium">{n.used_this_period ? '✓ 已使用（下月免费）' : '未使用'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">下次扣费</div>
                      <div className="font-medium flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(n.next_billing_at).toLocaleDateString('zh-CN')}</div>
                    </div>
                    {n.status === 'grace_period' && n.grace_period_end && (
                      <div>
                        <div className="text-muted-foreground text-xs">宽限期截止</div>
                        <div className="font-medium text-destructive">{new Date(n.grace_period_end).toLocaleDateString('zh-CN')}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    <Button size="sm" onClick={() => useForSms(n)} disabled={n.status === 'grace_period'}>
                      <Phone className="h-4 w-4 mr-2" />使用接码
                    </Button>
                    {n.status === 'grace_period' && (
                      <Button size="sm" variant="default" onClick={() => handleRenew(n.id)} disabled={actionId === n.id}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${actionId === n.id ? 'animate-spin' : ''}`} />
                        立即续费 (${Number(n.monthly_fee).toFixed(2)})
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />取消订阅
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认取消订阅？</AlertDialogTitle>
                          <AlertDialogDescription>
                            释放后该号码会返回公共池，您将失去对它的长期持有权，无法恢复。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRelease(n.id)}>确认释放</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PersistentNumbersPage;
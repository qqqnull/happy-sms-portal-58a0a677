import { useEffect, useState } from 'react';
import { Phone, RefreshCw, Trash2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Row {
  id: string;
  phone_number: string;
  country_code: string;
  monthly_fee: number;
  status: string;
  user_id: string;
  current_period_end: string;
  next_billing_at: string;
  used_this_period: boolean;
  grace_period_end: string | null;
  created_at: string;
  profile?: { username: string } | null;
}

const AdminPersistentNumbers = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('persistent_numbers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: '加载失败', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    const list = (data as Row[]) || [];
    // fetch usernames
    const ids = [...new Set(list.map((r) => r.user_id))];
    if (ids.length) {
      const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', ids);
      const map = new Map((profiles || []).map((p) => [p.id, p.username]));
      list.forEach((r) => { r.profile = { username: map.get(r.user_id) || '-' }; });
    }
    setRows(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const release = async (id: string) => {
    const { data, error } = await supabase.rpc('release_persistent_number', { _persistent_id: id });
    const result = data as { success: boolean; error?: string } | null;
    if (error || !result?.success) {
      toast({ title: '释放失败', description: error?.message || result?.error, variant: 'destructive' });
      return;
    }
    toast({ title: '已释放' });
    load();
  };

  const runRenewal = async () => {
    const { data, error } = await supabase.rpc('process_persistent_renewals');
    if (error) { toast({ title: '执行失败', description: error.message, variant: 'destructive' }); return; }
    toast({ title: '处理完成', description: JSON.stringify(data) });
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Phone className="h-6 w-6" />长期号码管理</h1>
            <p className="text-sm text-muted-foreground mt-1">查看所有用户的长期号码订阅与状态</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />刷新
            </Button>
            <Button onClick={runRenewal}>手动执行续费任务</Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>号码</TableHead>
                <TableHead>国家</TableHead>
                <TableHead>月租</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>本月使用</TableHead>
                <TableHead>下次扣费</TableHead>
                <TableHead>宽限期</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.profile?.username || '-'}</TableCell>
                  <TableCell className="font-mono">{r.phone_number}</TableCell>
                  <TableCell>{r.country_code}</TableCell>
                  <TableCell>${Number(r.monthly_fee).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'active' ? 'default' : r.status === 'grace_period' ? 'destructive' : 'secondary'}>
                      {r.status === 'active' ? '正常' : r.status === 'grace_period' ? '宽限期' : '已过期'}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.used_this_period ? '是' : '否'}</TableCell>
                  <TableCell>{new Date(r.next_billing_at).toLocaleDateString('zh-CN')}</TableCell>
                  <TableCell>{r.grace_period_end ? new Date(r.grace_period_end).toLocaleDateString('zh-CN') : '-'}</TableCell>
                  <TableCell>
                    {r.status !== 'expired' && (
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => release(r.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />释放
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPersistentNumbers;
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Trash2, Plus, Shield, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface BlacklistEntry {
  id: string;
  wallet_address: string;
  reason: string | null;
  created_at: string;
}

const AdminWalletBlacklist = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState('');
  const [newReason, setNewReason] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_blacklist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlacklist(data || []);
    } catch (error) {
      console.error('Error fetching blacklist:', error);
      toast.error('获取黑名单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      toast.error('请输入钱包地址');
      return;
    }

    // Basic TRON address validation (starts with T and is 34 characters)
    if (!newAddress.startsWith('T') || newAddress.length !== 34) {
      toast.error('请输入有效的TRON钱包地址');
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from('wallet_blacklist')
        .insert({
          wallet_address: newAddress.trim(),
          reason: newReason.trim() || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('该地址已在黑名单中');
        } else {
          throw error;
        }
        return;
      }

      toast.success('地址已添加到黑名单');
      setNewAddress('');
      setNewReason('');
      fetchBlacklist();
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      toast.error('添加失败');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAddress = async (id: string, address: string) => {
    if (!confirm(`确定要将 ${address} 从黑名单中移除吗？`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('wallet_blacklist')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('地址已从黑名单移除');
      fetchBlacklist();
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      toast.error('移除失败');
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              钱包黑名单管理
            </h1>
            <p className="text-muted-foreground">管理禁止连接的钱包地址</p>
          </div>
        </div>

        {/* Add new address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">添加黑名单地址</CardTitle>
            <CardDescription>
              被加入黑名单的钱包地址将无法连接到本网站
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">钱包地址</label>
                <Input
                  placeholder="输入TRON钱包地址 (以T开头)"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">原因 (可选)</label>
                <Input
                  placeholder="添加原因说明"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddAddress} disabled={adding}>
              <Plus className="h-4 w-4 mr-2" />
              {adding ? '添加中...' : '添加到黑名单'}
            </Button>
          </CardContent>
        </Card>

        {/* Blacklist table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">黑名单列表</CardTitle>
            <CardDescription>
              共 {blacklist.length} 个地址
            </CardDescription>
          </CardHeader>
          <CardContent>
            {blacklist.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无黑名单地址
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>钱包地址</TableHead>
                    <TableHead>原因</TableHead>
                    <TableHead>添加时间</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blacklist.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-sm">
                        {entry.wallet_address}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.reason || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveAddress(entry.id, entry.wallet_address)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminWalletBlacklist;

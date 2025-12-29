import { useState, useEffect } from 'react';
import { Search, Shield, User, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';

interface UserProfile {
  id: string;
  username: string;
  balance: number;
  created_at: string;
  updated_at: string;
  role?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      toast.error('加载用户失败');
      setLoading(false);
      return;
    }

    // Fetch roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

    const usersWithRoles = profiles?.map(profile => ({
      ...profile,
      balance: Number(profile.balance),
      role: rolesMap.get(profile.id) || 'user',
    })) || [];

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openBalanceDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setBalanceAmount('');
    setBalanceDialogOpen(true);
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !balanceAmount) return;

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount)) {
      toast.error('请输入有效金额');
      return;
    }

    const newBalance = selectedUser.balance + amount;
    if (newBalance < 0) {
      toast.error('余额不能为负数');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', selectedUser.id);

    if (error) {
      toast.error('更新余额失败');
    } else {
      toast.success('余额更新成功');
      setBalanceDialogOpen(false);
      fetchUsers();
    }
  };

  const toggleAdminRole = async (user: UserProfile) => {
    if (user.role === 'admin') {
      // Remove admin role
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'user' })
        .eq('user_id', user.id);

      if (error) {
        toast.error('更新角色失败');
      } else {
        toast.success('已移除管理员权限');
        fetchUsers();
      }
    } else {
      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id,role' });

      if (error) {
        toast.error('更新角色失败');
      } else {
        toast.success('已设为管理员');
        fetchUsers();
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">用户管理</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户名</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>余额</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            管理员
                          </span>
                        ) : '用户'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-accent">${user.balance.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBalanceDialog(user)}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          调整余额
                        </Button>
                        <Button
                          variant={user.role === 'admin' ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => toggleAdminRole(user)}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          {user.role === 'admin' ? '移除管理员' : '设为管理员'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Balance Dialog */}
        <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>调整余额</DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">用户</div>
                  <div className="font-medium">{selectedUser.username}</div>
                  <div className="text-sm text-muted-foreground mt-2">当前余额</div>
                  <div className="font-bold text-accent">${selectedUser.balance.toFixed(2)}</div>
                </div>

                <div>
                  <Label>调整金额 (正数增加，负数扣除)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="例: 10 或 -5"
                  />
                </div>

                {balanceAmount && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">调整后余额</div>
                    <div className="font-bold text-success">
                      ${(selectedUser.balance + (parseFloat(balanceAmount) || 0)).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setBalanceDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleUpdateBalance}>
                确认调整
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;

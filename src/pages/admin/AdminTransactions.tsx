import { useState, useEffect } from 'react';
import { Search, RefreshCw, CheckCircle, XCircle, Clock, Wallet, ExternalLink } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  payment_method: string | null;
  wallet_address: string | null;
  tx_hash: string | null;
  order_id: string;
  created_at: string;
  completed_at: string | null;
  profile: {
    username: string;
    id: string;
  };
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        profile:profiles(id, username)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('加载交易失败');
    } else if (data) {
      setTransactions(data.map(t => ({
        ...t,
        amount: Number(t.amount),
      })));
    }
    setLoading(false);
  };

  const updateTransactionStatus = async (transaction: Transaction, newStatus: string) => {
    // Update transaction status
    const { error: txError } = await supabase
      .from('transactions')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', transaction.id);

    if (txError) {
      toast.error('更新交易状态失败');
      return;
    }

    // If completed, update user balance
    if (newStatus === 'completed' && transaction.type === 'deposit') {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', transaction.profile.id)
        .single();

      if (!profileError && profile) {
        const newBalance = Number(profile.balance) + transaction.amount;
        await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', transaction.profile.id);
      }
    }

    toast.success('交易状态更新成功');
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.order_id.includes(searchQuery) ||
      tx.tx_hash?.includes(searchQuery) ||
      tx.wallet_address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'outline';
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'processing': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'failed': return <XCircle className="h-3 w-3" />;
      case 'processing': return <Clock className="h-3 w-3 animate-spin" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const statusLabels: Record<string, string> = {
    pending: '待确认',
    completed: '已完成',
    failed: '失败',
    processing: '处理中',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string | null) => {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openTronScan = (address: string) => {
    window.open(`https://tronscan.org/#/address/${address}`, '_blank');
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">交易管理</h1>
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="pending">待确认</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户/订单号/钱包..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchTransactions}>
              <RefreshCw className="h-4 w-4" />
            </Button>
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
                  <TableHead>用户</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>钱包地址</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTx(tx)}>
                    <TableCell className="font-medium">
                      {tx.profile?.username || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {tx.type === 'deposit' ? '充值' : tx.type === 'recharge' ? '充值' : tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-success">
                        +${tx.amount.toFixed(2)} {tx.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      {tx.wallet_address ? (
                        <button 
                          className="flex items-center gap-1 text-primary hover:underline font-mono text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTronScan(tx.wallet_address!);
                          }}
                        >
                          <Wallet className="h-3 w-3" />
                          {formatAddress(tx.wallet_address)}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate">
                      {tx.order_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(tx.status || 'pending')}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(tx.status || 'pending')}
                          {statusLabels[tx.status || 'pending'] || tx.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(tx.created_at)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {(tx.status === 'pending' || tx.status === 'processing') && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-success border-success hover:bg-success/10"
                            onClick={() => updateTransactionStatus(tx, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            确认
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => updateTransactionStatus(tx, 'failed')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            拒绝
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Transaction Detail Modal */}
        <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>交易详情</DialogTitle>
            </DialogHeader>
            {selectedTx && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">订单号</div>
                    <div className="font-mono text-sm">{selectedTx.order_id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">状态</div>
                    <Badge variant={getStatusVariant(selectedTx.status || 'pending')}>
                      {statusLabels[selectedTx.status || 'pending']}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">用户</div>
                    <div>{selectedTx.profile?.username || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">金额</div>
                    <div className="font-medium text-success">
                      ${selectedTx.amount.toFixed(2)} {selectedTx.currency}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">支付方式</div>
                    <div>{selectedTx.payment_method || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">创建时间</div>
                    <div className="text-sm">{new Date(selectedTx.created_at).toLocaleString('zh-CN')}</div>
                  </div>
                </div>
                
                {selectedTx.wallet_address && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">钱包地址</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs flex-1 break-all">{selectedTx.wallet_address}</code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openTronScan(selectedTx.wallet_address!)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        查看
                      </Button>
                    </div>
                  </div>
                )}
                
                {selectedTx.tx_hash && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">交易哈希</div>
                    <code className="text-xs break-all">{selectedTx.tx_hash}</code>
                  </div>
                )}

                {(selectedTx.status === 'pending' || selectedTx.status === 'processing') && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        updateTransactionStatus(selectedTx, 'completed');
                        setSelectedTx(null);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      确认完成
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        updateTransactionStatus(selectedTx, 'failed');
                        setSelectedTx(null);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      标记失败
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTransactions;

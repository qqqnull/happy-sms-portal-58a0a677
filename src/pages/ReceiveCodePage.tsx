import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Copy, RefreshCw, Timer, Phone, 
  MessageSquare, Clock, AlertTriangle, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SmsMessage {
  id: number;
  time: string;
  sender: string;
  content: string;
}

const ReceiveCodePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { lang } = useLanguage();
  
  const countryCode = searchParams.get('country') || '';
  const countryName = searchParams.get('countryName') || '';
  const serviceName = searchParams.get('service') || '';
  const serviceId = searchParams.get('serviceId') || '';
  const price = parseFloat(searchParams.get('price') || '0');
  
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [phoneNumberId, setPhoneNumberId] = useState<string | null>(null);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingNumber, setIsChangingNumber] = useState(false);
  const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 获取手机号
  const fetchPhoneNumber = useCallback(async () => {
    if (!user || !countryCode) return;
    
    setIsLoading(true);
    
    try {
      // 首先检查用户是否已经有锁定的号码
      const { data: existingLock, error: lockError } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('country_code', countryCode)
        .eq('locked_by', user.id)
        .gt('locked_until', new Date().toISOString())
        .limit(1)
        .maybeSingle();
      
      if (lockError) throw lockError;
      
      // 如果已有锁定的号码，使用现有号码并计算剩余时间
      if (existingLock) {
        const lockedUntil = new Date(existingLock.locked_until!).getTime();
        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.floor((lockedUntil - now) / 1000));
        
        setPhoneNumber(existingLock.phone_number);
        setPhoneNumberId(existingLock.id);
        setLockTimeLeft(remainingSeconds);
        setIsLoading(false);
        return;
      }
      
      // 没有现有锁定，获取新号码
      const { data: phone, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('country_code', countryCode)
        .eq('is_available', true)
        .is('locked_by', null)
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!phone) {
        toast({
          title: lang === 'zh' ? '暂无可用号码' : 'No Available Numbers',
          description: lang === 'zh' ? '该国家暂时没有可用的手机号' : 'No phone numbers available for this country',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }
      
      // 锁定号码30分钟
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const { error: updateError } = await supabase
        .from('phone_numbers')
        .update({
          locked_by: user.id,
          locked_until: lockUntil,
          is_available: false,
        })
        .eq('id', phone.id);
      
      if (updateError) throw updateError;
      
      setPhoneNumber(phone.phone_number);
      setPhoneNumberId(phone.id);
      setLockTimeLeft(30 * 60);
    } catch (error) {
      console.error('Error fetching phone number:', error);
      toast({
        title: lang === 'zh' ? '获取号码失败' : 'Failed to Get Number',
        description: lang === 'zh' ? '请稍后重试' : 'Please try again later',
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }, [user, countryCode, lang, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPhoneNumber();
  }, [user, fetchPhoneNumber, navigate]);

  // 倒计时
  useEffect(() => {
    if (lockTimeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setLockTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleReleaseNumber();
          toast({
            title: lang === 'zh' ? '号码已释放' : 'Number Released',
            description: lang === 'zh' ? '超时未支付，号码已自动释放' : 'Payment timeout, number released',
            variant: 'destructive',
          });
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lockTimeLeft, lang, navigate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 释放号码
  const handleReleaseNumber = useCallback(async () => {
    if (phoneNumberId && user) {
      try {
        await supabase
          .from('phone_numbers')
          .update({
            locked_by: null,
            locked_until: null,
            is_available: true,
          })
          .eq('id', phoneNumberId);
      } catch (error) {
        console.error('Error releasing phone number:', error);
      }
    }
  }, [phoneNumberId, user]);

  // 更换号码
  const handleChangeNumber = async () => {
    if (!user || !countryCode) return;
    
    setIsChangingNumber(true);
    
    try {
      // 释放当前号码
      if (phoneNumberId) {
        await supabase
          .from('phone_numbers')
          .update({
            locked_by: null,
            locked_until: null,
            is_available: true,
          })
          .eq('id', phoneNumberId);
      }
      
      // 获取新号码
      const { data: newPhone, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('country_code', countryCode)
        .eq('is_available', true)
        .is('locked_by', null)
        .neq('id', phoneNumberId || '')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!newPhone) {
        toast({
          title: lang === 'zh' ? '暂无其他号码' : 'No Other Numbers',
          description: lang === 'zh' ? '该国家暂时没有其他可用号码' : 'No other numbers available',
          variant: 'destructive',
        });
        return;
      }
      
      // 锁定新号码
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await supabase
        .from('phone_numbers')
        .update({
          locked_by: user.id,
          locked_until: lockUntil,
          is_available: false,
        })
        .eq('id', newPhone.id);
      
      setPhoneNumber(newPhone.phone_number);
      setPhoneNumberId(newPhone.id);
      setLockTimeLeft(30 * 60);
      setSmsMessages([]);
      
      toast({
        title: lang === 'zh' ? '已更换号码' : 'Number Changed',
        description: lang === 'zh' ? `新号码: ${newPhone.phone_number}` : `New number: ${newPhone.phone_number}`,
      });
    } catch (error) {
      console.error('Error changing number:', error);
      toast({
        title: lang === 'zh' ? '更换失败' : 'Failed to Change',
        variant: 'destructive',
      });
    } finally {
      setIsChangingNumber(false);
    }
  };

  // 复制号码
  const handleCopyNumber = () => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber);
      toast({
        title: lang === 'zh' ? '已复制' : 'Copied',
        description: phoneNumber,
      });
    }
  };

  // 获取验证码 - 总是弹出余额不足提示
  const handleGetCode = () => {
    setShowInsufficientDialog(true);
  };

  // 刷新短信列表
  const handleRefreshMessages = async () => {
    setIsRefreshing(true);
    // 模拟刷新延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: lang === 'zh' ? '已刷新' : 'Refreshed',
      description: lang === 'zh' ? '暂无新短信' : 'No new messages',
    });
  };

  // 返回首页并释放号码
  const handleBack = async () => {
    await handleReleaseNumber();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">
            {lang === 'zh' ? '正在获取号码...' : 'Getting number...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {lang === 'zh' ? '接收验证码' : 'Receive SMS'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {countryName} · {serviceName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {lang === 'zh' ? '余额:' : 'Balance:'}
              </span>
              <span className="font-medium text-primary">
                ¥{profile?.balance?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 号码信息卡片 */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {lang === 'zh' ? '接收号码' : 'Receiving Number'}
                </p>
                <p className="text-2xl font-bold text-foreground font-mono">
                  {phoneNumber}
                </p>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={handleCopyNumber}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          {/* 倒计时和操作按钮 */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">
                {lang === 'zh' ? '号码锁定剩余:' : 'Lock expires in:'}
              </span>
              <span className="font-mono font-bold text-lg text-orange-500">
                {formatTime(lockTimeLeft)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleChangeNumber}
                disabled={isChangingNumber}
              >
                {isChangingNumber ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {lang === 'zh' ? '更换号码' : 'Change'}
              </Button>
              <Button onClick={handleGetCode}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {lang === 'zh' ? '获取验证码' : 'Get Code'}
              </Button>
            </div>
          </div>
        </div>

        {/* 价格信息 */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {lang === 'zh' ? '服务价格:' : 'Service Price:'}
              </span>
            </div>
            <span className="text-lg font-bold text-primary">¥{price.toFixed(2)}</span>
          </div>
        </div>

        {/* 短信列表 */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {lang === 'zh' ? '短信列表' : 'SMS Messages'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefreshMessages}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {lang === 'zh' ? '刷新' : 'Refresh'}
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="w-[160px]">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {lang === 'zh' ? '时间' : 'Time'}
                </TableHead>
                <TableHead className="w-[150px]">
                  {lang === 'zh' ? '发送号码' : 'Sender'}
                </TableHead>
                <TableHead>
                  {lang === 'zh' ? '内容' : 'Content'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {smsMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">
                      {lang === 'zh' ? '暂无短信，请点击"获取验证码"' : 'No messages yet, click "Get Code"'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                smsMessages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="font-mono">{msg.id}</TableCell>
                    <TableCell className="text-sm">{msg.time}</TableCell>
                    <TableCell className="font-mono text-sm">{msg.sender}</TableCell>
                    <TableCell>{msg.content}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 使用说明 */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            {lang === 'zh' ? '使用说明' : 'Instructions'}
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {lang === 'zh' ? '请在30分钟内完成验证，超时号码将自动释放' : 'Please complete verification within 30 minutes'}</li>
            <li>• {lang === 'zh' ? '如需更换号码，请点击"更换号码"按钮' : 'Click "Change" to get a different number'}</li>
            <li>• {lang === 'zh' ? '短信可能有1-3分钟延迟，请耐心等待' : 'SMS may have 1-3 minutes delay, please wait patiently'}</li>
          </ul>
        </div>
      </main>

      {/* 余额不足弹窗 */}
      <Dialog open={showInsufficientDialog} onOpenChange={setShowInsufficientDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-500">
              <AlertTriangle className="h-5 w-5" />
              {lang === 'zh' ? '余额不足' : 'Insufficient Balance'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'zh' 
                ? `当前余额 ¥${profile?.balance?.toFixed(2) || '0.00'}，服务价格 ¥${price.toFixed(2)}。请先充值后再获取验证码。`
                : `Current balance: ¥${profile?.balance?.toFixed(2) || '0.00'}, Service price: ¥${price.toFixed(2)}. Please recharge first.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-lg p-4 my-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">
                {lang === 'zh' ? '当前余额' : 'Current Balance'}
              </span>
              <span className="font-medium">¥{profile?.balance?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">
                {lang === 'zh' ? '服务价格' : 'Service Price'}
              </span>
              <span className="font-medium text-primary">¥{price.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {lang === 'zh' ? '还需充值' : 'Need to Recharge'}
                </span>
                <span className="font-bold text-orange-500">
                  ¥{Math.max(0, price - (profile?.balance || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowInsufficientDialog(false)}>
              {lang === 'zh' ? '稍后再说' : 'Later'}
            </Button>
            <Button 
              onClick={() => {
                setShowInsufficientDialog(false);
                // 传递参数以便返回时恢复状态
                const returnParams = new URLSearchParams({
                  country: countryCode,
                  countryName,
                  service: serviceName,
                  serviceId,
                  price: price.toString(),
                }).toString();
                navigate(`/recharge?from=receive-code&returnParams=${encodeURIComponent(returnParams)}`);
              }} 
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              {lang === 'zh' ? '立即充值' : 'Recharge Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiveCodePage;

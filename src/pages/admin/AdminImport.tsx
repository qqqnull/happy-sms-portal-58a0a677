import { useState } from 'react';
import { Upload, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from './AdminLayout';
import countryServicesData from '@/data/country-services-full.json';

const AdminImport = () => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    setImporting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('import-data', {
        body: { data: countryServicesData },
      });

      if (error) throw error;

      setResult({
        success: data.success,
        message: data.message || data.error,
      });

      toast({
        title: data.success ? '导入成功' : '导入失败',
        description: data.message || data.error,
        variant: data.success ? 'default' : 'destructive',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '导入过程中发生错误';
      setResult({
        success: false,
        message,
      });
      toast({
        title: '导入失败',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">数据导入</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                导入国家和服务数据
              </CardTitle>
              <CardDescription>
                从 JSON 文件导入国家、服务和定价数据到数据库
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">数据概览</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• 数据文件: country-services-full.json</p>
                  <p>• 包含国家数量: {Array.isArray(countryServicesData) ? countryServicesData.length : 0} 个</p>
                  <p>• 导入内容: 国家信息、服务列表、国家特定定价</p>
                </div>
              </div>

              <Button
                onClick={handleImport}
                disabled={importing}
                className="w-full"
                size="lg"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    正在导入...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    开始导入数据
                  </>
                )}
              </Button>

              {result && (
                <div
                  className={`rounded-lg p-4 flex items-start gap-3 ${
                    result.success
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{result.success ? '导入成功' : '导入失败'}</p>
                    <p className="text-sm opacity-80">{result.message}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>导入说明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. 点击"开始导入数据"按钮开始导入过程</p>
              <p>2. 导入过程会自动创建或更新以下数据：</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>国家表 (countries) - 包含国旗、区域、在线号码数量等</li>
                <li>服务表 (services) - 包含服务名称、描述、成功率等</li>
                <li>国家服务表 (country_services) - 包含每个国家的服务特定定价</li>
              </ul>
              <p>3. 如果数据已存在，将会更新现有记录</p>
              <p>4. 导入过程可能需要几分钟时间，请耐心等待</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminImport;

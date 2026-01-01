import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Phone, CheckCircle, AlertCircle, Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const AdminPhoneNumbers = () => {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Query to get phone number statistics
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['phone-number-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('country_code, is_available')

      if (error) throw error;

      const countryCount = new Set(data?.map(p => p.country_code)).size;
      const totalCount = data?.length || 0;
      const availableCount = data?.filter(p => p.is_available).length || 0;

      return { countryCount, totalCount, availableCount };
    }
  });

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-phone-numbers');

      if (error) {
        throw error;
      }

      setResult(data);
      if (data.success) {
        toast.success("手机号生成成功", {
          description: data.message,
        });
        refetchStats();
      } else {
        toast.error("生成失败", {
          description: data.error || "未知错误",
        });
      }
    } catch (error: any) {
      console.error('Generate error:', error);
      setResult({ success: false, message: error.message || "生成过程中发生错误" });
      toast.error("生成失败", {
        description: error.message || "未知错误",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">手机号管理</h1>
          <p className="text-muted-foreground">管理各国虚拟手机号码</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">国家数量</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.countryCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总号码数</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">可用号码</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.availableCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              生成手机号码
            </CardTitle>
            <CardDescription>
              为数据库中的所有国家生成虚拟手机号码，每个国家100个号码
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">生成规则：</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>根据各国区号格式生成真实格式的手机号</li>
                <li>每个国家生成100个唯一号码</li>
                <li>已存在的号码会被跳过（不会重复）</li>
                <li>支持100+个国家/地区</li>
              </ul>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  开始生成手机号
                </>
              )}
            </Button>

            {result && (
              <div
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  result.success
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {result.success ? "生成成功" : "生成失败"}
                  </p>
                  <p className="text-sm opacity-80">{result.message}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPhoneNumbers;

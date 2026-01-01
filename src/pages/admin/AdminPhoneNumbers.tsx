import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Phone, CheckCircle, AlertCircle, Database, Search, Trash2, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const AdminPhoneNumbers = () => {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Query to get all countries
  const { data: countries } = useQuery({
    queryKey: ['countries-for-phone'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('code, name, flag')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Query to get phone number statistics by country
  const { data: countryStats } = useQuery({
    queryKey: ['phone-stats-by-country'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('country_code, is_available');
      if (error) throw error;

      const stats: Record<string, { total: number; available: number }> = {};
      data?.forEach(p => {
        if (!stats[p.country_code]) {
          stats[p.country_code] = { total: 0, available: 0 };
        }
        stats[p.country_code].total++;
        if (p.is_available) {
          stats[p.country_code].available++;
        }
      });
      return stats;
    }
  });

  // Query to get phone numbers with filtering
  const { data: phoneNumbers, isLoading: loadingNumbers, refetch: refetchNumbers } = useQuery({
    queryKey: ['phone-numbers', selectedCountry, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('phone_numbers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedCountry && selectedCountry !== 'all') {
        query = query.eq('country_code', selectedCountry);
      }

      if (searchQuery) {
        query = query.ilike('phone_number', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('phone_numbers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("号码已删除");
      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['phone-stats-by-country'] });
    },
    onError: (error: any) => {
      toast.error("删除失败", { description: error.message });
    }
  });

  // Delete all by country mutation
  const deleteByCountryMutation = useMutation({
    mutationFn: async (countryCode: string) => {
      const { error } = await supabase
        .from('phone_numbers')
        .delete()
        .eq('country_code', countryCode);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("该国家所有号码已删除");
      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['phone-stats-by-country'] });
    },
    onError: (error: any) => {
      toast.error("删除失败", { description: error.message });
    }
  });

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      const { error } = await supabase
        .from('phone_numbers')
        .update({ is_available: isAvailable })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['phone-stats-by-country'] });
    },
    onError: (error: any) => {
      toast.error("更新失败", { description: error.message });
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
        queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
        queryClient.invalidateQueries({ queryKey: ['phone-stats-by-country'] });
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

  const totalNumbers = Object.values(countryStats || {}).reduce((sum, s) => sum + s.total, 0);
  const totalAvailable = Object.values(countryStats || {}).reduce((sum, s) => sum + s.available, 0);
  const countryCount = Object.keys(countryStats || {}).length;

  const getCountryInfo = (code: string) => {
    const country = countries?.find(c => c.code === code);
    return country || { name: code, flag: '🌍' };
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
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
              <div className="text-2xl font-bold">{countryCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总号码数</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalNumbers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">可用号码</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAvailable}</div>
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
            <Button
              onClick={handleGenerate}
              disabled={generating}
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

        {/* Country Stats */}
        <Card>
          <CardHeader>
            <CardTitle>各国号码统计</CardTitle>
            <CardDescription>按国家查看手机号分布情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(countryStats || {}).map(([code, stats]) => {
                const country = getCountryInfo(code);
                return (
                  <div
                    key={code}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedCountry(code)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{country.flag}</span>
                      <span className="font-medium text-sm truncate">{country.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.available}/{stats.total} 可用
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Phone Numbers Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>手机号列表</CardTitle>
                <CardDescription>查看和管理所有手机号码</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索号码..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-48"
                  />
                </div>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="选择国家" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部国家</SelectItem>
                    {countries?.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetchNumbers()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                {selectedCountry && selectedCountry !== 'all' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm(`确定要删除 ${getCountryInfo(selectedCountry).name} 的所有号码吗？`)) {
                        deleteByCountryMutation.mutate(selectedCountry);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    删除该国全部
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingNumbers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : phoneNumbers && phoneNumbers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>国家</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>锁定信息</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phoneNumbers.map((phone) => {
                      const country = getCountryInfo(phone.country_code);
                      return (
                        <TableRow key={phone.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span className="text-sm">{country.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{phone.phone_number}</TableCell>
                          <TableCell>
                            <Badge
                              variant={phone.is_available ? "default" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => toggleAvailabilityMutation.mutate({
                                id: phone.id,
                                isAvailable: !phone.is_available
                              })}
                            >
                              {phone.is_available ? "可用" : "已占用"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {phone.locked_by ? (
                              <span className="text-xs text-muted-foreground">
                                锁定至 {new Date(phone.locked_until!).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(phone.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('确定要删除这个号码吗？')) {
                                  deleteMutation.mutate(phone.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>暂无手机号数据</p>
                <p className="text-sm">点击上方按钮生成手机号</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPhoneNumbers;

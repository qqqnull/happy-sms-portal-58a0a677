import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Search, ArrowLeft, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';

interface Country {
  id: string;
  name: string;
  name_en: string;
  code: string;
  flag: string;
}

interface Service {
  id: string;
  name: string;
  name_en: string | null;
  icon: string | null;
}

interface CountryService {
  id: string;
  country_id: string;
  service_id: string;
  price: number;
  is_active: boolean;
  service: Service;
}

const AdminCountryServices = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryServices, setCountryServices] = useState<CountryService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [newServicePrice, setNewServicePrice] = useState<number>(1);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchPrice, setBatchPrice] = useState<number>(1);

  useEffect(() => {
    fetchCountries();
    fetchAllServices();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('countries')
      .select('id, name, name_en, code, flag')
      .order('sort_order');

    if (error) {
      toast.error('加载国家失败');
    } else if (data) {
      setCountries(data);
    }
    setLoading(false);
  };

  const fetchAllServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, name_en, icon')
      .eq('is_active', true)
      .order('sort_order');

    if (!error && data) {
      setServices(data);
    }
  };

  const fetchCountryServices = async (countryId: string) => {
    setLoadingServices(true);
    const { data, error } = await supabase
      .from('country_services')
      .select(`
        id,
        country_id,
        service_id,
        price,
        is_active,
        service:services(id, name, name_en, icon)
      `)
      .eq('country_id', countryId)
      .order('created_at');

    if (error) {
      toast.error('加载服务失败');
    } else if (data) {
      setCountryServices(data.map((cs: any) => ({
        ...cs,
        price: Number(cs.price),
        is_active: cs.is_active ?? true,
        service: cs.service
      })));
    }
    setLoadingServices(false);
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setServiceSearchQuery('');
    fetchCountryServices(country.id);
  };

  const handleBack = () => {
    setSelectedCountry(null);
    setCountryServices([]);
  };

  const handleAddService = async () => {
    if (!selectedCountry || !selectedServiceId) {
      toast.error('请选择服务');
      return;
    }

    // Check if service already exists for this country
    const exists = countryServices.some(cs => cs.service_id === selectedServiceId);
    if (exists) {
      toast.error('该服务已添加');
      return;
    }

    const { error } = await supabase
      .from('country_services')
      .insert({
        country_id: selectedCountry.id,
        service_id: selectedServiceId,
        price: newServicePrice,
        is_active: true,
      });

    if (error) {
      toast.error('添加失败: ' + error.message);
    } else {
      toast.success('添加成功');
      setAddDialogOpen(false);
      setSelectedServiceId('');
      setNewServicePrice(1);
      fetchCountryServices(selectedCountry.id);
    }
  };

  const handleUpdatePrice = async (cs: CountryService, newPrice: number) => {
    const { error } = await supabase
      .from('country_services')
      .update({ price: newPrice })
      .eq('id', cs.id);

    if (error) {
      toast.error('更新失败');
    } else {
      setCountryServices(prev =>
        prev.map(item =>
          item.id === cs.id ? { ...item, price: newPrice } : item
        )
      );
    }
  };

  const handleToggleActive = async (cs: CountryService) => {
    const { error } = await supabase
      .from('country_services')
      .update({ is_active: !cs.is_active })
      .eq('id', cs.id);

    if (error) {
      toast.error('更新失败');
    } else {
      setCountryServices(prev =>
        prev.map(item =>
          item.id === cs.id ? { ...item, is_active: !item.is_active } : item
        )
      );
    }
  };

  const handleDelete = async (cs: CountryService) => {
    if (!confirm(`确定要删除 "${cs.service.name}" 服务吗？`)) return;

    const { error } = await supabase
      .from('country_services')
      .delete()
      .eq('id', cs.id);

    if (error) {
      toast.error('删除失败');
    } else {
      toast.success('删除成功');
      setCountryServices(prev => prev.filter(item => item.id !== cs.id));
    }
  };

  const handleBatchAddServices = async () => {
    if (!selectedCountry) return;

    // Get services not yet added
    const existingServiceIds = new Set(countryServices.map(cs => cs.service_id));
    const newServices = services.filter(s => !existingServiceIds.has(s.id));

    if (newServices.length === 0) {
      toast.info('所有服务已添加');
      setBatchDialogOpen(false);
      return;
    }

    const inserts = newServices.map(s => ({
      country_id: selectedCountry.id,
      service_id: s.id,
      price: batchPrice,
      is_active: true,
    }));

    const { error } = await supabase
      .from('country_services')
      .insert(inserts);

    if (error) {
      toast.error('批量添加失败: ' + error.message);
    } else {
      toast.success(`成功添加 ${newServices.length} 个服务`);
      setBatchDialogOpen(false);
      fetchCountryServices(selectedCountry.id);
    }
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery)
  );

  const filteredCountryServices = countryServices.filter(cs =>
    cs.service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    (cs.service.name_en && cs.service.name_en.toLowerCase().includes(serviceSearchQuery.toLowerCase()))
  );

  // Services available to add (not already added)
  const availableServices = services.filter(
    s => !countryServices.some(cs => cs.service_id === s.id)
  );

  return (
    <AdminLayout>
      <div className="p-6">
        {!selectedCountry ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">国家服务管理</h1>
                <p className="text-muted-foreground text-sm mt-1">选择国家以管理其可用服务和价格</p>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索国家..."
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredCountries.map((country) => (
                  <div
                    key={country.id}
                    onClick={() => handleSelectCountry(country)}
                    className="p-4 rounded-xl border border-border hover:border-secondary hover:shadow-lg transition-all cursor-pointer group bg-card"
                  >
                    <img 
                      src={`https://flagcdn.com/w160/${country.code.toLowerCase()}.png`} 
                      alt={country.name}
                      className="w-12 h-8 object-cover rounded mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="font-medium text-foreground group-hover:text-secondary transition-colors truncate">
                      {country.name}
                    </div>
                    <div className="text-sm text-muted-foreground">{country.name_en}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Country Services View */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回
                </Button>
                <div className="flex items-center gap-3">
                  <img 
                    src={`https://flagcdn.com/w160/${selectedCountry.code.toLowerCase()}.png`} 
                    alt={selectedCountry.name}
                    className="w-10 h-7 object-cover rounded"
                  />
                  <div>
                    <h1 className="text-xl font-bold">{selectedCountry.name}</h1>
                    <p className="text-sm text-muted-foreground">{selectedCountry.name_en}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setBatchDialogOpen(true)}>
                  <Settings2 className="h-4 w-4 mr-2" />
                  批量添加
                </Button>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加服务
                </Button>
              </div>
            </div>

            {/* Service Search */}
            <div className="mb-4 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索服务..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">
                共 {countryServices.length} 个服务
              </Badge>
            </div>

            {loadingServices ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
              </div>
            ) : filteredCountryServices.length > 0 ? (
              <div className="bg-card rounded-lg shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>服务名称</TableHead>
                      <TableHead>价格 (￥)</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCountryServices.map((cs) => (
                      <TableRow key={cs.id}>
                        <TableCell>
                          <div className="font-medium">{cs.service.name}</div>
                          {cs.service.name_en && (
                            <div className="text-sm text-muted-foreground">{cs.service.name_en}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={cs.price}
                            onChange={(e) => {
                              const newPrice = parseFloat(e.target.value) || 0;
                              setCountryServices(prev =>
                                prev.map(item =>
                                  item.id === cs.id ? { ...item, price: newPrice } : item
                                )
                              );
                            }}
                            onBlur={(e) => {
                              const newPrice = parseFloat(e.target.value) || 0;
                              handleUpdatePrice(cs, newPrice);
                            }}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={cs.is_active}
                            onCheckedChange={() => handleToggleActive(cs)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cs)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg">
                <Settings2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">暂无服务，点击上方按钮添加</p>
              </div>
            )}
          </>
        )}

        {/* Add Service Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加服务</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>选择服务</Label>
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择服务" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} {service.name_en && `(${service.name_en})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>价格 (￥)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddService}>
                <Save className="h-4 w-4 mr-2" />
                添加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Batch Add Dialog */}
        <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>批量添加服务</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                将所有未添加的服务以统一价格添加到该国家。
                当前有 <span className="font-bold text-secondary">{availableServices.length}</span> 个服务未添加。
              </p>

              <div>
                <Label>统一价格 (￥)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={batchPrice}
                  onChange={(e) => setBatchPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setBatchDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleBatchAddServices} disabled={availableServices.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                批量添加 {availableServices.length} 个服务
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCountryServices;
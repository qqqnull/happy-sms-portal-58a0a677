import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';

interface Country {
  id: string;
  name: string;
  name_en: string;
  code: string;
  flag: string;
  region: string;
  price: number;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  online_count: number;
}

const emptyCountry: Omit<Country, 'id'> = {
  name: '',
  name_en: '',
  code: '',
  flag: '',
  region: 'asia',
  price: 1.00,
  is_popular: false,
  is_active: true,
  sort_order: 0,
  online_count: 100,
};

const AdminCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState<Omit<Country, 'id'>>(emptyCountry);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error('加载国家失败');
    } else if (data) {
      setCountries(data.map(c => ({ ...c, price: Number(c.price) })));
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setEditingCountry(null);
    setFormData(emptyCountry);
    setDialogOpen(true);
  };

  const openEditDialog = (country: Country) => {
    setEditingCountry(country);
    setFormData({
      name: country.name,
      name_en: country.name_en,
      code: country.code,
      flag: country.flag,
      region: country.region,
      price: country.price,
      is_popular: country.is_popular || false,
      is_active: country.is_active ?? true,
      sort_order: country.sort_order || 0,
      online_count: country.online_count || 100,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.name_en || !formData.code || !formData.flag) {
      toast.error('请填写所有必填字段');
      return;
    }

    if (editingCountry) {
      const { error } = await supabase
        .from('countries')
        .update(formData)
        .eq('id', editingCountry.id);

      if (error) {
        toast.error('更新失败');
      } else {
        toast.success('更新成功');
        setDialogOpen(false);
        fetchCountries();
      }
    } else {
      const { error } = await supabase
        .from('countries')
        .insert([formData]);

      if (error) {
        toast.error('添加失败');
      } else {
        toast.success('添加成功');
        setDialogOpen(false);
        fetchCountries();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个国家吗？')) return;

    const { error } = await supabase.from('countries').delete().eq('id', id);

    if (error) {
      toast.error('删除失败');
    } else {
      toast.success('删除成功');
      fetchCountries();
    }
  };

  const toggleActive = async (country: Country) => {
    const { error } = await supabase
      .from('countries')
      .update({ is_active: !country.is_active })
      .eq('id', country.id);

    if (error) {
      toast.error('更新失败');
    } else {
      fetchCountries();
    }
  };

  const regions = [
    { value: 'asia', label: '亚洲' },
    { value: 'europe', label: '欧洲' },
    { value: 'americas', label: '美洲' },
    { value: 'africa', label: '非洲' },
    { value: 'oceania', label: '大洋洲' },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">国家管理</h1>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            添加国家
          </Button>
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
                  <TableHead>国旗</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>区号</TableHead>
                  <TableHead>地区</TableHead>
                  <TableHead>价格</TableHead>
                  <TableHead>在线数量</TableHead>
                  <TableHead>热门</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="text-2xl">{country.flag}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{country.name}</div>
                        <div className="text-sm text-muted-foreground">{country.name_en}</div>
                      </div>
                    </TableCell>
                    <TableCell>+{country.code}</TableCell>
                    <TableCell>
                      {regions.find(r => r.value === country.region)?.label || country.region}
                    </TableCell>
                    <TableCell>￥{country.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                        {country.online_count || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {country.is_popular && (
                        <span className="px-2 py-1 rounded text-xs bg-accent/10 text-accent">热门</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={country.is_active ?? true}
                        onCheckedChange={() => toggleActive(country)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(country)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(country.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCountry ? '编辑国家' : '添加国家'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>中文名称</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="中国"
                  />
                </div>
                <div>
                  <Label>英文名称</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="China"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>区号</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="86"
                  />
                </div>
                <div>
                  <Label>国旗 Emoji</Label>
                  <Input
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    placeholder="🇨🇳"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>地区</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData({ ...formData, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
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
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>在线数量</Label>
                  <Input
                    type="number"
                    value={formData.online_count}
                    onChange={(e) => setFormData({ ...formData, online_count: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label>排序</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                  />
                  <Label>热门</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>启用</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                取消
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCountries;

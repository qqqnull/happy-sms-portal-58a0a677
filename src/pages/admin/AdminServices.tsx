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
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';

interface Service {
  id: string;
  name: string;
  icon: string | null;
  price_modifier: number;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

const emptyService: Omit<Service, 'id'> = {
  name: '',
  icon: null,
  price_modifier: 1.00,
  is_popular: false,
  is_active: true,
  sort_order: 0,
};

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Omit<Service, 'id'>>(emptyService);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error('加载服务失败');
    } else if (data) {
      setServices(data.map(s => ({ ...s, price_modifier: Number(s.price_modifier) })));
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setEditingService(null);
    setFormData(emptyService);
    setDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      icon: service.icon,
      price_modifier: service.price_modifier,
      is_popular: service.is_popular || false,
      is_active: service.is_active ?? true,
      sort_order: service.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('请填写服务名称');
      return;
    }

    if (editingService) {
      const { error } = await supabase
        .from('services')
        .update(formData)
        .eq('id', editingService.id);

      if (error) {
        toast.error('更新失败');
      } else {
        toast.success('更新成功');
        setDialogOpen(false);
        fetchServices();
      }
    } else {
      const { error } = await supabase
        .from('services')
        .insert([formData]);

      if (error) {
        toast.error('添加失败');
      } else {
        toast.success('添加成功');
        setDialogOpen(false);
        fetchServices();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个服务吗？')) return;

    const { error } = await supabase.from('services').delete().eq('id', id);

    if (error) {
      toast.error('删除失败');
    } else {
      toast.success('删除成功');
      fetchServices();
    }
  };

  const toggleActive = async (service: Service) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id);

    if (error) {
      toast.error('更新失败');
    } else {
      fetchServices();
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">服务管理</h1>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            添加服务
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
                  <TableHead>图标</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>价格系数</TableHead>
                  <TableHead>热门</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="text-2xl">{service.icon || '📱'}</TableCell>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>x{service.price_modifier.toFixed(2)}</TableCell>
                    <TableCell>
                      {service.is_popular && (
                        <span className="px-2 py-1 rounded text-xs bg-accent/10 text-accent">热门</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={service.is_active ?? true}
                        onCheckedChange={() => toggleActive(service)}
                      />
                    </TableCell>
                    <TableCell>{service.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(service.id)}
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
                {editingService ? '编辑服务' : '添加服务'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>服务名称</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="WhatsApp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>图标 Emoji</Label>
                  <Input
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value || null })}
                    placeholder="📱"
                  />
                </div>
                <div>
                  <Label>价格系数</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_modifier}
                    onChange={(e) => setFormData({ ...formData, price_modifier: parseFloat(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div>
                <Label>排序</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
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

export default AdminServices;

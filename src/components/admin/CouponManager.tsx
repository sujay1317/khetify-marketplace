import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number | null;
  is_active: boolean | null;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    max_uses: 100,
    valid_until: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCoupons(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order_amount: form.min_order_amount || 0,
      max_uses: form.max_uses || null,
      valid_until: form.valid_until || null,
      is_active: true,
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editingCoupon.id);

      if (error) {
        toast.error('Failed to update coupon');
      } else {
        toast.success('Coupon updated!');
      }
    } else {
      const { error } = await supabase
        .from('coupons')
        .insert(couponData);

      if (error) {
        if (error.code === '23505') {
          toast.error('Coupon code already exists');
        } else {
          toast.error('Failed to create coupon');
        }
      } else {
        toast.success('Coupon created!');
      }
    }

    setIsDialogOpen(false);
    setEditingCoupon(null);
    setForm({
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 0,
      max_uses: 100,
      valid_until: '',
    });
    fetchCoupons();
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean | null) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update coupon status');
    } else {
      toast.success(currentStatus ? 'Coupon deactivated' : 'Coupon activated');
      fetchCoupons();
    }
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete coupon');
    } else {
      toast.success('Coupon deleted');
      fetchCoupons();
    }
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || 0,
      max_uses: coupon.max_uses || 100,
      valid_until: coupon.valid_until?.split('T')[0] || '',
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-heading">Coupon Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCoupon(null);
              setForm({
                code: '',
                discount_type: 'percentage',
                discount_value: 10,
                min_order_amount: 0,
                max_uses: 100,
                valid_until: '',
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Coupon Code</label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="SUMMER20"
                  required
                  className="uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Discount Type</label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Discount Value</label>
                  <Input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                    required
                    min={1}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Min Order Amount (₹)</label>
                  <Input
                    type="number"
                    value={form.min_order_amount}
                    onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Max Uses</label>
                  <Input
                    type="number"
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Valid Until</label>
                <Input
                  type="date"
                  value={form.valid_until}
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                <TableCell>
                  {coupon.discount_type === 'percentage' 
                    ? `${coupon.discount_value}%` 
                    : `₹${coupon.discount_value}`}
                </TableCell>
                <TableCell>₹{coupon.min_order_amount || 0}</TableCell>
                <TableCell>
                  {coupon.used_count || 0} / {coupon.max_uses || '∞'}
                </TableCell>
                <TableCell>
                  {coupon.valid_until 
                    ? new Date(coupon.valid_until).toLocaleDateString()
                    : 'No expiry'}
                </TableCell>
                <TableCell>
                  <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                    >
                      {coupon.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openEditDialog(coupon)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteCoupon(coupon.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {coupons.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No coupons created yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CouponManager;

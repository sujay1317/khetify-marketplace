import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { couponsApi, type CouponDto } from '@/services/api';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponDto | null>(null);
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, max_uses: 100, valid_until: '' });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try { const data = await couponsApi.getAll(); setCoupons(data); } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const couponData = {
      code: form.code.toUpperCase(),
      discountType: form.discount_type,
      discountValue: form.discount_value,
      minOrderAmount: form.min_order_amount || 0,
      maxUses: form.max_uses || undefined,
      validUntil: form.valid_until || undefined,
      isActive: true,
    };
    try {
      if (editingCoupon) {
        await couponsApi.update(editingCoupon.id, couponData);
        toast.success('Coupon updated!');
      } else {
        await couponsApi.create(couponData);
        toast.success('Coupon created!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save coupon');
    }
    setIsDialogOpen(false); setEditingCoupon(null);
    setForm({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, max_uses: 100, valid_until: '' });
    fetchCoupons();
  };

  const toggleCouponStatus = async (id: string) => {
    try { await couponsApi.toggle(id); toast.success('Coupon status updated'); fetchCoupons(); } catch { toast.error('Failed to update'); }
  };

  const deleteCoupon = async (id: string) => {
    try { await couponsApi.delete(id); toast.success('Coupon deleted'); fetchCoupons(); } catch { toast.error('Failed to delete'); }
  };

  const openEditDialog = (coupon: CouponDto) => {
    setEditingCoupon(coupon);
    setForm({ code: coupon.code, discount_type: coupon.discountType, discount_value: coupon.discountValue, min_order_amount: coupon.minOrderAmount || 0, max_uses: coupon.maxUses || 100, valid_until: coupon.validUntil?.split('T')[0] || '' });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-heading">Coupon Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={() => { setEditingCoupon(null); setForm({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, max_uses: 100, valid_until: '' }); }}><Plus className="w-4 h-4 mr-2" />Add Coupon</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle><DialogDescription>{editingCoupon ? 'Update the coupon details.' : 'Fill in the details to create a new coupon.'}</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div><label className="text-sm font-medium mb-1 block">Coupon Code</label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER20" required className="uppercase" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Type</label><Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="fixed">Fixed (₹)</SelectItem></SelectContent></Select></div>
                <div><label className="text-sm font-medium mb-1 block">Value</label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} required min={1} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Min Order (₹)</label><Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })} min={0} /></div>
                <div><label className="text-sm font-medium mb-1 block">Max Uses</label><Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })} min={1} /></div>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Valid Until</label><Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} /></div>
              <Button type="submit" className="w-full">{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Min Order</TableHead><TableHead>Usage</TableHead><TableHead>Valid Until</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                <TableCell>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</TableCell>
                <TableCell>₹{coupon.minOrderAmount || 0}</TableCell>
                <TableCell>{coupon.usedCount || 0} / {coupon.maxUses || '∞'}</TableCell>
                <TableCell>{coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'No expiry'}</TableCell>
                <TableCell><Badge variant={coupon.isActive ? 'default' : 'secondary'}>{coupon.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleCouponStatus(coupon.id)}>{coupon.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}</Button>
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(coupon)}><Edit2 className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => deleteCoupon(coupon.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {coupons.length === 0 && !loading && (<TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No coupons created yet</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CouponManager;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Plus, Upload, X, Key, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi, uploadApi, type UserWithRoleDto } from '@/services/api';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const ManageUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddSellerOpen, setIsAddSellerOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoleDto | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [sellerForm, setSellerForm] = useState({ email: '', password: '', fullName: '', phone: '', freeDelivery: false });
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [shopImagePreview, setShopImagePreview] = useState<string | null>(null);
  const [isCreatingSeller, setIsCreatingSeller] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRoleDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try { const data = await usersApi.getAllUsers(); setUsers(data); }
    catch (error) { console.error('Error:', error); }
    setLoading(false);
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try { await usersApi.updateRole(userId, newRole); toast.success('Role updated'); fetchUsers(); }
    catch { toast.error('Failed to update role'); }
  };

  const handleChangePassword = async () => {
    if (!selectedUser || newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setIsUpdatingPassword(true);
    try { await usersApi.changeUserPassword(selectedUser.userId, newPassword); toast.success('Password updated'); setIsPasswordDialogOpen(false); setNewPassword(''); }
    catch (error: any) { toast.error(error.message || 'Failed'); }
    setIsUpdatingPassword(false);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try { await usersApi.deleteUser(userToDelete.userId); toast.success('User deleted'); setUserToDelete(null); fetchUsers(); }
    catch (error: any) { toast.error(error.message || 'Failed'); }
    setIsDeleting(false);
  };

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingSeller(true);
    try {
      await usersApi.createSeller({ email: sellerForm.email, password: sellerForm.password, fullName: sellerForm.fullName, phone: sellerForm.phone, freeDelivery: sellerForm.freeDelivery });
      if (shopImage) {
        try { await uploadApi.shopImage(shopImage); } catch { toast.error('Seller created but image upload failed'); }
      }
      toast.success('Seller created!');
      setIsAddSellerOpen(false);
      setSellerForm({ email: '', password: '', fullName: '', phone: '', freeDelivery: false });
      setShopImage(null); setShopImagePreview(null);
      fetchUsers();
    } catch (error: any) { toast.error(error.message || 'Failed'); }
    setIsCreatingSeller(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}><ArrowLeft className="w-5 h-5" /></Button>
              <div className="flex items-center gap-2"><Users className="w-6 h-6 text-primary" /><h1 className="text-2xl font-bold font-heading">Manage Users</h1></div>
            </div>
            <Dialog open={isAddSellerOpen} onOpenChange={setIsAddSellerOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Seller</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Seller</DialogTitle><DialogDescription>Create a new seller account.</DialogDescription></DialogHeader>
                <form onSubmit={handleCreateSeller} className="space-y-4">
                  <div><label className="text-sm font-medium">Full Name *</label><Input value={sellerForm.fullName} onChange={(e) => setSellerForm({ ...sellerForm, fullName: e.target.value })} required /></div>
                  <div><label className="text-sm font-medium">Email *</label><Input type="email" value={sellerForm.email} onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })} required /></div>
                  <div><label className="text-sm font-medium">Phone</label><Input type="tel" value={sellerForm.phone} onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Password *</label><Input type="password" value={sellerForm.password} onChange={(e) => setSellerForm({ ...sellerForm, password: e.target.value })} required /></div>
                  <div className="flex items-center space-x-2"><Checkbox id="freeDelivery" checked={sellerForm.freeDelivery} onCheckedChange={(checked) => setSellerForm({ ...sellerForm, freeDelivery: checked === true })} /><Label htmlFor="freeDelivery" className="text-sm font-medium cursor-pointer">Free Delivery</Label></div>
                  <Button type="submit" className="w-full" disabled={isCreatingSeller}>{isCreatingSeller ? 'Creating...' : 'Create Seller'}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>) : (
            <Card>
              <Table>
                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.length === 0 ? (<TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users</TableCell></TableRow>) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">{u.role === 'admin' ? '👑' : u.role === 'seller' ? '🌾' : '👤'}</div>{u.profile?.fullName || 'Unknown'}</div></TableCell>
                        <TableCell>{u.profile?.phone || '-'}</TableCell>
                        <TableCell><Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'seller' ? 'default' : 'secondary'}>{u.role}</Badge></TableCell>
                        <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select value={u.role} onValueChange={(value) => handleUpdateUserRole(u.userId, value)}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="customer">Customer</SelectItem><SelectItem value="seller">Seller</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select>
                            <Tooltip><TooltipTrigger asChild><Button size="sm" variant="outline" onClick={() => { setSelectedUser(u); setNewPassword(''); setIsPasswordDialogOpen(true); }}><Key className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent>Change Password</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button size="sm" variant="outline" className="text-destructive" onClick={() => setUserToDelete(u)}><Trash2 className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent>Delete User</TooltipContent></Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Change Password</DialogTitle><DialogDescription>Set a new password for {selectedUser?.profile?.fullName || 'user'}.</DialogDescription></DialogHeader><div className="space-y-4 mt-4"><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" /><Button className="w-full" onClick={handleChangePassword} disabled={isUpdatingPassword}>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</Button></div></DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete User?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {userToDelete?.profile?.fullName || 'this user'}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting} className="bg-destructive text-destructive-foreground">{isDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageUsers;

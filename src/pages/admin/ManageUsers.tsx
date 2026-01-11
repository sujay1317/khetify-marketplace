import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Plus, FileBarChart, Upload, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserWithRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
}

const ManageUsers: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddSellerOpen, setIsAddSellerOpen] = useState(false);
  const [sellerForm, setSellerForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    freeDelivery: false
  });
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [shopImagePreview, setShopImagePreview] = useState<string | null>(null);
  const [isCreatingSeller, setIsCreatingSeller] = useState(false);

  const handleShopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShopImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearShopImage = () => {
    setShopImage(null);
    setShopImagePreview(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (rolesError || !rolesData) {
      console.error('Error fetching roles:', rolesError);
      setLoading(false);
      return;
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    const usersWithProfiles = rolesData.map(role => ({
      ...role,
      profile: profilesData?.find(p => p.user_id === role.user_id) || null
    }));

    setUsers(usersWithProfiles as unknown as UserWithRole[]);
    setLoading(false);
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'seller' | 'customer') => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update user role');
    } else {
      toast.success('User role updated');
      fetchUsers();
    }
  };

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) {
      toast.error('Not authenticated');
      return;
    }

    setIsCreatingSeller(true);
    try {
      // First create the seller account
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: sellerForm.email,
          password: sellerForm.password,
          fullName: sellerForm.fullName,
          phone: sellerForm.phone,
          freeDelivery: sellerForm.freeDelivery
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create seller');
      }

      // If shop image is provided, upload it
      if (shopImage && data.user?.id) {
        const fileExt = shopImage.name.split('.').pop();
        const fileName = `${data.user.id}/shop-image.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('shop-images')
          .upload(fileName, shopImage, { upsert: true });

        if (uploadError) {
          console.error('Error uploading shop image:', uploadError);
          toast.error('Seller created but shop image upload failed');
        } else {
          // Get the public URL and update the profile
          const { data: publicUrlData } = supabase.storage
            .from('shop-images')
            .getPublicUrl(fileName);

          await supabase
            .from('profiles')
            .update({ shop_image: publicUrlData.publicUrl })
            .eq('user_id', data.user.id);
        }
      }

      toast.success('Seller created successfully!');
      setIsAddSellerOpen(false);
      setSellerForm({ email: '', password: '', fullName: '', phone: '', freeDelivery: false });
      setShopImage(null);
      setShopImagePreview(null);
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create seller');
    } finally {
      setIsCreatingSeller(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold font-heading">Manage Users</h1>
              </div>
            </div>
            <Dialog open={isAddSellerOpen} onOpenChange={setIsAddSellerOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Seller
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Seller</DialogTitle>
                  <DialogDescription>
                    Create a new seller account with login credentials.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSeller} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input
                      value={sellerForm.fullName}
                      onChange={(e) => setSellerForm({ ...sellerForm, fullName: e.target.value })}
                      placeholder="Seller name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={sellerForm.email}
                      onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
                      placeholder="seller@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      type="tel"
                      value={sellerForm.phone}
                      onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password *</label>
                    <Input
                      type="password"
                      value={sellerForm.password}
                      onChange={(e) => setSellerForm({ ...sellerForm, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                  
                  {/* Shop Image Upload */}
                  <div>
                    <label className="text-sm font-medium">Shop Image</label>
                    {shopImagePreview ? (
                      <div className="relative mt-2">
                        <img 
                          src={shopImagePreview} 
                          alt="Shop preview" 
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={clearShopImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground mt-1">Upload shop image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleShopImageChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Free Delivery Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="freeDelivery"
                      checked={sellerForm.freeDelivery}
                      onCheckedChange={(checked) => 
                        setSellerForm({ ...sellerForm, freeDelivery: checked === true })
                      }
                    />
                    <Label htmlFor="freeDelivery" className="text-sm font-medium cursor-pointer">
                      Free Delivery for all products
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2 ml-6">
                    If checked, all products from this seller will have free delivery
                  </p>

                  <Button type="submit" className="w-full" disabled={isCreatingSeller}>
                    {isCreatingSeller ? 'Creating...' : 'Create Seller Account'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              {user.role === 'admin' ? '👑' : user.role === 'seller' ? '🌾' : '👤'}
                            </div>
                            {user.profile?.full_name || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>{user.profile?.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === 'admin' ? 'destructive' :
                            user.role === 'seller' ? 'default' : 'secondary'
                          }>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.role}
                              onValueChange={(value: 'admin' | 'seller' | 'customer') => handleUpdateUserRole(user.user_id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="seller">Seller</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            {user.role === 'seller' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => navigate(`/admin/seller-report/${user.user_id}`)}
                                  >
                                    <FileBarChart className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Order Report</TooltipContent>
                              </Tooltip>
                            )}
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
    </div>
  );
};

export default ManageUsers;

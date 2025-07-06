import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import UsersTable from './UsersTable';
import apiClient from '@/services/apiClient';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    isActive: true
  });
  const debouncedSearch = useDebounce(searchTerm, 350);

  const createUser = async () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      formData.password.length < 8 ||
      !/\S+@\S+\.\S+/.test(formData.email)
    ) {
      toast.error('Please fill all required fields with valid values (password ≥ 8 chars, valid email).');
      return;
    }
    try {
      console.log('Creating user with:', formData);
      await apiClient.post('/users', formData);
      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      // Trigger table refresh by incrementing the refresh trigger
      // This will cause the table to refetch data and reset to page 1
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error creating user:', error);
      const backendMsg = error?.response?.data?.message;
      toast.error(backendMsg || error.message || 'Failed to create user');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      isActive: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="mb-2">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="password" className="mb-2">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="role" className="mb-2">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="isActive" className="mb-2">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createUser}>Create User</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              aria-label="Search users"
            />
          </div>
        </CardContent>
      </Card>
      {/* Table only reloads on search/page change */}
      <UsersTable search={debouncedSearch} refreshTrigger={refreshTrigger} />
    </div>
  );
} 
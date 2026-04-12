'use client';

import { useState } from 'react';
import { Plus, Trash2, Shield, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { sampleOrganizations } from '@/lib/utils/sampleData';
import { formatDate } from '@/lib/utils/formatters';
import { Profile, UserRole } from '@/types/database';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// Sample users data
const initialUsers: Profile[] = [
  {
    id: '1',
    email: 'admin@carteretfood.org',
    name: 'Council Admin',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'mary@beaufortpantry.org',
    name: 'Mary Johnson',
    role: 'organization',
    organization_id: '1',
    created_at: '2024-01-05T00:00:00Z',
  },
  {
    id: '3',
    email: 'robert@moreheadmeals.org',
    name: 'Robert Smith',
    role: 'organization',
    organization_id: '2',
    created_at: '2024-01-08T00:00:00Z',
  },
];

const roleIcons = {
  admin: Shield,
  organization: Building2,
  public: User,
};

const roleLabels = {
  admin: 'Admin',
  organization: 'Organization',
  public: 'Public',
};

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  organization: 'bg-blue-100 text-blue-800',
  public: 'bg-gray-100 text-gray-800',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('organization');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getOrgName = (id?: string) => {
    if (!id) return '-';
    return sampleOrganizations.find((o) => o.id === id)?.name || 'Unknown';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newUser: Profile = {
      id: String(Date.now()),
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      role: formData.get('role') as UserRole,
      organization_id:
        formData.get('role') === 'organization'
          ? (formData.get('organization_id') as string)
          : undefined,
      created_at: new Date().toISOString(),
    };

    setUsers([...users, newUser]);
    setIsDialogOpen(false);
    toast.success('User created successfully');
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    toast.success('User deleted');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage admin and organization user accounts
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" required placeholder="John Doe" />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="user@example.org"
                />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  name="role"
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedRole === 'organization' && (
                <div>
                  <Label htmlFor="organization_id">Organization *</Label>
                  <Select name="organization_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleOrganizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-yellow-800">
                <strong>Note:</strong> In production, the user will receive an
                email invitation to set their password via Supabase Auth.
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {users.length}
                </p>
              </div>
              <User className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {users.filter((u) => u.role === 'admin').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Organization Users
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {users.filter((u) => u.role === 'organization').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const RoleIcon = roleIcons[user.role];
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>{getOrgName(user.organization_id)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteId(user.id)}
                        disabled={user.id === '1'} // Prevent deleting main admin
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}

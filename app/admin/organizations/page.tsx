'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sampleOrganizations } from '@/lib/utils/sampleData';
import { formatPhone, formatDate } from '@/lib/utils/formatters';
import { OrgForm } from '@/components/forms/OrgForm';
import { OrganizationFormValues } from '@/lib/validations/schemas';
import { toast } from 'sonner';
import { Organization } from '@/types/database';

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>(sampleOrganizations);
  const [search, setSearch] = useState('');
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.town.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      setOrganizations(organizations.filter((o) => o.id !== id));
      toast.success('Organization deleted');
    }
  };

  const handleToggleActive = (org: Organization) => {
    setOrganizations(
      organizations.map((o) =>
        o.id === org.id ? { ...o, is_active: !o.is_active } : o
      )
    );
    toast.success(
      org.is_active ? 'Organization deactivated' : 'Organization activated'
    );
  };

  const handleSubmit = async (data: OrganizationFormValues) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingOrg) {
        setOrganizations(
          organizations.map((o) =>
            o.id === editingOrg.id
              ? {
                  ...o,
                  ...(data as unknown as Partial<Organization>),
                  last_updated: new Date().toISOString(),
                }
              : o
          )
        );
        toast.success('Organization updated');
      } else {
        const newOrg = {
          ...(data as unknown as Omit<Organization, 'id' | 'created_at' | 'last_updated'>),
          id: String(Date.now()),
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as Organization;
        setOrganizations([newOrg, ...organizations]);
        toast.success('Organization created');
      }

      setIsDialogOpen(false);
      setEditingOrg(null);
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 mt-1">
            Manage food assistance organizations
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingOrg(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Town</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-gray-500">{org.address}</div>
                  </div>
                </TableCell>
                <TableCell>{org.town}</TableCell>
                <TableCell>{formatPhone(org.phone)}</TableCell>
                <TableCell>
                  <Badge
                    variant={org.is_active ? 'default' : 'secondary'}
                    className="gap-1"
                  >
                    {org.is_active ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {org.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(org.last_updated)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/organization/${org.id}`}>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Public
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingOrg(org);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(org)}>
                        {org.is_active ? (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(org.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrgs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No organizations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrg ? 'Edit Organization' : 'Add Organization'}
            </DialogTitle>
          </DialogHeader>
          <OrgForm
            organization={editingOrg || undefined}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

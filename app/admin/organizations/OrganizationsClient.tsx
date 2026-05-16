'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  CheckCircle2,
  XCircle,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { OrgForm } from '@/components/forms/OrgForm';
import { OrganizationFormValues } from '@/lib/validations/schemas';
import { Organization } from '@/types/database';
import { formatPhone, formatDate } from '@/lib/utils/formatters';
import {
  createOrganizationAction,
  updateOrganizationAction,
  deleteOrganizationAction,
  toggleOrgActiveAction,
} from './actions';
import { ImportOrganizationsDialog } from './ImportOrganizationsDialog';

interface OrganizationsClientProps {
  initialOrgs: Organization[];
}

export function OrganizationsClient({ initialOrgs }: OrganizationsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState('');
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Organization | null>(null);

  const filteredOrgs = initialOrgs.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.town.toLowerCase().includes(search.toLowerCase())
  );

  const handleFormSubmit = (data: OrganizationFormValues): Promise<void> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        if (editingOrg) {
          const result = await updateOrganizationAction(editingOrg.id, data);
          if (!result.ok) {
            toast.error(result.error);
          } else {
            toast.success('Organization updated');
            setIsFormDialogOpen(false);
            setEditingOrg(null);
            router.refresh();
          }
        } else {
          const result = await createOrganizationAction(data);
          if (!result.ok) {
            toast.error(result.error);
          } else {
            toast.success('Organization created');
            setIsFormDialogOpen(false);
            router.refresh();
          }
        }
        resolve();
      });
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const result = await deleteOrganizationAction(targetId);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success('Organization deleted');
        router.refresh();
      }
    });
  };

  const handleToggleConfirm = () => {
    if (!toggleTarget) return;
    const { id, is_active } = toggleTarget;
    const nextIsActive = !is_active;
    setToggleTarget(null);
    startTransition(async () => {
      const result = await toggleOrgActiveAction(id, nextIsActive);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success(nextIsActive ? 'Organization activated' : 'Organization deactivated');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lighthouse">Organizations</h1>
          <p className="text-driftwood mt-1">Manage food assistance organizations</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-ocean text-ocean hover:bg-seafoam"
            onClick={() => setIsImportDialogOpen(true)}
            disabled={isPending}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import XLS/CSV
          </Button>
          <Button
            className="bg-black hover:bg-neutral-800 text-white"
            onClick={() => {
              setEditingOrg(null);
              setIsFormDialogOpen(true);
            }}
            disabled={isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-driftwood" />
        <Input
          placeholder="Search by name or town..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-shoreline bg-shell focus-visible:ring-ocean"
        />
      </div>

      {/* Table — Actions column is pinned to the right so it stays visible
          when the table needs to scroll horizontally on narrower viewports. */}
      <div className="bg-shell rounded-lg border border-shoreline overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-shoreline bg-sand/70 hover:bg-sand/70">
              <TableHead className="text-lighthouse font-semibold text-xs uppercase tracking-wider whitespace-normal max-w-[320px]">Organization</TableHead>
              <TableHead className="text-lighthouse font-semibold text-xs uppercase tracking-wider">Town</TableHead>
              <TableHead className="text-lighthouse font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Phone</TableHead>
              <TableHead className="text-lighthouse font-semibold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-lighthouse font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Last Updated</TableHead>
              <TableHead
                className="text-lighthouse font-semibold text-xs uppercase tracking-wider text-right pr-4 sticky right-0 bg-sand/95 shadow-[-6px_0_8px_-6px_rgba(27,45,58,0.15)] w-[180px]"
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrgs.map((org) => (
              <TableRow
                key={org.id}
                className="group border-shoreline hover:bg-seafoam/30 transition-colors"
              >
                <TableCell className="whitespace-normal max-w-[320px]">
                  <div>
                    <div className="font-medium text-lighthouse">{org.name}</div>
                    <div className="text-sm text-driftwood">{org.address}</div>
                  </div>
                </TableCell>
                <TableCell className="text-body">{org.town}</TableCell>
                <TableCell className="text-body hidden md:table-cell">{formatPhone(org.phone)}</TableCell>
                <TableCell>
                  <Badge
                    variant={org.is_active ? 'default' : 'secondary'}
                    className={
                      org.is_active
                        ? 'bg-seafoam text-lighthouse border-none gap-1'
                        : 'bg-sand text-driftwood border-shoreline gap-1'
                    }
                  >
                    {org.is_active ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {org.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-driftwood hidden lg:table-cell">
                  {formatDate(org.last_updated)}
                </TableCell>
                <TableCell className="pr-2 sticky right-0 bg-shell group-hover:bg-[#dbf0ee] transition-colors shadow-[-6px_0_8px_-6px_rgba(27,45,58,0.15)]">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-driftwood hover:text-ocean hover:bg-seafoam"
                      title="View public page"
                    >
                      <Link
                        href={`/organization/${org.id}`}
                        target="_blank"
                        aria-label={`View public page for ${org.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => {
                        setEditingOrg(org);
                        setIsFormDialogOpen(true);
                      }}
                      className="h-9 w-9 text-driftwood hover:text-ocean hover:bg-seafoam"
                      title="Edit organization"
                      aria-label={`Edit ${org.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => setToggleTarget(org)}
                      className="h-9 w-9 text-driftwood hover:text-ocean hover:bg-seafoam"
                      title={org.is_active ? 'Deactivate' : 'Activate'}
                      aria-label={
                        org.is_active
                          ? `Deactivate ${org.name}`
                          : `Activate ${org.name}`
                      }
                    >
                      {org.is_active ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => setDeleteTarget(org)}
                      className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Delete organization"
                      aria-label={`Delete ${org.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrgs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-driftwood">
                  No organizations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-shoreline">
          <DialogHeader>
            <DialogTitle className="text-lighthouse">
              {editingOrg ? 'Edit Organization' : 'Add Organization'}
            </DialogTitle>
          </DialogHeader>
          <OrgForm
            organization={editingOrg || undefined}
            onSubmit={handleFormSubmit}
            isLoading={isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md border-shoreline">
          <DialogHeader>
            <DialogTitle className="text-lighthouse">Delete organization?</DialogTitle>
          </DialogHeader>
          <p className="text-body text-sm">
            <span className="font-semibold">{deleteTarget?.name}</span> will be permanently
            removed from the directory. This cannot be undone.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              className="border-shoreline"
              onClick={() => setDeleteTarget(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <ImportOrganizationsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />

      {/* Toggle Active Confirm Dialog */}
      <Dialog open={!!toggleTarget} onOpenChange={(open) => !open && setToggleTarget(null)}>
        <DialogContent className="max-w-md border-shoreline">
          <DialogHeader>
            <DialogTitle className="text-lighthouse">
              {toggleTarget?.is_active ? 'Deactivate' : 'Activate'} organization?
            </DialogTitle>
          </DialogHeader>
          <p className="text-body text-sm">
            <span className="font-semibold">{toggleTarget?.name}</span> will be{' '}
            {toggleTarget?.is_active
              ? 'hidden from the public directory'
              : 'made visible in the public directory'}
            .
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              className="border-shoreline"
              onClick={() => setToggleTarget(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-ocean hover:bg-ocean-deep text-white"
              onClick={handleToggleConfirm}
              disabled={isPending}
            >
              {toggleTarget?.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

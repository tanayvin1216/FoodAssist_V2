'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, HandHeart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { VolunteerNeed, Organization } from '@/types/database';
import { volunteerNeedSchema, type VolunteerNeedFormValues } from '@/lib/validations/schemas';
import {
  createVolunteerNeedAction,
  updateVolunteerNeedAction,
  deleteVolunteerNeedAction,
} from './actions';

interface VolunteersClientProps {
  initialVolunteerNeeds: VolunteerNeed[];
  organizations: Organization[];
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildDefaultValues(need?: VolunteerNeed): VolunteerNeedFormValues {
  return {
    organization_id: need?.organization_id ?? '',
    title: need?.title ?? '',
    description: need?.description ?? '',
    needed_date: need?.needed_date ?? '',
    needed_skills: need?.needed_skills ?? [],
    time_commitment: need?.time_commitment ?? '',
    is_active: need?.is_active ?? true,
    contact_email: need?.contact_email ?? '',
  };
}

export function VolunteersClient({ initialVolunteerNeeds, organizations }: VolunteersClientProps) {
  const router = useRouter();
  const [needs, setNeeds] = useState<VolunteerNeed[]>(initialVolunteerNeeds);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState<VolunteerNeed | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  const createForm = useForm<VolunteerNeedFormValues>({
    resolver: zodResolver(volunteerNeedSchema),
    defaultValues: buildDefaultValues(),
  });

  const editForm = useForm<VolunteerNeedFormValues>({
    resolver: zodResolver(volunteerNeedSchema),
    defaultValues: buildDefaultValues(),
  });

  const filteredNeeds =
    filterOrg === 'all'
      ? needs
      : needs.filter((n) => n.organization_id === filterOrg);

  const getOrgName = (id: string) =>
    organizations.find((o) => o.id === id)?.name ?? 'Unknown';

  function handleCreate(values: VolunteerNeedFormValues) {
    startTransition(async () => {
      const result = await createVolunteerNeedAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      createForm.reset(buildDefaultValues());
      setIsCreateOpen(false);
      toast.success('Volunteer need created.');
      router.refresh();
    });
  }

  function openEdit(need: VolunteerNeed) {
    setEditingNeed(need);
    editForm.reset(buildDefaultValues(need));
  }

  function handleEdit(values: VolunteerNeedFormValues) {
    if (!editingNeed) return;
    startTransition(async () => {
      const result = await updateVolunteerNeedAction(editingNeed.id, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setEditingNeed(null);
      toast.success('Volunteer need updated.');
      router.refresh();
    });
  }

  function confirmDelete() {
    const id = pendingDeleteId;
    if (!id) return;
    startTransition(async () => {
      const result = await deleteVolunteerNeedAction(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setPendingDeleteId(null);
      setNeeds((prev) => prev.filter((n) => n.id !== id));
      toast.success('Volunteer need deleted.');
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B2D3A' }}>
            Volunteer Needs
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8C7E72' }}>
            Manage volunteer postings across all organizations
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="min-h-11"
              style={{ backgroundColor: '#0D7C8F', color: '#ffffff' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Volunteer Need
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle style={{ color: '#1B2D3A' }}>New Volunteer Need</DialogTitle>
            </DialogHeader>
            <VolunteerNeedForm
              form={createForm}
              organizations={organizations}
              onSubmit={handleCreate}
              isPending={isPending}
              onCancel={() => setIsCreateOpen(false)}
              submitLabel="Create"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary + filter */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card style={{ borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#8C7E72' }}>
                  Total Postings
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
                  {filteredNeeds.length}
                </p>
              </div>
              <HandHeart className="h-8 w-8" style={{ color: '#0D7C8F' }} />
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#8C7E72' }}>
                  Active
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
                  {filteredNeeds.filter((n) => n.is_active).length}
                </p>
              </div>
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: '#16A34A' }}
              />
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2" style={{ color: '#8C7E72' }}>
              Filter by Organization
            </p>
            <Select value={filterOrg} onValueChange={setFilterOrg}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card style={{ borderColor: '#C4B8AD' }}>
        <CardHeader>
          <CardTitle style={{ color: '#1B2D3A' }}>Postings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Needed By</TableHead>
                <TableHead className="w-[90px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNeeds.map((need) => (
                <TableRow key={need.id}>
                  <TableCell className="font-medium max-w-[180px] truncate">
                    {need.title}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate">
                    {need.organization?.name ?? getOrgName(need.organization_id)}
                  </TableCell>
                  <TableCell style={{ color: '#8C7E72' }}>
                    {formatDate(need.posted_date)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={
                        need.is_active
                          ? { borderColor: '#16A34A', color: '#16A34A' }
                          : { borderColor: '#C4B8AD', color: '#8C7E72' }
                      }
                    >
                      {need.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ color: '#8C7E72' }}>
                    {formatDate(need.needed_date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        onClick={() => openEdit(need)}
                        aria-label="Edit volunteer need"
                      >
                        <Pencil className="w-4 h-4" style={{ color: '#0D7C8F' }} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setPendingDeleteId(need.id)}
                        aria-label="Delete volunteer need"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredNeeds.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8"
                    style={{ color: '#8C7E72' }}
                  >
                    No volunteer needs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog
        open={editingNeed !== null}
        onOpenChange={(open) => {
          if (!open) setEditingNeed(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ color: '#1B2D3A' }}>Edit Volunteer Need</DialogTitle>
          </DialogHeader>
          <VolunteerNeedForm
            form={editForm}
            organizations={organizations}
            onSubmit={handleEdit}
            isPending={isPending}
            onCancel={() => setEditingNeed(null)}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#1B2D3A' }}>Delete volunteer need?</DialogTitle>
            <DialogDescription style={{ color: '#8C7E72' }}>
              This cannot be undone. The posting will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setPendingDeleteId(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? 'Deleting…' : 'Delete posting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Shared form component used by both create and edit dialogs ----

interface VolunteerNeedFormProps {
  form: ReturnType<typeof useForm<VolunteerNeedFormValues>>;
  organizations: Organization[];
  onSubmit: (values: VolunteerNeedFormValues) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel: string;
}

function VolunteerNeedForm({
  form,
  organizations,
  onSubmit,
  isPending,
  onCancel,
  submitLabel,
}: VolunteerNeedFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="organization_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Food Pantry Helper" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Describe the volunteer role..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="needed_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Needed By</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time_commitment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Commitment</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 4 hrs/week" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="volunteer@example.org" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(val === 'true')}
                value={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            style={{ backgroundColor: '#0D7C8F', color: '#ffffff' }}
          >
            {isPending ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { volunteerNeedSchema, type VolunteerNeedFormValues } from '@/lib/validations/schemas';
import type { VolunteerNeed } from '@/types/database';
import {
  createOwnVolunteerNeedAction,
  updateOwnVolunteerNeedAction,
  deleteOwnVolunteerNeedAction,
} from './actions';

interface PortalVolunteersClientProps {
  initialNeeds: VolunteerNeed[];
}

type OwnFormValues = Omit<VolunteerNeedFormValues, 'organization_id'>;

const ownSchema = volunteerNeedSchema.omit({ organization_id: true });

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildDefaults(need?: VolunteerNeed): OwnFormValues {
  return {
    title: need?.title ?? '',
    description: need?.description ?? '',
    needed_date: need?.needed_date ?? '',
    needed_skills: need?.needed_skills ?? [],
    time_commitment: need?.time_commitment ?? '',
    is_active: need?.is_active ?? true,
    contact_email: need?.contact_email ?? '',
  };
}

export function PortalVolunteersClient({ initialNeeds }: PortalVolunteersClientProps) {
  const router = useRouter();
  const [needs, setNeeds] = useState<VolunteerNeed[]>(initialNeeds);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState<VolunteerNeed | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const createForm = useForm<OwnFormValues>({
    resolver: zodResolver(ownSchema),
    defaultValues: buildDefaults(),
  });

  const editForm = useForm<OwnFormValues>({
    resolver: zodResolver(ownSchema),
    defaultValues: buildDefaults(),
  });

  function handleCreate(values: OwnFormValues) {
    startTransition(async () => {
      const result = await createOwnVolunteerNeedAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      createForm.reset(buildDefaults());
      setIsCreateOpen(false);
      toast.success('Volunteer need posted.');
      router.refresh();
    });
  }

  function openEdit(need: VolunteerNeed) {
    setEditingNeed(need);
    editForm.reset(buildDefaults(need));
  }

  function handleEdit(values: OwnFormValues) {
    if (!editingNeed) return;
    startTransition(async () => {
      const result = await updateOwnVolunteerNeedAction(editingNeed.id, values);
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
      const result = await deleteOwnVolunteerNeedAction(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setNeeds((prev) => prev.filter((n) => n.id !== id));
      setPendingDeleteId(null);
      toast.success('Volunteer need removed.');
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
            Post and manage volunteer opportunities for your organization
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="min-h-11"
              style={{ backgroundColor: '#0D7C8F', color: '#ffffff' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle style={{ color: '#1B2D3A' }}>New Volunteer Need</DialogTitle>
            </DialogHeader>
            <VolunteerNeedForm
              form={createForm}
              onSubmit={handleCreate}
              isPending={isPending}
              onCancel={() => setIsCreateOpen(false)}
              submitLabel="Post"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card style={{ borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <p className="text-sm font-medium" style={{ color: '#8C7E72' }}>
              Total Postings
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: '#1B2D3A' }}>
              {needs.length}
            </p>
          </CardContent>
        </Card>
        <Card style={{ borderColor: '#C4B8AD' }}>
          <CardContent className="pt-6">
            <p className="text-sm font-medium" style={{ color: '#8C7E72' }}>
              Active
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: '#16A34A' }}>
              {needs.filter((n) => n.is_active).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      {needs.length === 0 ? (
        <Card style={{ borderColor: '#C4B8AD' }}>
          <CardContent className="py-12 text-center">
            <p className="mb-4" style={{ color: '#8C7E72' }}>
              No volunteer opportunities posted yet.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              style={{ backgroundColor: '#0D7C8F', color: '#ffffff' }}
              className="min-h-11"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Your First Opportunity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {needs.map((need) => (
            <Card key={need.id} style={{ borderColor: '#C4B8AD' }}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate" style={{ color: '#1B2D3A' }}>
                      {need.title}
                    </CardTitle>
                    <p className="text-xs mt-0.5" style={{ color: '#8C7E72' }}>
                      Posted {formatDate(need.posted_date)}
                    </p>
                  </div>
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
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm" style={{ color: '#4A5568' }}>
                  {need.description}
                </p>

                {need.time_commitment && (
                  <p className="text-sm" style={{ color: '#8C7E72' }}>
                    <span className="font-medium">Time:</span> {need.time_commitment}
                  </p>
                )}

                {need.contact_email && (
                  <p className="text-sm" style={{ color: '#8C7E72' }}>
                    <span className="font-medium">Contact:</span> {need.contact_email}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => openEdit(need)}
                    style={{ borderColor: '#C4B8AD', color: '#1B2D3A' }}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setPendingDeleteId(need.id)}
                    className="border-red-200 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            onSubmit={handleEdit}
            isPending={isPending}
            onCancel={() => setEditingNeed(null)}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#1B2D3A' }}>Remove volunteer need?</DialogTitle>
            <DialogDescription style={{ color: '#8C7E72' }}>
              This cannot be undone. The posting will be permanently removed from the public directory.
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
              {isPending ? 'Removing…' : 'Remove posting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Shared form (no organization_id field — injected server-side) ----

interface VolunteerNeedFormProps {
  form: ReturnType<typeof useForm<OwnFormValues>>;
  onSubmit: (values: OwnFormValues) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel: string;
}

function VolunteerNeedForm({
  form,
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
                <Input
                  type="email"
                  placeholder="volunteer@example.org"
                  {...field}
                  value={field.value ?? ''}
                />
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
                  <SelectItem value="true">Active — visible to public</SelectItem>
                  <SelectItem value="false">Inactive — hidden from public</SelectItem>
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

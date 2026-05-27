'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { volunteerNeedSchema } from '@/lib/validations/schemas';
import type { VolunteerNeed } from '@/types/database';
import {
  createVolunteerNeedAction,
  updateVolunteerNeedAction,
  deleteVolunteerNeedAction,
} from '@/app/admin/volunteers/actions';

// The org id is supplied by context (the org being edited / created), so the
// editor itself only deals with the need's own fields.
const needEditorSchema = volunteerNeedSchema.omit({ organization_id: true });
type NeedValues = z.infer<typeof needEditorSchema>;

// A staged need carries a client-only id so the parent can render and reorder
// the list before any of them have a database id.
export interface StagedVolunteerNeed extends NeedValues {
  localId: string;
}

interface VolunteerNeedsSectionProps {
  // Present when editing an existing org → each change persists immediately.
  // Absent when creating a new org → changes are staged and bubbled up via
  // onStagedNeedsChange so the parent can save them after the org is created.
  organizationId?: string;
  initialNeeds?: VolunteerNeed[];
  onStagedNeedsChange?: (needs: StagedVolunteerNeed[]) => void;
}

type EditableNeed = {
  localId: string;
  persistedId?: string;
  values: NeedValues;
};

const NEW_NEED_ID = '__new__';

function toValues(need?: VolunteerNeed): NeedValues {
  return {
    title: need?.title ?? '',
    description: need?.description ?? '',
    needed_date: need?.needed_date ?? '',
    needed_skills: need?.needed_skills ?? [],
    time_commitment: need?.time_commitment ?? '',
    is_active: need?.is_active ?? true,
    contact_name: need?.contact_name ?? '',
    contact_email: need?.contact_email ?? '',
    contact_phone: need?.contact_phone ?? '',
  };
}

function newLocalId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function VolunteerNeedsSection({
  organizationId,
  initialNeeds = [],
  onStagedNeedsChange,
}: VolunteerNeedsSectionProps) {
  const isEditing = Boolean(organizationId);
  const [items, setItems] = useState<EditableNeed[]>(() =>
    initialNeeds.map((need) => ({
      localId: need.id,
      persistedId: need.id,
      values: toValues(need),
    }))
  );
  // localId currently open in the editor, NEW_NEED_ID for a fresh one, or null.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editorForm = useForm<NeedValues>({
    resolver: zodResolver(needEditorSchema),
    defaultValues: toValues(),
  });

  // In create mode, keep the parent in sync so it can persist these once the
  // organization row exists.
  useEffect(() => {
    if (isEditing) return;
    onStagedNeedsChange?.(
      items.map((item) => ({ localId: item.localId, ...item.values }))
    );
  }, [items, isEditing, onStagedNeedsChange]);

  function openNew() {
    editorForm.reset(toValues());
    setConfirmingDeleteId(null);
    setEditingId(NEW_NEED_ID);
  }

  function openEdit(item: EditableNeed) {
    editorForm.reset(item.values);
    setConfirmingDeleteId(null);
    setEditingId(item.localId);
  }

  function closeEditor() {
    setEditingId(null);
  }

  function handleSave(values: NeedValues) {
    const isNew = editingId === NEW_NEED_ID;

    // Create mode: stage locally, no server round-trip.
    if (!isEditing) {
      setItems((prev) =>
        isNew
          ? [...prev, { localId: newLocalId(), values }]
          : prev.map((item) =>
              item.localId === editingId ? { ...item, values } : item
            )
      );
      closeEditor();
      return;
    }

    // Edit mode: persist immediately against the existing organization.
    startTransition(async () => {
      if (isNew) {
        const result = await createVolunteerNeedAction({
          ...values,
          organization_id: organizationId!,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        setItems((prev) => [
          ...prev,
          { localId: result.id, persistedId: result.id, values },
        ]);
        toast.success('Volunteer need added.');
      } else {
        const target = items.find((item) => item.localId === editingId);
        if (!target?.persistedId) return;
        const result = await updateVolunteerNeedAction(target.persistedId, {
          ...values,
          organization_id: organizationId!,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        setItems((prev) =>
          prev.map((item) =>
            item.localId === editingId ? { ...item, values } : item
          )
        );
        toast.success('Volunteer need updated.');
      }
      closeEditor();
    });
  }

  function handleDelete(item: EditableNeed) {
    setConfirmingDeleteId(null);

    if (!isEditing || !item.persistedId) {
      setItems((prev) => prev.filter((i) => i.localId !== item.localId));
      return;
    }

    startTransition(async () => {
      const result = await deleteVolunteerNeedAction(item.persistedId!);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setItems((prev) => prev.filter((i) => i.localId !== item.localId));
      toast.success('Volunteer need removed.');
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-driftwood" />
          <CardTitle>Volunteer Needs</CardTitle>
        </div>
        <p className="text-sm text-driftwood">
          Roles this organization needs help with. These appear on the public
          Volunteers page.
          {!isEditing && ' They are saved when you create the organization.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && editingId === null && (
          <p className="text-sm text-driftwood">No volunteer needs added yet.</p>
        )}

        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.localId}
              className="rounded-lg border border-shoreline bg-sand/40 p-3"
            >
              {editingId === item.localId ? (
                <NeedEditor
                  form={editorForm}
                  onSave={handleSave}
                  onCancel={closeEditor}
                  isPending={isPending}
                  submitLabel="Save need"
                />
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lighthouse">
                        {item.values.title || 'Untitled need'}
                      </span>
                      {!item.values.is_active && (
                        <span className="text-xs text-driftwood">(inactive)</span>
                      )}
                    </div>
                    {item.values.description && (
                      <p className="text-sm text-body line-clamp-2">
                        {item.values.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-driftwood hover:text-ocean hover:bg-seafoam"
                      onClick={() => openEdit(item)}
                      disabled={isPending}
                      aria-label={`Edit ${item.values.title || 'volunteer need'}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setConfirmingDeleteId(item.localId)}
                      disabled={isPending}
                      aria-label={`Remove ${item.values.title || 'volunteer need'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {confirmingDeleteId === item.localId && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-red-50 p-2">
                  <span className="text-sm text-red-700">Remove this need?</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-shoreline"
                      onClick={() => setConfirmingDeleteId(null)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleDelete(item)}
                      disabled={isPending}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {editingId === NEW_NEED_ID && (
          <div className="rounded-lg border border-shoreline bg-sand/40 p-3">
            <NeedEditor
              form={editorForm}
              onSave={handleSave}
              onCancel={closeEditor}
              isPending={isPending}
              submitLabel="Add need"
            />
          </div>
        )}

        {editingId === null && (
          <Button
            type="button"
            variant="outline"
            className="border-ocean text-ocean hover:bg-seafoam"
            onClick={openNew}
            disabled={isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add volunteer need
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface NeedEditorProps {
  form: ReturnType<typeof useForm<NeedValues>>;
  onSave: (values: NeedValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

function NeedEditor({ form, onSave, onCancel, isPending, submitLabel }: NeedEditorProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    handleSubmit,
  } = form;
  const isActive = watch('is_active');

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="need-title">Title *</Label>
        <Input id="need-title" placeholder="e.g. Food Pantry Helper" {...register('title')} />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="need-description">Description *</Label>
        <Textarea
          id="need-description"
          rows={3}
          placeholder="Describe the volunteer role..."
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="need-date">Needed by</Label>
          <Input id="need-date" type="date" {...register('needed_date')} />
        </div>
        <div>
          <Label htmlFor="need-time">Time commitment</Label>
          <Input id="need-time" placeholder="e.g. 4 hrs/week" {...register('time_commitment')} />
        </div>
      </div>

      <div>
        <Label htmlFor="need-contact-name">Contact name</Label>
        <Input
          id="need-contact-name"
          placeholder="e.g. Jane Doe, Volunteer Coordinator"
          {...register('contact_name')}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="need-contact-email">Contact email</Label>
          <Input
            id="need-contact-email"
            type="email"
            placeholder="volunteer@example.org"
            {...register('contact_email')}
          />
          {errors.contact_email && (
            <p className="text-sm text-red-600 mt-1">{errors.contact_email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="need-contact-phone">Contact phone</Label>
          <Input
            id="need-contact-phone"
            type="tel"
            placeholder="(252) 555-0100"
            {...register('contact_phone')}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="need-active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked === true)}
        />
        <Label htmlFor="need-active" className="text-sm font-normal">
          Show on the public Volunteers page
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          className="border-shoreline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        {/* type="button" + handleSubmit avoids submitting the parent OrgForm. */}
        <Button
          type="button"
          className="bg-ocean hover:bg-ocean-deep text-white"
          onClick={handleSubmit(onSave)}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
}

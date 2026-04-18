'use server';

import { revalidatePath } from 'next/cache';
import { requireOrganization } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import {
  getVolunteerNeeds,
  createVolunteerNeed,
  updateVolunteerNeed,
  deleteVolunteerNeed,
} from '@/lib/supabase/queries';
import type { VolunteerNeedFormValues } from '@/lib/validations/schemas';
import type { VolunteerNeedFormData } from '@/types/database';

function revalidateAll(): void {
  revalidatePath('/portal/volunteers');
  revalidatePath('/portal');
  revalidatePath('/volunteers');
}

export async function createOwnVolunteerNeedAction(
  data: Omit<VolunteerNeedFormValues, 'organization_id'>
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const ctx = await requireOrganization();
  try {
    const supabase = await createClient();
    const payload: VolunteerNeedFormData = {
      ...(data as Omit<VolunteerNeedFormData, 'organization_id'>),
      organization_id: ctx.organizationId,
    };
    const need = await createVolunteerNeed(supabase, payload);
    revalidateAll();
    return { ok: true, id: need.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: `Unable to create volunteer need: ${message}` };
  }
}

export async function updateOwnVolunteerNeedAction(
  id: string,
  data: Partial<Omit<VolunteerNeedFormValues, 'organization_id'>>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await requireOrganization();
  try {
    const supabase = await createClient();
    const existing = await getVolunteerNeeds(supabase, ctx.organizationId, false);
    const owns = existing.some((n) => n.id === id);
    if (!owns) {
      return { ok: false, error: 'Not your volunteer need.' };
    }
    await updateVolunteerNeed(
      supabase,
      id,
      data as Partial<VolunteerNeedFormData>
    );
    revalidateAll();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: `Unable to update volunteer need: ${message}` };
  }
}

export async function deleteOwnVolunteerNeedAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await requireOrganization();
  try {
    const supabase = await createClient();
    const existing = await getVolunteerNeeds(supabase, ctx.organizationId, false);
    const owns = existing.some((n) => n.id === id);
    if (!owns) {
      return { ok: false, error: 'Not your volunteer need.' };
    }
    await deleteVolunteerNeed(supabase, id);
    revalidateAll();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: `Unable to delete volunteer need: ${message}` };
  }
}

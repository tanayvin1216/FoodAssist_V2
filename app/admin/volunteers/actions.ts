'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import {
  createVolunteerNeed,
  updateVolunteerNeed,
  deleteVolunteerNeed,
} from '@/lib/supabase/queries';
import type { VolunteerNeedFormValues } from '@/lib/validations/schemas';
import type { VolunteerNeedFormData } from '@/types/database';

export async function createVolunteerNeedAction(
  data: VolunteerNeedFormValues
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const supabase = await createClient();
    const need = await createVolunteerNeed(supabase, data as unknown as VolunteerNeedFormData);
    revalidatePath('/admin/volunteers');
    revalidatePath('/volunteers');
    return { ok: true, id: need.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: `Unable to create volunteer need: ${message}` };
  }
}

export async function updateVolunteerNeedAction(
  id: string,
  data: Partial<VolunteerNeedFormValues>
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const supabase = await createClient();
    await updateVolunteerNeed(supabase, id, data as unknown as Partial<VolunteerNeedFormData>);
    revalidatePath('/admin/volunteers');
    revalidatePath('/volunteers');
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: `Unable to update volunteer need: ${message}` };
  }
}

export async function deleteVolunteerNeedAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const supabase = await createClient();
    await deleteVolunteerNeed(supabase, id);
    revalidatePath('/admin/volunteers');
    revalidatePath('/volunteers');
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: `Unable to delete volunteer need: ${message}` };
  }
}

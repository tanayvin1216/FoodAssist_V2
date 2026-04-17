'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/lib/supabase/queries';
import { OrganizationFormValues } from '@/lib/validations/schemas';
import { OrganizationFormData } from '@/types/database';

export async function createOrganizationAction(
  data: OrganizationFormValues
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const org = await createOrganization(supabase, data as unknown as OrganizationFormData);
    revalidatePath('/admin/organizations');
    revalidatePath('/');
    return { ok: true, id: org.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: `Unable to create organization: ${message}` };
  }
}

export async function updateOrganizationAction(
  id: string,
  data: Partial<OrganizationFormValues>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    await updateOrganization(supabase, id, data as unknown as Partial<OrganizationFormData>);
    revalidatePath('/admin/organizations');
    revalidatePath('/');
    revalidatePath(`/organization/${id}`);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: `Unable to update organization: ${message}` };
  }
}

export async function deleteOrganizationAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    await deleteOrganization(supabase, id);
    revalidatePath('/admin/organizations');
    revalidatePath('/');
    revalidatePath(`/organization/${id}`);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: `Unable to delete organization: ${message}` };
  }
}

export async function toggleOrgActiveAction(
  id: string,
  nextIsActive: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    await updateOrganization(supabase, id, { is_active: nextIsActive } as Partial<OrganizationFormData>);
    revalidatePath('/admin/organizations');
    revalidatePath('/');
    revalidatePath(`/organization/${id}`);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      ok: false,
      error: `Unable to ${nextIsActive ? 'activate' : 'deactivate'} organization: ${message}`,
    };
  }
}

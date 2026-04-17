'use server';

import { revalidatePath } from 'next/cache';
import { requireOrganization } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { updateOrganization } from '@/lib/supabase/queries';
import { OrganizationFormValues } from '@/lib/validations/schemas';
import { OrganizationFormData } from '@/types/database';

/**
 * Update the authenticated organization user's own record.
 * `requireOrganization()` is called BEFORE the try block so unauthorized
 * access hard-redirects rather than returning a soft error.
 * The UPDATE is scoped to ctx.organizationId — never a client-supplied id.
 * RLS "Orgs update own record" is the hard backstop enforced at DB level.
 */
export async function updateOwnOrganizationAction(
  data: Partial<OrganizationFormValues>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await requireOrganization();
  try {
    const supabase = await createClient();
    await updateOrganization(
      supabase,
      ctx.organizationId,
      data as unknown as Partial<OrganizationFormData>
    );
    revalidatePath('/portal/profile');
    revalidatePath('/portal');
    revalidatePath('/');
    revalidatePath(`/organization/${ctx.organizationId}`);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: `Unable to update profile: ${message}` };
  }
}

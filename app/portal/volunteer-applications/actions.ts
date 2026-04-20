'use server';

import { revalidatePath } from 'next/cache';
import { requireOrganization } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import {
  volunteerApplicationReviewSchema,
  type VolunteerApplicationReviewValues,
} from '@/lib/validations/schemas';

// Update status + notes for an application. RLS already restricts the
// UPDATE to rows targeted at this org (direct or via its volunteer_needs),
// so we don't need to re-check ownership here.
export async function reviewApplicationAction(
  data: VolunteerApplicationReviewValues,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireOrganization();
  const parsed = volunteerApplicationReviewSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { id, status, review_notes } = parsed.data;
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('volunteer_applications')
      .update({
        status,
        review_notes: review_notes || null,
        reviewed_by: session.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/portal/volunteer-applications');
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: message };
  }
}

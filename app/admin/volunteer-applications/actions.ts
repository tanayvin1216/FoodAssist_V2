'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import {
  volunteerApplicationReviewSchema,
  type VolunteerApplicationReviewValues,
} from '@/lib/validations/schemas';

export async function adminReviewApplicationAction(
  data: VolunteerApplicationReviewValues,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireAdmin();
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
    revalidatePath('/admin/volunteer-applications');
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: message };
  }
}

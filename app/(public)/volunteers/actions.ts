'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  volunteerApplicationSchema,
  type VolunteerApplicationFormValues,
} from '@/lib/validations/schemas';

// Public endpoint — no auth required. RLS on volunteer_applications
// permits INSERT for anon + authenticated, and blocks SELECT for both
// unless the caller is the target org or an admin.
export async function submitVolunteerApplicationAction(
  data: VolunteerApplicationFormValues,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = volunteerApplicationSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? 'Invalid application' };
  }

  const v = parsed.data;
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('volunteer_applications').insert({
      volunteer_need_id: v.volunteer_need_id || null,
      organization_id: v.organization_id || null,
      applicant_name: v.applicant_name,
      applicant_email: v.applicant_email,
      applicant_phone: v.applicant_phone || null,
      willing_to_do: v.willing_to_do,
      hours_per_week: v.hours_per_week || null,
      availability: v.availability || null,
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    revalidatePath('/portal/volunteer-applications');
    revalidatePath('/admin/volunteer-applications');
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: message };
  }
}

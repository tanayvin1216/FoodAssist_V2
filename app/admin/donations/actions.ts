'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import {
  createCouncilDonation,
  deleteCouncilDonation,
} from '@/lib/supabase/queries';
import type { CouncilDonationFormValues } from '@/lib/validations/schemas';
import type { CouncilDonationFormData } from '@/types/database';

export async function createDonationAction(
  data: CouncilDonationFormValues
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const session = await requireAdmin();

  if (!data.organization_id) {
    return { ok: false, error: 'Organization is required.' };
  }

  try {
    const supabase = await createClient();

    // ADR-003: recorded_by is always server-injected — never from the client payload.
    const insertData: CouncilDonationFormData = {
      organization_id: data.organization_id,
      donation_date: data.donation_date,
      donation_type: data.donation_type,
      description: data.description,
      amount: data.amount,
      recorded_by: session.profile?.name ?? session.email,
    };

    const donation = await createCouncilDonation(supabase, insertData);

    revalidatePath('/admin/donations');
    revalidatePath('/admin');

    return { ok: true, id: donation.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to record donation.';
    return { ok: false, error: message };
  }
}

export async function deleteDonationAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();

  try {
    const supabase = await createClient();
    await deleteCouncilDonation(supabase, id);

    revalidatePath('/admin/donations');
    revalidatePath('/admin');

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete donation.';
    return { ok: false, error: message };
  }
}

'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { UserRole } from '@/types/database';

// ─── Invite ──────────────────────────────────────────────────────────────────

export async function inviteUserAction(input: {
  email: string;
  name: string;
  role: 'admin' | 'organization';
  organizationId?: string;
}): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  await requireAdmin();

  if (input.role === 'organization' && !input.organizationId) {
    return { ok: false, error: 'Organization required when inviting an organization user.' };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return {
      ok: false,
      error:
        'Admin user invites are not configured yet. Ask your deployer to add SUPABASE_SERVICE_ROLE_KEY.',
    };
  }

  const { data: inviteData, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(input.email, {
      data: { name: input.name },
    });

  if (inviteError || !inviteData?.user) {
    // Map GoTrue error messages to user-safe equivalents
    const raw = inviteError?.message ?? '';
    if (raw.toLowerCase().includes('already been registered') || raw.toLowerCase().includes('already exists')) {
      return { ok: false, error: 'A user with that email already exists.' };
    }
    if (raw.toLowerCase().includes('invalid email')) {
      return { ok: false, error: 'The email address provided is not valid.' };
    }
    if (raw.toLowerCase().includes('rate limit')) {
      return { ok: false, error: 'Too many invites sent recently. Please wait a moment and try again.' };
    }
    return { ok: false, error: 'Failed to send the invitation. Please try again.' };
  }

  const userId = inviteData.user.id;

  // The handle_new_user trigger inserts a profile with role='public'.
  // Update it to the correct role and org assignment.
  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      role: input.role,
      organization_id: input.role === 'organization' ? input.organizationId : null,
    })
    .eq('id', userId);

  if (updateError) {
    // Invite went out but profile update failed — log and surface
    return {
      ok: false,
      error: `Invite sent, but could not set the user role. Contact your database administrator.`,
    };
  }

  revalidatePath('/admin/users');
  return { ok: true, userId };
}

// ─── Update Role ─────────────────────────────────────────────────────────────

export async function updateUserRoleAction(input: {
  userId: string;
  nextRole: 'admin' | 'organization' | 'public';
  organizationId?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireAdmin();

  if (input.nextRole === 'organization' && !input.organizationId) {
    return { ok: false, error: 'Organization required when setting role to organization.' };
  }

  // Self-demote guard: the lone admin must not lock themselves out
  if (input.userId === session.id && input.nextRole !== 'admin') {
    return { ok: false, error: 'You cannot demote yourself.' };
  }

  const supabase = await createClient();

  const updatePayload: { role: UserRole; organization_id: string | null } = {
    role: input.nextRole,
    organization_id: input.nextRole === 'organization' ? (input.organizationId ?? null) : null,
  };

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', input.userId);

  if (error) {
    // Surface the trigger exception cleanly
    if (error.message.includes('Only admins can change role')) {
      return { ok: false, error: 'Permission denied: only admins can change roles.' };
    }
    return { ok: false, error: 'Failed to update user role. Please try again.' };
  }

  revalidatePath('/admin/users');
  return { ok: true };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteUserAction(
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireAdmin();

  if (userId === session.id) {
    return { ok: false, error: 'You cannot delete your own account.' };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return {
      ok: false,
      error:
        'Admin user deletion is not configured yet. Ask your deployer to add SUPABASE_SERVICE_ROLE_KEY.',
    };
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return { ok: false, error: 'Failed to delete the user. Please try again.' };
  }

  revalidatePath('/admin/users');
  return { ok: true };
}

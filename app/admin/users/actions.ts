'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { UserRole } from '@/types/database';

// ─── Create User ──────────────────────────────────────────────────────────────

export async function createUserAction(input: {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'organization';
  organizationId?: string;
}): Promise<{ ok: true; userId: string; email: string } | { ok: false; error: string }> {
  await requireAdmin();

  if (input.role === 'organization' && !input.organizationId) {
    return { ok: false, error: 'Organization required when creating an organization user.' };
  }

  if (input.password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return {
      ok: false,
      error:
        'User creation is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    };
  }

  const { data: createData, error: createError } =
    await adminClient.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { name: input.name },
    });

  if (createError || !createData?.user) {
    const raw = createError?.message ?? '';
    if (raw.toLowerCase().includes('already been registered') || raw.toLowerCase().includes('already exists')) {
      return { ok: false, error: 'A user with that email already exists.' };
    }
    if (raw.toLowerCase().includes('invalid email')) {
      return { ok: false, error: 'The email address provided is not valid.' };
    }
    return { ok: false, error: 'Failed to create the user. Please try again.' };
  }

  const userId = createData.user.id;

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
    return {
      ok: false,
      error: `User created but could not set the role. Contact your database administrator.`,
    };
  }

  revalidatePath('/admin/users');
  return { ok: true, userId, email: input.email };
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

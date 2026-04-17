import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/auth';
import { getSiteSettings, updateSiteSettings } from '@/lib/supabase/queries';
import { settingsPatchSchema, SettingsPatch } from '@/lib/validations/schemas';

// GET /api/settings — public, cached
export async function GET() {
  try {
    const supabase = await createClient();
    const settings = await getSiteSettings(supabase);

    return NextResponse.json(
      { ok: true, settings },
      {
        status: 200,
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err) {
    console.error('[GET /api/settings] unexpected error', err);
    return NextResponse.json(
      { ok: false, error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings — admin only, partial merge
export async function PUT(request: NextRequest) {
  // Auth gate — redirects throw inside requireAdmin, so we call it and
  // catch the redirect to convert it to a proper 401 JSON response.
  let session: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    session = await requireAdmin();
  } catch {
    // requireAdmin calls redirect() which throws a Next.js NEXT_REDIRECT error.
    // Any throw here means the caller is not an admin.
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Request body must be valid JSON' },
      { status: 400 }
    );
  }

  const parsed = settingsPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Validation failed',
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const updated = await updateSiteSettings(
      supabase,
      parsed.data as SettingsPatch,
      session.id
    );

    revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');

    return NextResponse.json({ ok: true, settings: updated }, { status: 200 });
  } catch (err) {
    console.error('[PUT /api/settings] db error', err);
    return NextResponse.json(
      { ok: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

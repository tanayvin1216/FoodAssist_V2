import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_PATH_LENGTH = 512;
const MAX_REFERRER_LENGTH = 2048;
const MAX_UA_LENGTH = 512;
const MAX_SESSION_ID_LENGTH = 64;

// Public surfaces only — never record traffic on authenticated areas.
const BLOCKED_PREFIXES = ['/admin', '/portal', '/api', '/_next'];

const BOT_PATTERN = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|preview/i;

function isAllowedPath(path: string): boolean {
  if (!path.startsWith('/')) return false;
  return !BLOCKED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { path, sessionId, referrer } = (body ?? {}) as {
    path?: unknown;
    sessionId?: unknown;
    referrer?: unknown;
  };

  if (
    typeof path !== 'string' ||
    typeof sessionId !== 'string' ||
    path.length === 0 ||
    path.length > MAX_PATH_LENGTH ||
    sessionId.length === 0 ||
    sessionId.length > MAX_SESSION_ID_LENGTH
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isAllowedPath(path)) {
    return NextResponse.json({ ok: true, skipped: 'path' }, { status: 200 });
  }

  const userAgent = request.headers.get('user-agent') ?? '';
  if (BOT_PATTERN.test(userAgent)) {
    return NextResponse.json({ ok: true, skipped: 'bot' }, { status: 200 });
  }

  const safeReferrer =
    typeof referrer === 'string' && referrer.length > 0 && referrer.length <= MAX_REFERRER_LENGTH
      ? referrer
      : null;

  const supabase = await createClient();
  const { error } = await supabase.from('page_views').insert({
    path,
    session_id: sessionId,
    referrer: safeReferrer,
    user_agent: userAgent.slice(0, MAX_UA_LENGTH) || null,
  });

  if (error) {
    console.error('[POST /api/track-view] insert failed', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

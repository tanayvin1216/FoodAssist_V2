import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Dedicated sign-in surfaces — must remain publicly reachable
  const isAdminLogin = path === '/admin/login';
  const isPortalLogin = path === '/portal/login';
  const isAuthRoute = isAdminLogin || isPortalLogin;

  // Protected areas (the login pages are excluded above)
  const isPortalRoute = path.startsWith('/portal') && !isPortalLogin;
  const isAdminRoute = path.startsWith('/admin') && !isAdminLogin;

  // Temporary diagnostic — prove what the middleware actually sees
  if (path.startsWith('/admin') || path.startsWith('/portal')) {
    console.log(
      `[mw] ${path} | user=${user?.id ?? 'anon'} | isAdminLogin=${isAdminLogin} | isAdminRoute=${isAdminRoute} | isAuthRoute=${isAuthRoute}`
    );
  }

  // Legacy self-service routes — redirect to the admin login as the default
  if (path.startsWith('/signup') || path === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Unauthenticated users land on the matching login page for the area they tried to enter
  if (!user) {
    if (isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
    if (isPortalRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/portal/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  // Authenticated callers: enforce role on each area
  if (user && (isAdminRoute || isPortalRoute)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (isAdminRoute && profile?.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    if (isPortalRoute && profile?.role !== 'organization') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Already-signed-in users shouldn't sit on a login page
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const url = request.nextUrl.clone();
    if (profile?.role === 'admin') {
      url.pathname = '/admin';
    } else if (profile?.role === 'organization') {
      url.pathname = '/portal';
    } else {
      url.pathname = '/';
    }
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

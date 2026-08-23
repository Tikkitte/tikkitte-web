import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_GATED_EXACT_PATHS = ['/login', '/signup']

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const isStudio = host.startsWith('create.')
  const { pathname } = request.nextUrl

  // On create.tikkitte.com, / is routed as /dashboard (URL stays
  // create.tikkitte.com/) — but this must fall through to the same
  // Supabase auth-refresh + approval-check logic below, not return early.
  // Returning a bare rewrite here (as this used to do) skips the token
  // refresh entirely for every request to the studio root, which is
  // exactly the request pattern this proxy exists to protect.
  const isStudioRoot = isStudio && pathname === '/'
  const effectivePathname = isStudioRoot ? '/dashboard' : pathname

  const buildBaseResponse = () =>
    isStudioRoot
      ? NextResponse.rewrite(
          (() => {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return url
          })(),
          // Forward the (possibly cookie-mutated) request so the rewritten
          // Server Component sees the same refreshed session this request
          // just established, not the stale cookies it started with.
          { request }
        )
      : NextResponse.next({ request })

  // Redirects (unlike rewrite/next) always construct a brand-new response,
  // so any cookies already refreshed onto `supabaseResponse` this request
  // would otherwise be silently dropped — copy them across explicitly.
  const redirectWithRefreshedCookies = (url: string | URL) => {
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  const needsAuth =
    effectivePathname.startsWith('/dashboard') || AUTH_GATED_EXACT_PATHS.includes(effectivePathname)
  if (!needsAuth) {
    return buildBaseResponse()
  }

  let supabaseResponse = buildBaseResponse()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Rebuild from the same base (rewrite or next) every time, so a
          // refreshed-cookie response never silently drops the rewrite.
          supabaseResponse = buildBaseResponse()
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect /dashboard routes
  if (effectivePathname.startsWith('/dashboard')) {
    if (!user) {
      return redirectWithRefreshedCookies(new URL('/login', request.url))
    }

    // Check organizer is approved
    const { data: profile, error: profileError } = await supabase
      .from('organizer_profile')
      .select('approved')
      .eq('id', user.id)
      .maybeSingle()

    // A failed lookup is not the same as "not approved" — sending an
    // approved organizer to the pending screen over a transient error is
    // exactly the bug this is meant to prevent. Fail with a retryable
    // error instead, carrying forward any cookies already refreshed above.
    if (profileError) {
      const errorResponse = new NextResponse(
        'Temporarily unable to verify your account. Please try again.',
        { status: 503, headers: { 'Retry-After': '5' } }
      )
      supabaseResponse.cookies.getAll().forEach((cookie) => errorResponse.cookies.set(cookie))
      return errorResponse
    }

    if (!profile?.approved && !pathname.startsWith('/dashboard/pending')) {
      return redirectWithRefreshedCookies(new URL('/dashboard/pending', request.url))
    }
  }

  // Redirect approved organizers away from login/signup. This is a
  // convenience shortcut, not a security gate — on a failed lookup we
  // deliberately just leave the user on the login page rather than block
  // it with an error; the worst case is they see the login form again and
  // sign in normally instead of being auto-redirected to /dashboard.
  if (user && (effectivePathname === '/login' || effectivePathname === '/signup')) {
    const { data: profile, error: profileError } = await supabase
      .from('organizer_profile')
      .select('approved')
      .eq('id', user.id)
      .maybeSingle()

    if (!profileError && profile?.approved) {
      return redirectWithRefreshedCookies(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}

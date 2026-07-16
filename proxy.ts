import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_GATED_EXACT_PATHS = ['/login', '/signup']

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const isStudio = host.startsWith('create.')
  const { pathname } = request.nextUrl

  // On create.tikkitte.com, rewrite / → /dashboard (keeps URL as create.tikkitte.com)
  if (isStudio && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.rewrite(url)
  }

  // Only routes that branch on the session should pay for a Supabase auth check.
  const needsAuth =
    pathname.startsWith('/dashboard') || AUTH_GATED_EXACT_PATHS.includes(pathname)
  if (!needsAuth) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check organizer is approved
    const { data: profile } = await supabase
      .from('organizer_profile')
      .select('approved')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.approved) {
      if (!pathname.startsWith('/dashboard/pending')) {
        return NextResponse.redirect(new URL('/dashboard/pending', request.url))
      }
    }
  }

  // Redirect approved organizers away from login/signup
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const { data: profile } = await supabase
      .from('organizer_profile')
      .select('approved')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.approved) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/guide', '/admin', '/profile']
const AUTH_ROUTES = ['/login', '/signup']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 로그인 안 된 유저가 보호된 페이지 접근 → 로그인으로
  if (!user && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 로그인된 유저가 로그인/회원가입 페이지 접근 → 가이드로
  if (user && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/guide', request.url))
  }

  return supabaseResponse
}

// Next.js가 특수 처리하는 export — IDE에서 미사용으로 표시될 수 있으나 정상
// eslint-disable-next-line import/no-unused-modules
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}

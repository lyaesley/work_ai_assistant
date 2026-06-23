import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 서버 컴포넌트 / API Route에서 세션 인식용 (쿠키 기반)
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // CookieOptions(supabase) ↔ ResponseCookie(Next.js) 타입 불일치로 캐스팅
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cookieStore.set(name, value, options as any)
            )
          } catch {
            // 서버 컴포넌트에서 쿠키 쓰기 시도 시 발생하는 에러 무시
          }
        },
      },
    }
  )
}

// Secret key가 필요한 관리자 작업용 (RLS 우회) — Phase 2 이후 사용 예정
export async function createAdminClient() {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

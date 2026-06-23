import { createClient } from '@/lib/supabase/server'

/** 현재 로그인 유저가 admin 플랜인지 확인. 아니면 null 반환 */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (data?.plan !== 'admin') return null
  return user
}

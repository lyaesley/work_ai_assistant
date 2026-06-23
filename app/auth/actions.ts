'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function getRedirectPath(userId: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('default_role')
    .eq('id', userId)
    .single()

  // 기본 직책 미설정 → 프로필 설정으로
  return data?.default_role ? '/history' : '/profile'
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  const userId = data.user?.id
  redirect(userId ? await getRedirectPath(userId) : '/profile')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다' }
  }

  const userId = data.user?.id
  redirect(userId ? await getRedirectPath(userId) : '/profile')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

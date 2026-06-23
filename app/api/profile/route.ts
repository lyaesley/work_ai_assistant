import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/profile — 내 프로필 조회
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: '로그인 필요' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('users')
    .select('name, default_role, domain, career_years, team_size')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, profile: data })
}

// PATCH /api/profile — 내 프로필 수정
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: '로그인 필요' }, { status: 401 })
  }

  const body = await req.json()
  const { name, defaultRole, domain, careerYears, teamSize } = body

  const { error } = await supabase
    .from('users')
    .update({
      name: name ?? null,
      default_role: defaultRole ?? null,
      domain: domain ?? null,
      career_years: careerYears ?? null,
      team_size: teamSize ?? null,
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

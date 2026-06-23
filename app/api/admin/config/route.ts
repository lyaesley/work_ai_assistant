import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

// GET /api/admin/config — app_config 전체 조회
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const adminClient = await createAdminClient()
  const { data, error } = await adminClient
    .from('app_config')
    .select('key, value')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, config: data })
}

// PATCH /api/admin/config — 특정 key 값 수정
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { key, value } = await req.json()

  const adminClient = await createAdminClient()
  const { error } = await adminClient
    .from('app_config')
    .update({ value: String(value) })
    .eq('key', key)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

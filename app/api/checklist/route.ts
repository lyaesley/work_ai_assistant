import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/checklist?sessionId=xxx
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId 필요' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('checklist_items')
    .select('id, item, is_done')
    .eq('guide_session_id', sessionId)
    .order('created_at')

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, items: data })
}

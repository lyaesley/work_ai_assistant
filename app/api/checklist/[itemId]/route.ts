import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/checklist/[itemId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params

  let isDone: boolean
  try {
    const body = await req.json()
    isDone = body.isDone
  } catch {
    return NextResponse.json({ success: false, error: '요청 형식이 잘못됐습니다' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('checklist_items')
    .update({
      is_done: isDone,
      done_at: isDone ? new Date().toISOString() : null,
    })
    .eq('id', itemId)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

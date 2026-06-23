import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistoryList from '@/components/history/HistoryList'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: sessions, error } = await supabase
    .from('guide_sessions')
    .select('id, role, situation, domain, career_years, team_size, main_concern, guide_result, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('히스토리 조회 실패:', error.message)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">내 가이드 히스토리</h1>
          <p className="text-gray-500 text-sm mt-1">지금까지 받은 가이드 목록</p>
        </div>
        <HistoryList sessions={sessions ?? []} />
      </div>
    </main>
  )
}

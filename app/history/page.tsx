import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HistoryList from '@/components/history/HistoryList'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: sessions, error } = await supabase
    .from('guide_sessions')
    .select('id, role, situation, domain, career_years, team_size, guide_result, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('히스토리 조회 실패:', error.message)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">내 가이드 히스토리</h1>
            <p className="text-gray-500 text-sm mt-1">지금까지 받은 가이드 목록</p>
          </div>
          <Link
            href="/guide"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            새 가이드
          </Link>
        </div>

        <HistoryList sessions={sessions ?? []} />
      </div>
    </main>
  )
}

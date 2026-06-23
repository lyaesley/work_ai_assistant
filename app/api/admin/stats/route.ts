import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const adminClient = await createAdminClient()

  const [usersRes, sessionsRes, recentRes] = await Promise.all([
    // 플랜별 유저 수
    adminClient.from('users').select('plan'),
    // 전체 / 오늘 세션 수
    adminClient.from('guide_sessions').select('created_at'),
    // 최근 가이드 세션 20건
    adminClient
      .from('guide_sessions')
      .select('id, role, situation, domain, career_years, team_size, main_concern, guide_result, tokens_used, created_at, users(email)')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const users = usersRes.data ?? []
  const sessions = sessionsRes.data ?? []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const userStats = {
    total: users.length,
    free: users.filter((u) => u.plan === 'free').length,
    pro: users.filter((u) => u.plan === 'pro').length,
    admin: users.filter((u) => u.plan === 'admin').length,
  }

  const sessionStats = {
    total: sessions.length,
    today: sessions.filter((s) => new Date(s.created_at) >= today).length,
    thisWeek: sessions.filter((s) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(s.created_at) >= weekAgo
    }).length,
  }

  // HistoryList 포맷으로 변환 (user_email 플랫화)
  const recentSessions = (recentRes.data ?? []).map(({ users, ...s }) => ({
    ...s,
    user_email: (users as { email: string } | null)?.email,
  }))

  return NextResponse.json({
    success: true,
    userStats,
    sessionStats,
    recentSessions,
  })
}

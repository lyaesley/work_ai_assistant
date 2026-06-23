'use client'

import { useState, useEffect } from 'react'
import HistoryList from '@/components/history/HistoryList'
import { GuideResult } from '@/types/guide'

type User = {
  id: string
  email: string
  name: string | null
  plan: 'free' | 'pro' | 'admin'
  created_at: string
}

type Config = { key: string; value: string }

type UserStats = { total: number; free: number; pro: number; admin: number }
type SessionStats = { total: number; today: number; thisWeek: number }

type AdminSession = {
  id: string
  role: string
  situation: string
  domain: string | null
  career_years: number | null
  team_size: number | null
  main_concern: string | null
  guide_result: GuideResult
  created_at: string
  user_email?: string
}

const PLAN_BADGE: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  pro: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
}

const CONFIG_LABELS: Record<string, string> = {
  guide_rate_limit_seconds: 'Free 플랜 호출 제한 (초)',
}

type Tab = 'dashboard' | 'users' | 'config'

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('dashboard')

  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null)
  const [recentSessions, setRecentSessions] = useState<AdminSession[]>([])

  const [users, setUsers] = useState<User[]>([])
  const [config, setConfig] = useState<Config[]>([])
  const [configEdits, setConfigEdits] = useState<Record<string, string>>({})

  const [loadingDash, setLoadingDash] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)
  const [configSaved, setConfigSaved] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUserStats(d.userStats)
          setSessionStats(d.sessionStats)
          setRecentSessions(d.recentSessions)
        }
      })
      .finally(() => setLoadingDash(false))

    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsers(d.users) })
      .finally(() => setLoadingUsers(false))

    fetch('/api/admin/config')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setConfig(d.config)
          const edits: Record<string, string> = {}
          d.config.forEach((c: Config) => { edits[c.key] = c.value })
          setConfigEdits(edits)
        }
      })
  }, [])

  async function handlePlanChange(userId: string, plan: string) {
    setUpdatingUserId(userId)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan }),
    })
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, plan: plan as User['plan'] } : u))
    setUpdatingUserId(null)
  }

  async function handleConfigSave() {
    setSavingConfig(true)
    await Promise.all(
      config.map((c) =>
        fetch('/api/admin/config', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: c.key, value: configEdits[c.key] }),
        })
      )
    )
    setSavingConfig(false)
    setConfigSaved(true)
    setTimeout(() => setConfigSaved(false), 2000)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'users', label: '유저 관리' },
    { id: 'config', label: '설정' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 탭 */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── 대시보드 탭 ── */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {loadingDash ? (
              <p className="text-center py-12 text-gray-400 text-sm">불러오는 중...</p>
            ) : (
              <>
                {/* 통계 카드 */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: '전체 유저', value: userStats?.total ?? 0, sub: `free ${userStats?.free} · pro ${userStats?.pro} · admin ${userStats?.admin}` },
                    { label: '전체 가이드', value: sessionStats?.total ?? 0, sub: '누적' },
                    { label: '오늘 가이드', value: sessionStats?.today ?? 0, sub: '오늘' },
                    { label: '이번 주', value: sessionStats?.thisWeek ?? 0, sub: '최근 7일' },
                  ].map((card) => (
                    <div key={card.label} className="bg-white border border-gray-200 rounded-2xl px-4 py-4">
                      <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* 전체 가이드 요청 — HistoryList 재사용 */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">
                    최근 가이드 요청
                    <span className="ml-2 text-xs text-gray-400 font-normal">최근 50건</span>
                  </h2>
                  <HistoryList sessions={recentSessions} readonly />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 유저 관리 탭 ── */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">유저 목록</h2>
              <span className="text-xs text-gray-400">{users.length}명</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {loadingUsers ? (
                <p className="text-center py-10 text-gray-400 text-sm">불러오는 중...</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">이메일</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">이름</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">가입일</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">플랜</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700 text-sm">{user.email}</td>
                        <td className="px-4 py-3 text-gray-500 text-sm">{user.name ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={user.plan}
                            disabled={updatingUserId === user.id}
                            onChange={(e) => handlePlanChange(user.id, e.target.value)}
                            className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 border-0 ${PLAN_BADGE[user.plan]}`}
                          >
                            <option value="free">free</option>
                            <option value="pro">pro</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── 설정 탭 ── */}
        {tab === 'config' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">앱 설정</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
              {config.map((c) => (
                <div key={c.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {CONFIG_LABELS[c.key] ?? c.key}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={configEdits[c.key] ?? c.value}
                      onChange={(e) => setConfigEdits((prev) => ({ ...prev, [c.key]: e.target.value }))}
                      className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-500">초</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    현재 설정값: {c.value}초 · 분당 {Math.floor(60 / parseInt(c.value))}회
                  </p>
                </div>
              ))}
              <button
                onClick={handleConfigSave}
                disabled={savingConfig}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                {savingConfig ? '저장 중...' : configSaved ? '✓ 저장됐습니다' : '설정 저장'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

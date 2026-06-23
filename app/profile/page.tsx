'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const ROLES = ['팀장', 'PM', 'PL', '부서장', '팀원', '구성원']
const DOMAINS = ['IT 개발', '마케팅', '영업', '기획', '디자인', '운영', '인사', '재무', '기타']

type Profile = {
  name: string
  defaultRole: string
  domain: string
  careerYears: string
  teamSize: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    defaultRole: '',
    domain: '',
    careerYears: '',
    teamSize: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.profile) {
          const p = data.profile
          setProfile({
            name: p.name ?? '',
            defaultRole: p.default_role ?? '',
            domain: p.domain ?? '',
            careerYears: p.career_years?.toString() ?? '',
            teamSize: p.team_size?.toString() ?? '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profile.name || null,
        defaultRole: profile.defaultRole || null,
        domain: profile.domain || null,
        careerYears: profile.careerYears ? Number(profile.careerYears) : null,
        teamSize: profile.teamSize ? Number(profile.teamSize) : null,
      }),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
            <p className="text-gray-500 text-sm mt-1">저장된 정보는 가이드 요청 시 자동으로 사용됩니다</p>
          </div>
          <Link href="/guide" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← 가이드로
          </Link>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              placeholder="홍길동"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 기본 직책 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">기본 직책</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, defaultRole: p.defaultRole === r ? '' : r }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    profile.defaultRole === r
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 업종 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업종/도메인</label>
            <select
              value={profile.domain}
              onChange={(e) => setProfile((p) => ({ ...p, domain: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택 안 함</option>
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* 경력 / 팀 규모 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">경력 (년)</label>
              <input
                type="number"
                value={profile.careerYears}
                onChange={(e) => setProfile((p) => ({ ...p, careerYears: e.target.value }))}
                placeholder="예: 7"
                min={0}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">팀 규모 (명)</label>
              <input
                type="number"
                value={profile.teamSize}
                onChange={(e) => setProfile((p) => ({ ...p, teamSize: e.target.value }))}
                placeholder="예: 5"
                min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            {saving ? '저장 중...' : saved ? '✓ 저장됐습니다' : '저장하기'}
          </button>
        </form>
      </div>
    </main>
  )
}

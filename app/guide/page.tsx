'use client'

import { useState } from 'react'
import { GuideRequest, GuideResult } from '@/types/guide'
import GuideForm from '@/components/guide/GuideForm'
import HistoryList from '@/components/history/HistoryList'

type ResultSession = {
  id: string
  role: string
  situation: string
  domain: string | null
  career_years: number | null
  team_size: number | null
  main_concern: string | null
  guide_result: GuideResult
  created_at: string
}

const PREVIEW_ID = 'preview'

export default function GuidePage() {
  const [session, setSession] = useState<ResultSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)

  async function handleSubmit(data: GuideRequest) {
    setLoading(true)
    setError(null)
    setSession(null)

    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!json.success) throw new Error(json.error)

      setIsMock(json.isMock ?? false)
      setSession({
        id: json.sessionId ?? PREVIEW_ID,
        role: data.role,
        situation: data.situation,
        domain: data.domain ?? null,
        career_years: data.careerYears ?? null,
        team_size: data.teamSize ?? null,
        main_concern: data.mainConcern ?? null,
        guide_result: json.guide,
        created_at: new Date().toISOString(),
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {!session ? (
          <>
            <p className="text-gray-500 text-sm mb-6">직책과 상황을 입력하면 지금 해야 할 일을 알려드립니다</p>
            <GuideForm onSubmit={handleSubmit} loading={loading} error={error} />
          </>
        ) : (
          <>
            {isMock && (
              <div className="mb-4 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                🔧 개발 모드 — API 키 연결 후 실제 AI 응답으로 전환됩니다
              </div>
            )}
            <HistoryList sessions={[session]} initialExpandedId={session.id} />
            <button
              onClick={() => setSession(null)}
              className="mt-4 w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              새 가이드 받기
            </button>
          </>
        )}
      </div>
    </main>
  )
}

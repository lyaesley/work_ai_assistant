'use client'

import { useState } from 'react'
import { GuideRequest, GuideResult, Role } from '@/types/guide'
import GuideForm from '@/components/guide/GuideForm'
import GuideResultView from '@/components/guide/GuideResultView'

export default function GuidePage() {
  const [result, setResult] = useState<GuideResult | null>(null)
  const [isMock, setIsMock] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: GuideRequest) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!json.success) throw new Error(json.error)

      setResult(json.guide)
      setIsMock(json.isMock ?? false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">AI 업무 가이드</h1>
        <p className="text-gray-500 text-sm mb-8">직책과 상황을 입력하면 지금 해야 할 일을 알려드립니다</p>

        {!result ? (
          <GuideForm onSubmit={handleSubmit} loading={loading} error={error} />
        ) : (
          <div>
            {isMock && (
              <div className="mb-4 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                🔧 개발 모드 — API 키 연결 후 실제 AI 응답으로 전환됩니다
              </div>
            )}
            <GuideResultView result={result} onReset={() => setResult(null)} />
          </div>
        )}
      </div>
    </main>
  )
}

'use client'

import { useState } from 'react'
import { GuideResult } from '@/types/guide'
import GuideResultView from '@/components/guide/GuideResultView'

type Session = {
  id: string
  role: string
  situation: string
  domain: string | null
  career_years: number | null
  team_size: number | null
  guide_result: GuideResult
  created_at: string
}

type Props = {
  sessions: Session[]
}

export default function HistoryList({ sessions }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-4">📋</p>
        <p className="font-medium">아직 가이드 기록이 없습니다</p>
        <p className="text-sm mt-1">첫 번째 가이드를 받아보세요</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const isExpanded = expandedId === session.id
        const date = new Date(session.created_at)
        const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
        const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

        return (
          <div key={session.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* 헤더 */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : session.id)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {session.role}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.situation}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{dateStr} {timeStr}</p>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 요약 (항상 노출) */}
            {!isExpanded && (
              <div className="px-5 pb-4">
                <p className="text-xs text-gray-500 line-clamp-2">
                  {session.guide_result.summary}
                </p>
              </div>
            )}

            {/* 전체 결과 (펼쳤을 때) */}
            {isExpanded && (
              <div className="px-5 pb-6 border-t border-gray-100 pt-4">
                <GuideResultView
                  result={session.guide_result}
                  onReset={() => setExpandedId(null)}
                  hideResetButton
                  sessionId={session.id}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

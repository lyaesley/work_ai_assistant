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
  main_concern: string | null
  guide_result: GuideResult
  created_at: string
  user_email?: string  // 어드민 뷰에서만 사용
}

type Props = {
  sessions: Session[]
  initialExpandedId?: string  // 처음부터 펼쳐둘 카드 ID
  readonly?: boolean           // true면 체크리스트 비활성화 (어드민 뷰 등)
}

export default function HistoryList({ sessions, initialExpandedId, readonly = false }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(initialExpandedId ?? null)

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

        // 문의 메타 태그 (domain, career, team_size)
        const metaTags = [
          session.domain,
          session.career_years != null ? `경력 ${session.career_years}년` : null,
          session.team_size != null ? `팀 ${session.team_size}명` : null,
        ].filter(Boolean) as string[]

        return (
          <div key={session.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* 카드 헤더 */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : session.id)}
              className="w-full px-5 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-0.5 rounded-full shrink-0">
                    {session.role}
                  </span>
                  {session.user_email && (
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      {session.user_email}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{dateStr} {timeStr}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{session.situation}</p>

                {/* 메타 태그 */}
                {metaTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {metaTags.map((tag) => (
                      <span key={tag} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 고민 (접혔을 때) */}
                {!isExpanded && session.main_concern && (
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                    💬 {session.main_concern}
                  </p>
                )}

                {/* 요약 (접혔을 때) */}
                {!isExpanded && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {session.guide_result.summary}
                  </p>
                )}
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-3 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 펼쳤을 때 */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                {/* 문의 내용 */}
                <div className="px-5 pt-4 pb-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2">문의 내용</p>
                  <div className="space-y-1">
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400 w-14 shrink-0">직책</span>
                      <span className="text-gray-700 font-medium">{session.role}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400 w-14 shrink-0">상황</span>
                      <span className="text-gray-700">{session.situation}</span>
                    </div>
                    {session.domain && (
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-14 shrink-0">업종</span>
                        <span className="text-gray-700">{session.domain}</span>
                      </div>
                    )}
                    {session.career_years != null && (
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-14 shrink-0">경력</span>
                        <span className="text-gray-700">{session.career_years}년</span>
                      </div>
                    )}
                    {session.team_size != null && (
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-14 shrink-0">팀 규모</span>
                        <span className="text-gray-700">{session.team_size}명</span>
                      </div>
                    )}
                    {session.main_concern && (
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-400 w-14 shrink-0">고민</span>
                        <span className="text-gray-700">{session.main_concern}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 가이드 결과 */}
                <div className="px-5 pb-6 pt-4">
                  <GuideResultView
                    result={session.guide_result}
                    onReset={() => setExpandedId(null)}
                    hideResetButton
                    sessionId={readonly ? null : session.id}
                    readonly={readonly}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { GuideResult } from '@/types/guide'
import GuideChat from '@/components/guide/GuideChat'

type DbChecklistItem = {
  id: string
  item: string
  is_done: boolean
}

type ChatContext = {
  role: string
  situation: string
  domain?: string | null
  careerYears?: number | null
  teamSize?: number | null
}

type Props = {
  result: GuideResult
  onReset: () => void
  hideResetButton?: boolean
  sessionId?: string | null
  readonly?: boolean  // true면 체크리스트 클릭 비활성화
  chatContext?: ChatContext  // 있으면 하단에 더 물어보기 채팅 표시
}

export default function GuideResultView({ result, onReset, hideResetButton = false, sessionId, readonly = false, chatContext }: Props) {
  const [checklist, setChecklist] = useState<DbChecklistItem[]>(() =>
    result.checklist.map((item, i) => ({
      id: String(i),
      item: item.item,
      is_done: false,
    }))
  )
  const [activeTab, setActiveTab] = useState<'지금 당장' | '이번 주'>('지금 당장')

  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/checklist?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setChecklist(data.items)
      })
  }, [sessionId])

  async function toggleCheck(item: DbChecklistItem) {
    const newDone = !item.is_done

    setChecklist((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, is_done: newDone } : c))
    )

    if (sessionId) {
      await fetch(`/api/checklist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone: newDone }),
      })
    }
  }

  const tabs = ['지금 당장', '이번 주'] as const
  const filteredTasks = result.priority_tasks.filter((t) => t.period === activeTab)
  const doneCount = checklist.filter((c) => c.is_done).length

  return (
    <div className="space-y-6">
      {/* 요약 */}
      <div className="bg-blue-600 text-white rounded-2xl px-5 py-4">
        <p className="text-xs font-medium opacity-70 mb-1">현재 상황 요약</p>
        <p className="font-semibold leading-snug">{result.summary}</p>
      </div>

      {/* 우선순위 태스크 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">지금 해야 할 일</h2>
        <div className="flex gap-2 mb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <p className="text-gray-400 text-sm px-1">이 기간의 태스크가 없습니다</p>
          ) : (
            filteredTasks.map((task, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-semibold text-blue-500 mt-0.5 shrink-0">{i + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{task.task}</p>
                    <p className="text-gray-400 text-xs mt-1">{task.reason}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 체크리스트 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">체크리스트</h2>
          {checklist.length > 0 && (
            <span className="text-xs text-gray-400">{doneCount}/{checklist.length} 완료</span>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => !readonly && toggleCheck(item)}
              disabled={readonly}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                readonly ? 'cursor-default' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                item.is_done
                  ? 'bg-blue-600 border-blue-600'
                  : readonly ? 'border-gray-200' : 'border-gray-300'
              }`}>
                {item.is_done && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm leading-snug ${item.is_done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {item.item}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 성공 기준 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-1">✅ 성공 기준</h2>
        <p className="text-xs text-gray-400 mb-3">이 상황을 잘 처리했다면 이런 상태여야 합니다</p>
        <div className="space-y-2">
          {(result.success_criteria ?? []).map((c, i) => (
            <div key={i} className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-green-500 text-sm font-bold shrink-0">{i + 1}</span>
              <p className="text-green-800 text-sm leading-snug">{c}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 주의사항 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">⚠️ 흔한 실수</h2>
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 space-y-2">
          {result.watch_out.map((w, i) => (
            <p key={i} className="text-orange-700 text-sm leading-snug">• {w}</p>
          ))}
        </div>
      </div>

      {/* 자문 질문 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">🤔 스스로 물어볼 것</h2>
        <div className="space-y-2">
          {result.questions_to_ask.map((q, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-gray-700 text-sm">{q}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 더 물어보기 채팅 (chatContext 없으면 숨김) */}
      {chatContext && (
        <GuideChat context={chatContext} />
      )}

      {!hideResetButton && (
        <button
          onClick={onReset}
          className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          새 가이드 받기
        </button>
      )}
    </div>
  )
}

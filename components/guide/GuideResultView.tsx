'use client'

import { useState } from 'react'
import { GuideResult, ChecklistItem } from '@/types/guide'

type Props = {
  result: GuideResult
  onReset: () => void
}

export default function GuideResultView({ result, onReset }: Props) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(result.checklist)
  const [activeTab, setActiveTab] = useState<'오늘' | '이번 주' | '이번 달'>('오늘')

  function toggleCheck(index: number) {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, done: !item.done } : item))
    )
  }

  const filteredTasks = result.priority_tasks.filter((t) => t.period === activeTab)
  const tabs = ['오늘', '이번 주', '이번 달'] as const

  return (
    <div className="space-y-6">
      {/* 요약 */}
      <div className="bg-blue-600 text-white rounded-2xl px-5 py-4">
        <p className="text-xs font-medium opacity-80 mb-1">현재 상황 요약</p>
        <p className="font-semibold">{result.summary}</p>
      </div>

      {/* 우선순위 태스크 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">지금 해야 할 일</h2>
        <div className="flex gap-2 mb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
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
            <p className="text-gray-400 text-sm">이 기간의 태스크가 없습니다</p>
          ) : (
            filteredTasks.map((task, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                <p className="font-medium text-gray-900 text-sm">{task.task}</p>
                <p className="text-gray-400 text-xs mt-1">{task.reason}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 체크리스트 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">체크리스트</h2>
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {checklist.map((item, i) => (
            <button
              key={i}
              onClick={() => toggleCheck(i)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                item.done ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
              }`}>
                {item.done && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {item.item}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 주의사항 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">⚠️ 흔한 실수</h2>
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 space-y-2">
          {result.watch_out.map((w, i) => (
            <p key={i} className="text-orange-700 text-sm">• {w}</p>
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

      {/* 4주 플랜 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">📅 4주 플랜</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(result.week_plan).map(([week, goal], i) => (
            <div key={week} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-blue-600 mb-1">{i + 1}주차</p>
              <p className="text-gray-700 text-sm">{goal}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 다시 하기 */}
      <button
        onClick={onReset}
        className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
      >
        새 가이드 받기
      </button>
    </div>
  )
}

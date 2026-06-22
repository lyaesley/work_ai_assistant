'use client'

import { useState } from 'react'
import { GuideRequest, Role } from '@/types/guide'

const ROLES: Role[] = ['팀장', 'PM', 'PL', '부서장', '팀원', '구성원']

const SITUATIONS: Record<Role, string[]> = {
  팀장: ['팀장 첫 주', '신규 팀원 온보딩', '분기 목표 설정', '팀원 성과 평가', '팀 갈등 상황', '조직 개편 후', '팀원 이탈 상황'],
  PM: ['프로젝트 킥오프', '일정 지연 대응', '이해관계자 보고', '리스크 발생', '프로젝트 마감', '팀 동기부여 필요'],
  PL: ['기술 리딩 시작', '코드 리뷰 체계 구축', '팀 기술 성장 계획', '아키텍처 결정', '기술 부채 해소'],
  부서장: ['연간 계획 수립', '예산 편성', '팀장 관리', '경영진 보고', '부서 성과 리뷰', '신규 사업 기획'],
  팀원: ['업무 우선순위 정리', '보고 준비', '새 프로젝트 투입', '성장 방향 고민'],
  구성원: ['업무 우선순위 정리', '보고 준비', '새 프로젝트 투입', '성장 방향 고민'],
}

const DOMAINS = ['IT 개발', '마케팅', '영업', '기획', '디자인', '운영', '인사', '재무', '기타']

type Props = {
  onSubmit: (data: GuideRequest) => void
  loading: boolean
  error: string | null
}

export default function GuideForm({ onSubmit, loading, error }: Props) {
  const [role, setRole] = useState<Role | ''>('')
  const [situation, setSituation] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [domain, setDomain] = useState('')
  const [careerYears, setCareerYears] = useState('')
  const [mainConcern, setMainConcern] = useState('')

  function handleRoleChange(r: Role) {
    setRole(r)
    setSituation('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role || !situation) return
    onSubmit({
      role,
      situation,
      teamSize: teamSize ? Number(teamSize) : undefined,
      domain: domain || undefined,
      careerYears: careerYears ? Number(careerYears) : undefined,
      mainConcern: mainConcern || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 직책 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">직책 *</label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                role === r
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 상황 */}
      {role && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">현재 상황 *</label>
          <div className="flex flex-wrap gap-2">
            {SITUATIONS[role].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSituation(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  situation === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 선택 입력 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">팀 규모</label>
          <input
            type="number"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            placeholder="예: 5"
            min={1}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">경력</label>
          <input
            type="number"
            value={careerYears}
            onChange={(e) => setCareerYears(e.target.value)}
            placeholder="예: 7"
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">업종/도메인</label>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">선택 안 함</option>
          {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">가장 큰 고민 (선택)</label>
        <textarea
          value={mainConcern}
          onChange={(e) => setMainConcern(e.target.value)}
          placeholder="예: 팀원 동기 부여가 어렵습니다"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={!role || !situation || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        {loading ? '가이드 생성 중...' : '가이드 받기'}
      </button>
    </form>
  )
}

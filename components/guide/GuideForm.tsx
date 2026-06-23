'use client'

import { useState, useEffect } from 'react'
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

// 직책 + 상황 조합별 고민 제안 칩
const CONCERN_CHIPS: Record<string, string[]> = {
  '팀장:팀장 첫 주': ['팀원 파악을 어떻게 해야 할지', '첫 팀 미팅을 어떻게 열어야 할지', '전임자 업무를 어떻게 인수해야 할지'],
  '팀장:신규 팀원 온보딩': ['온보딩 체크리스트가 없어서', '팀 문화를 잘 전달하는 방법'],
  '팀장:분기 목표 설정': ['현실적인 목표치 산정이 어려워서', '팀원 의견을 반영하는 방법'],
  '팀장:팀원 성과 평가': ['평가 기준을 어떻게 잡을지', '낮은 성과자를 어떻게 피드백할지'],
  '팀장:팀 갈등 상황': ['갈등 당사자들을 어떻게 중재할지', '팀 분위기가 가라앉아서'],
  '팀장:조직 개편 후': ['바뀐 역할을 빨리 파악해야 해서', '팀원 불안감을 해소해야 해서'],
  '팀장:팀원 이탈 상황': ['남은 팀원 동기부여가 걱정', '업무 공백을 어떻게 메울지'],
  'PM:프로젝트 킥오프': ['이해관계자 정렬이 안 돼서', 'R&R 정의가 불명확해서', '범위가 너무 커서 막막함'],
  'PM:일정 지연 대응': ['원인 파악이 안 돼서', '윗선 보고 방법을 모르겠어서', '일정 재조정 협의가 어려워서'],
  'PM:이해관계자 보고': ['요구사항이 계속 바뀌어서', '보고 자료 작성이 어려워서'],
  'PM:리스크 발생': ['리스크 영향도 파악이 안 돼서', '대응 계획을 빨리 세워야 해서'],
  'PM:프로젝트 마감': ['막판 품질 이슈가 발생해서', '릴리즈 체크리스트가 없어서'],
  'PM:팀 동기부여 필요': ['번아웃 조짐이 보여서', '장기 프로젝트라 집중력이 떨어져서'],
  'PL:기술 리딩 시작': ['기술 방향을 어디서부터 잡을지', '팀원 기술 수준 파악이 필요해서'],
  'PL:코드 리뷰 체계 구축': ['리뷰 기준이 없어서', '리뷰 시간이 너무 많이 걸려서'],
  'PL:아키텍처 결정': ['선택지가 너무 많아서', '팀 합의를 이끌기 어려워서'],
  '부서장:경영진 보고': ['KPI 달성률이 낮아서', '설득력 있는 보고 방법을 몰라서'],
  '팀원:업무 우선순위 정리': ['할 일이 너무 많아서', '어떤 것부터 해야 할지 몰라서'],
  '팀원:보고 준비': ['보고 형식을 모르겠어서', '상사가 원하는 걸 파악하기 어려워서'],
  '팀원:성장 방향 고민': ['커리어 방향을 못 잡겠어서', '현재 역량이 부족한 것 같아서'],
  '구성원:업무 우선순위 정리': ['할 일이 너무 많아서', '어떤 것부터 해야 할지 몰라서'],
  '구성원:보고 준비': ['보고 형식을 모르겠어서', '상사가 원하는 걸 파악하기 어려워서'],
  '구성원:성장 방향 고민': ['커리어 방향을 못 잡겠어서', '현재 역량이 부족한 것 같아서'],
}

const DOMAINS = ['IT 개발', '마케팅', '영업', '기획', '디자인', '운영', '인사', '재무', '기타']

type Props = {
  onSubmit: (data: GuideRequest) => void
  loading: boolean
  error: string | null
}

export default function GuideForm({ onSubmit, loading, error }: Props) {
  // 프로필에서 불러온 기본값
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [profileRole, setProfileRole] = useState<Role | ''>('')

  // 폼 상태
  const [role, setRole] = useState<Role | ''>('')
  const [roleCustom, setRoleCustom] = useState('')
  const [useRoleCustom, setUseRoleCustom] = useState(false)

  const [situation, setSituation] = useState('')
  const [situationCustom, setSituationCustom] = useState('')
  const [useSituationCustom, setUseSituationCustom] = useState(false)

  const [teamSize, setTeamSize] = useState('')
  const [domain, setDomain] = useState('')
  const [careerYears, setCareerYears] = useState('')
  const [mainConcern, setMainConcern] = useState('')

  // 프로필 자동 로드
  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.profile) {
          const p = data.profile
          if (p.default_role) {
            setRole(p.default_role as Role)
            setProfileRole(p.default_role as Role)
          }
          if (p.domain) setDomain(p.domain)
          if (p.career_years) setCareerYears(p.career_years.toString())
          if (p.team_size) setTeamSize(p.team_size.toString())
        }
      })
      .finally(() => setProfileLoaded(true))
  }, [])

  function handleRoleChange(r: Role) {
    setRole(r)
    setUseRoleCustom(false)
    setRoleCustom('')
    setSituation('')
    setSituationCustom('')
    setUseSituationCustom(false)
  }

  function handleToggleRoleCustom() {
    setUseRoleCustom(true)
    setRole('')
  }

  function handleSituationSelect(s: string) {
    setSituation(s)
    setUseSituationCustom(false)
    setSituationCustom('')
  }

  function handleToggleSituationCustom() {
    setUseSituationCustom(true)
    setSituation('')
  }

  function handleConcernChip(chip: string) {
    setMainConcern((prev) => {
      if (prev.includes(chip)) return prev.replace(chip, '').replace(/\s{2,}/g, ' ').trim()
      return prev ? `${prev} ${chip}` : chip
    })
  }

  const effectiveRole = useRoleCustom ? roleCustom : role
  const effectiveSituation = useSituationCustom ? situationCustom : situation
  const concernChips = CONCERN_CHIPS[`${role}:${situation}`] ?? []

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!effectiveRole || !effectiveSituation) return
    onSubmit({
      role: effectiveRole as Role,
      situation: effectiveSituation,
      teamSize: teamSize ? Number(teamSize) : undefined,
      domain: domain || undefined,
      careerYears: careerYears ? Number(careerYears) : undefined,
      mainConcern: mainConcern || undefined,
    })
  }

  if (!profileLoaded) {
    return <div className="text-center py-8 text-gray-400 text-sm">불러오는 중...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 직책 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">직책 *</label>
          {profileRole && (
            <span className="text-xs text-blue-500">프로필에서 자동 선택됨</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                !useRoleCustom && role === r
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {r}
            </button>
          ))}
          <button
            type="button"
            onClick={handleToggleRoleCustom}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              useRoleCustom
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            직접 입력
          </button>
        </div>
        {useRoleCustom && (
          <input
            type="text"
            value={roleCustom}
            onChange={(e) => setRoleCustom(e.target.value)}
            placeholder="예: 시니어 개발자, 스쿼드 리드..."
            autoFocus
            className="mt-2 w-full border border-blue-400 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* 상황 */}
      {(role || useRoleCustom) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">현재 상황 *</label>
          <div className="flex flex-wrap gap-2">
            {!useRoleCustom && role && SITUATIONS[role].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSituationSelect(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  !useSituationCustom && situation === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={handleToggleSituationCustom}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                useSituationCustom
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              직접 입력
            </button>
          </div>
          {useSituationCustom && (
            <input
              type="text"
              value={situationCustom}
              onChange={(e) => setSituationCustom(e.target.value)}
              placeholder="예: 반기 OKR 수립 중..."
              autoFocus
              className="mt-2 w-full border border-blue-400 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      )}

      {/* 가장 큰 고민 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">가장 큰 고민 (선택)</label>
        {concernChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {concernChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleConcernChip(chip)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  mainConcern.includes(chip)
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
        <textarea
          value={mainConcern}
          onChange={(e) => setMainConcern(e.target.value)}
          placeholder="예: 팀원 동기 부여가 어렵습니다"
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* 프로필 자동주입 정보 표시 */}
      {(teamSize || careerYears || domain) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-500 flex flex-wrap gap-3">
          <span className="font-medium text-gray-600">프로필 자동 적용:</span>
          {domain && <span>업종: {domain}</span>}
          {careerYears && <span>경력: {careerYears}년</span>}
          {teamSize && <span>팀 규모: {teamSize}명</span>}
          <a href="/profile" className="ml-auto text-blue-500 hover:text-blue-700">수정 →</a>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={!effectiveRole || !effectiveSituation || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        {loading ? '가이드 생성 중...' : '가이드 받기'}
      </button>
    </form>
  )
}

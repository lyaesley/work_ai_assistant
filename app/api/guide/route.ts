import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GuideRequest, GuideResult } from '@/types/guide'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `당신은 한국 직장인을 위한 업무 AI 비서입니다.
사용자의 직책, 경력, 현재 상황을 바탕으로 실질적이고 실행 가능한 업무 가이드를 제공합니다.

[한국 직장 문화 기준]
- 보고 체계: 팀원 → 팀장 → 부서장 → 임원
- 주간 보고, 월간 보고 문화가 일반적
- 직급 체계: 사원/대리/과장/차장/부장 또는 수평적 직책
- 프로젝트 구조: PM(프로젝트 매니저) → PL(프로젝트 리더) → 구성원
- 회의 문화: 주간 팀 회의, 스탠드업 미팅, 1on1

[응답 원칙]
- 항상 한국어로 응답
- 추상적 조언 절대 금지. 당장 실행할 수 있는 행동만.
- priority_tasks: "지금 당장"(오늘 처리할 것) 2~3개, "이번 주"(5일 내) 2~3개만. 이 이상 범위는 다루지 않음.
- checklist: 완료 여부를 명확히 확인할 수 있는 구체적 행동으로 작성. "~하기" 형태로 5~7개. 예: "팀원 5명에게 1on1 미팅 요청 메시지 발송" (X: "팀원 파악")
- success_criteria: 이 상황을 잘 처리했을 때 어떤 상태가 되어 있는지 3가지. 측정 가능한 결과로 작성. 예: "팀원 전원이 자신의 이번 달 목표를 말할 수 있다"
- 반드시 아래 JSON 형식으로만 응답. 다른 텍스트 없이.

[응답 JSON 형식]
{
  "summary": "현재 상황 한 줄 요약",
  "priority_tasks": [
    {"period": "지금 당장", "task": "...", "reason": "왜 지금 해야 하는지"},
    {"period": "이번 주", "task": "...", "reason": "..."}
  ],
  "checklist": [
    {"item": "완료 확인 가능한 구체적 행동", "done": false}
  ],
  "watch_out": ["이 상황에서 흔히 저지르는 실수 (구체적으로)", "실수 2", "실수 3"],
  "questions_to_ask": ["지금 당장 스스로 또는 팀에게 던져야 할 질문"],
  "success_criteria": [
    "이 상황을 잘 처리했을 때 보이는 결과 1 (측정 가능하게)",
    "결과 2",
    "결과 3"
  ]
}`

// 개발용 mock 응답 (API 키 없을 때 사용)
const MOCK_RESPONSE: GuideResult = {
  summary: '팀장으로서 첫 주, 팀원 파악과 신뢰 구축이 최우선입니다.',
  priority_tasks: [
    {
      period: '지금 당장',
      task: '팀원 전원에게 개별 30분 미팅 일정 요청 메시지 발송',
      reason: '각자의 현재 업무·고민·기대치를 파악해야 다음 단계 계획이 가능합니다',
    },
    {
      period: '지금 당장',
      task: '이전 팀장 또는 직속 상위 리더에게 인수인계 미팅 요청',
      reason: '진행 중인 이슈와 팀 히스토리를 빠르게 파악하는 가장 빠른 경로입니다',
    },
    {
      period: '이번 주',
      task: '현재 진행 중인 프로젝트 목록·일정·담당자 문서화',
      reason: '어떤 일이 언제까지 진행 중인지 모르면 의사결정을 할 수 없습니다',
    },
    {
      period: '이번 주',
      task: '상위 리더와 이번 분기 팀 목표·KPI 확인 미팅 잡기',
      reason: '팀이 나아가야 할 방향을 첫 주 안에 정렬해야 팀원에게 방향을 줄 수 있습니다',
    },
  ],
  checklist: [
    { item: '팀원 전원(이름·역할 목록 작성)에게 1on1 미팅 요청 메시지 발송', done: false },
    { item: '이전 팀장 또는 상위 리더에게 인수인계 문서 수령 또는 미팅 완료', done: false },
    { item: '현재 진행 중인 프로젝트 목록 및 마감일 정리 (스프레드시트 또는 노션)', done: false },
    { item: '팀 정기 회의 일정·형식·참석자 확인', done: false },
    { item: '상위 리더와 이번 분기 팀 KPI 확인 미팅 완료', done: false },
    { item: '팀원 1on1 미팅 전 질문 리스트 3가지 이상 준비', done: false },
  ],
  watch_out: [
    '첫 주에 업무 방식이나 프로세스를 바꾸면 팀이 불안해짐 — 먼저 파악, 변경은 2주 이후',
    '1on1 전에 팀원 평가를 선입견으로 내리면 신뢰를 얻기 어려움',
    '상위 리더와 KPI를 정렬하기 전에 팀원에게 목표를 공유하면 혼선 발생 가능',
  ],
  questions_to_ask: [
    '팀원 각자가 지금 가장 힘든 점은 무엇인가?',
    '팀이 지금 잘 하고 있는 것과 개선이 필요한 것은?',
    '상위 리더가 이 팀에 기대하는 결과는 무엇인가?',
  ],
  success_criteria: [
    '팀원 전원과 1on1을 완료하고 각자의 업무·고민을 파악한 메모가 있다',
    '이번 주 안에 진행 중인 프로젝트 현황을 한눈에 볼 수 있는 문서가 만들어졌다',
    '상위 리더와 이번 분기 목표를 확인하고 팀원에게 공유할 준비가 됐다',
  ],
}

async function saveGuideSession(
  userId: string,
  body: GuideRequest,
  guide: GuideResult,
  tokensUsed?: number
): Promise<string | null> {
  const supabase = await createClient()

  // guide_sessions 저장
  const { data: session, error: sessionError } = await supabase
    .from('guide_sessions')
    .insert({
      user_id: userId,
      role: body.role,
      situation: body.situation,
      team_size: body.teamSize ?? null,
      domain: body.domain ?? null,
      career_years: body.careerYears ?? null,
      main_concern: body.mainConcern ?? null,
      guide_result: guide,
      tokens_used: tokensUsed ?? null,
    })
    .select('id')
    .single()

  if (sessionError || !session) {
    console.error('[Guide API] guide_sessions 저장 실패:', sessionError?.message)
    return null
  }

  // checklist_items 저장
  const checklistRows = guide.checklist.map((item) => ({
    guide_session_id: session.id,
    user_id: userId,
    item: item.item,
    is_done: false,
  }))

  const { error: checklistError } = await supabase
    .from('checklist_items')
    .insert(checklistRows)

  if (checklistError) {
    console.error('[Guide API] checklist_items 저장 실패:', checklistError.message)
  }

  console.log(`[Guide API] DB 저장 완료 - session_id: ${session.id}`)
  return session.id
}

export async function POST(req: NextRequest) {
  const body: GuideRequest = await req.json()
  const { role, situation, teamSize, domain, careerYears, mainConcern } = body

  if (!role || !situation) {
    return NextResponse.json(
      { success: false, error: '직책과 상황은 필수입니다' },
      { status: 400 }
    )
  }

  // 로그인 유저 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Rate limit 체크 (free 플랜만)
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.plan ?? 'free'

    if (plan === 'free') {
      const adminClient = await createAdminClient()
      const { data: config } = await adminClient
        .from('app_config')
        .select('value')
        .eq('key', 'guide_rate_limit_seconds')
        .single()

      const limitSeconds = parseInt(config?.value ?? '60', 10)

      const { data: lastSession } = await supabase
        .from('guide_sessions')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (lastSession) {
        const secondsAgo = (Date.now() - new Date(lastSession.created_at).getTime()) / 1000
        if (secondsAgo < limitSeconds) {
          const remaining = Math.ceil(limitSeconds - secondsAgo)
          return NextResponse.json(
            { success: false, error: `${remaining}초 후 다시 시도할 수 있습니다.` },
            { status: 429 }
          )
        }
      }
    }
  }

  // API 키 없으면 mock 반환 (DB 저장 생략)
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('여기에')) {
    await new Promise((r) => setTimeout(r, 1000))
    return NextResponse.json({ success: true, guide: MOCK_RESPONSE, isMock: true })
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const userPrompt = `아래 정보를 바탕으로 업무 가이드를 제공해주세요.

[내 정보]
- 직책: ${role}
- 상황: ${situation}
- 팀 규모: ${teamSize ?? '미입력'}명
- 업종/도메인: ${domain ?? '미입력'}
- 경력: ${careerYears ?? '미입력'}년차
- 현재 가장 큰 고민: ${mainConcern ?? '없음'}

위 내용을 바탕으로 지금 당장 집중해야 할 것을 우선순위 순서로 가이드해주세요.`

  try {
    console.log(`[Guide API] OpenAI 호출 - role: ${role}, situation: ${situation}`)
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    })

    const text = completion.choices[0].message.content ?? ''
    const guide: GuideResult = JSON.parse(text)
    const tokensUsed = completion.usage?.total_tokens

    console.log(`[Guide API] 응답 완료 - tokens: ${tokensUsed}`)

    // 로그인 유저면 DB 저장
    let sessionId: string | null = null
    if (user) {
      sessionId = await saveGuideSession(user.id, body, guide, tokensUsed)
    }

    return NextResponse.json({ success: true, guide, sessionId })
  } catch (error) {
    console.error('Guide API error:', error)
    return NextResponse.json(
      { success: false, error: '가이드 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}

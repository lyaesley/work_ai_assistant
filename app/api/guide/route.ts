import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GuideRequest, GuideResult } from '@/types/guide'
import { createClient } from '@/lib/supabase/server'

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
- 추상적 조언 금지. 구체적이고 실행 가능한 내용만
- 우선순위를 명확히 (오늘 / 이번 주 / 이번 달)
- 반드시 아래 JSON 형식으로만 응답. 다른 텍스트 없이.

[응답 JSON 형식]
{
  "summary": "현재 상황 한 줄 요약",
  "priority_tasks": [
    {"period": "오늘", "task": "...", "reason": "왜 중요한지"},
    {"period": "이번 주", "task": "...", "reason": "..."}
  ],
  "checklist": [
    {"item": "체크리스트 항목", "done": false}
  ],
  "watch_out": ["이 상황에서 흔히 하는 실수 1", "실수 2"],
  "questions_to_ask": ["스스로 또는 팀에게 물어볼 질문"],
  "week_plan": {
    "week1": "1주차 핵심 목표",
    "week2": "2주차 핵심 목표",
    "week3": "3주차 핵심 목표",
    "week4": "4주차 핵심 목표"
  }
}`

// 개발용 mock 응답 (API 키 없을 때 사용)
const MOCK_RESPONSE: GuideResult = {
  summary: '팀장으로서 첫 주, 팀원 파악과 신뢰 구축이 최우선입니다.',
  priority_tasks: [
    {
      period: '오늘',
      task: '팀원 전원과 개별 30분 미팅 일정 잡기',
      reason: '각자의 현재 업무·고민·기대치를 파악해야 다음 단계 계획이 가능합니다',
    },
    {
      period: '이번 주',
      task: '현재 진행 중인 프로젝트 현황 파악',
      reason: '어떤 일이 진행 중인지 모르면 의사결정을 할 수 없습니다',
    },
    {
      period: '이번 달',
      task: '팀 목표·KPI 상위 리더와 정렬',
      reason: '팀이 나아가야 할 방향을 명확히 해야 합니다',
    },
  ],
  checklist: [
    { item: '팀원 개별 1on1 미팅 완료', done: false },
    { item: '현재 프로젝트 목록 및 일정 파악', done: false },
    { item: '팀의 주간 보고 사이클 확인', done: false },
    { item: '이전 팀장에게 인수인계 요청', done: false },
    { item: '나의 KPI·목표 상위 리더와 확인', done: false },
  ],
  watch_out: [
    '첫 주부터 너무 많은 것을 바꾸려 하면 팀이 불안해집니다',
    '팀원을 파악하기 전에 업무 분배를 바꾸면 역효과',
    '이전 팀장의 방식을 무조건 부정하면 신뢰를 잃음',
  ],
  questions_to_ask: [
    '팀원 각자가 지금 가장 힘든 점은?',
    '팀이 잘 되고 있는 부분과 개선이 필요한 부분은?',
    '상위 리더가 이 팀에 기대하는 것은?',
  ],
  week_plan: {
    week1: '팀원 파악 및 신뢰 구축, 현황 이해',
    week2: '업무 프로세스 파악 및 개선 포인트 발굴',
    week3: '팀 목표·KPI 정렬 및 공유',
    week4: '첫 번째 팀 회고 및 다음 달 계획 수립',
  },
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

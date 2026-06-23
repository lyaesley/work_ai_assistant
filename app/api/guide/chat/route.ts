import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  const { role, situation, domain, careerYears, teamSize, message, history } = await req.json()

  if (!message || !role || !situation) {
    return NextResponse.json({ success: false, error: '필수값 누락' }, { status: 400 })
  }

  const systemPrompt = `당신은 한국 직장인을 위한 업무 AI 비서입니다.
현재 사용자 컨텍스트:
- 직책: ${role}
- 상황: ${situation}
- 업종: ${domain ?? '미입력'}
- 경력: ${careerYears ?? '미입력'}년차
- 팀 규모: ${teamSize ?? '미입력'}명

위 ${role} 입장에서 궁금해하는 것에 대해 구체적이고 실용적으로 답변하세요.

[응답 원칙]
- 항상 한국어로 응답
- 목록이 필요하면 번호 또는 줄바꿈으로 명확하게 나열
- 추상적인 조언보다 당장 쓸 수 있는 구체적인 내용 위주
- 짧고 명확하게 (500자 이내 권장)`

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...(history ?? []).map((m: ChatMessage) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: message },
  ]

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 800,
    })

    const answer = completion.choices[0].message.content ?? ''
    return NextResponse.json({ success: true, answer })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ success: false, error: '답변 생성 실패' }, { status: 500 })
  }
}

'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type ChatContext = {
  role: string
  situation: string
  domain?: string | null
  careerYears?: number | null
  teamSize?: number | null
}

type Props = {
  context: ChatContext
}

export default function GuideChat({ context }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/guide/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: context.role,
          situation: context.situation,
          domain: context.domain,
          careerYears: context.careerYears,
          teamSize: context.teamSize,
          message: text,
          history: messages,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages([...nextMessages, { role: 'assistant', content: data.answer }])
      }
    } catch {
      setMessages([...nextMessages, { role: 'assistant', content: '오류가 발생했습니다. 다시 시도해주세요.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-sm font-semibold text-gray-700">💬 더 물어보기</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {context.role} · {context.situation} 컨텍스트로 답변합니다
        </p>
      </div>

      {/* 메시지 영역 */}
      {messages.length > 0 && (
        <div className="px-4 py-4 space-y-3 max-h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* 입력창 */}
      <div className={`flex gap-2 p-3 ${messages.length > 0 ? 'border-t border-gray-100' : ''}`}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`${context.role}로서 궁금한 것을 물어보세요 (Enter로 전송)`}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          style={{ minHeight: '42px', maxHeight: '120px' }}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = Math.min(el.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors shrink-0"
        >
          전송
        </button>
      </div>
    </div>
  )
}

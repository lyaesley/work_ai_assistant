import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">직장인 AI 업무 비서</h1>
        <p className="text-gray-500 mb-8">직책과 상황을 입력하면 지금 해야 할 일을 알려드립니다</p>
        <Link
          href="/guide"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          가이드 시작하기
        </Link>
      </div>
    </main>
  )
}

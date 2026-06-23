'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/auth/actions'

export default function NavBar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.profile?.plan === 'admin') setIsAdmin(true)
      })
      .catch(() => {})
  }, [])

  const links = [
    { href: '/guide', label: '가이드' },
    { href: '/history', label: '히스토리' },
    { href: '/profile', label: '프로필' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/guide" className="font-bold text-gray-900 text-base hover:text-blue-600 transition-colors">
          AI 업무 가이드
        </Link>

        {/* 네비 */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === href
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-purple-600 hover:bg-purple-50'
              }`}
            >
              어드민
            </Link>
          )}
          <button
            onClick={() => signOut()}
            className="ml-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            로그아웃
          </button>
        </nav>
      </div>
    </header>
  )
}

'use client'

import { usePathname } from 'next/navigation'
import NavBar from './NavBar'

const HIDE_ON = ['/login', '/signup']

export default function NavBarWrapper() {
  const pathname = usePathname()
  if (HIDE_ON.includes(pathname)) return null
  return <NavBar />
}

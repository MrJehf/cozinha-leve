'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return (
      <main className="min-h-screen w-full overflow-hidden bg-cozinha-bg">
        {children}
      </main>
    )
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen pb-10">
        {children}
      </main>
    </>
  )
}

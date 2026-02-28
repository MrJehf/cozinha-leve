'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Dancing_Script } from 'next/font/google'
import { createClient } from '@/utils/supabase/client'

const dancingScript = Dancing_Script({ subsets: ['latin'] })

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      }
    }
    checkRole()
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cozinha-bg/90 shadow-sm backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/receita" className="flex items-center gap-2">
          <div className="relative h-10 w-10">
            <Image
              src="/logo.svg"
              alt="Cozinha Leve Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className={`${dancingScript.className} text-2xl font-bold text-cozinha-text-secondary`}>
            Cozinha Leve
          </span>
        </Link>

        {/* Admin quick link */}
        {isAdmin && (
          <Link
            href="/admin"
            className="text-xs font-medium text-cozinha-highlight hover:text-cozinha-cta transition rounded-full bg-cozinha-highlight/10 px-3 py-1"
          >
            Admin
          </Link>
        )}
      </div>
    </header>
  )
}

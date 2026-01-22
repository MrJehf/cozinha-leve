'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Dancing_Script } from 'next/font/google'

const dancingScript = Dancing_Script({ subsets: ['latin'] })

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
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
      setLoading(false)
    }
    checkRole()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsMenuOpen(false)
    router.refresh()
  }

  // Define menu items based on role
  const menuItems = isAdmin 
    ? [
        { label: 'Home', href: '/' },
        { label: 'Receitas', href: '/receita' },
        { label: 'Gerenciar', href: '/admin' },
      ]
    : [
        { label: 'Receitas', href: '/receita' },
        { label: 'Favoritos', href: '/favoritos' },
      ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cozinha-bg/90 shadow-sm backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-14 w-14">
            <Image 
              src="/logo.svg" 
              alt="Cozinha Leve Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className={`${dancingScript.className} text-3xl font-bold text-cozinha-text-secondary`}>Cozinha Leve</span>
        </Link>

        {/* Desktop Navigation */}
        {!loading && (
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="text-cozinha-text hover:text-cozinha-cta transition font-medium"
              >
                {item.label}
              </Link>
            ))}
            <button 
              onClick={handleLogout}
              className="text-[#F47C7C] hover:opacity-80 transition font-medium"
            >
              Sair
            </button>
          </nav>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-cozinha-text p-1"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 border-t border-gray-100 bg-cozinha-bg p-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-4">
            {!loading && menuItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 hover:bg-cozinha-soft rounded-lg text-cozinha-text font-medium"
                >
                  {item.label}
                </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-cozinha-soft rounded-lg font-medium text-[#F47C7C]"
            >
              Sair
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}

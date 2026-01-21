'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsMenuOpen(false)
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cozinha-bg/90 shadow-sm backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {/* <ChefHat className="h-8 w-8 text-cozinha-cta" /> */}
          <div className="relative h-14 w-14">
            <Image 
              src="/logo.svg" 
              alt="Cozinha Leve Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold text-cozinha-text">Cozinha Leve</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-cozinha-text hover:text-cozinha-cta transition font-medium">
            Home
          </Link>
          <Link href="/admin" className="text-cozinha-text hover:text-cozinha-cta transition font-medium">
            Gerenciar
          </Link>
          <button 
            onClick={handleLogout}
            className="text-[#F47C7C] hover:opacity-80 transition font-medium"
          >
            Sair
          </button>
        </nav>

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
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2 hover:bg-cozinha-soft rounded-lg text-cozinha-text font-medium"
            >
              Home
            </Link>
            <Link 
              href="/admin" 
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2 hover:bg-cozinha-soft rounded-lg text-cozinha-text font-medium"
            >
              Gerenciar
            </Link>
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

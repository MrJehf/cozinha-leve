'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Home, CalendarDays, Heart, User } from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/receita', icon: Home },
  { label: 'Rotina', href: '/rotina', icon: CalendarDays },
  { label: '', href: '#', icon: null }, // Center logo — purely visual
  { label: 'Favoritas', href: '/favoritos', icon: Heart },
  { label: 'Perfil', href: '/perfil', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Curved background shape */}
      <div className="relative">
        {/* SVG notch behind center button */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-20 h-5 z-10">
          <svg
            viewBox="0 0 80 20"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-sm"
            preserveAspectRatio="none"
          >
            <path d="M0 20 C0 20, 10 20, 18 8 C24 0, 30 -2, 40 -2 C50 -2, 56 0, 62 8 C70 20, 80 20, 80 20 L80 20 L0 20 Z" />
          </svg>
        </div>

        {/* Main bar */}
        <div
          className="flex items-end justify-around bg-white pt-2 pb-2 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          {navItems.map((item, idx) => {
            if (idx === 2) {
              // Center logo button — purely visual
              return (
                <div
                  key="logo-center"
                  className="relative flex flex-col items-center -mt-9"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-cozinha-highlight shadow-lg border-4 border-white">
                    <div className="relative w-9 h-9">
                      <Image
                        src="/logo.svg"
                        alt="Cozinha Leve"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              )
            }

            const isActive =
              pathname === item.href ||
              (item.href === '/receita' && pathname === '/')

            const IconComponent = item.icon!

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 min-w-[56px] pt-1"
              >
                <IconComponent
                  size={24}
                  className={
                    isActive
                      ? 'text-cozinha-cta'
                      : 'text-cozinha-text-secondary'
                  }
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={`text-[10px] font-medium leading-tight ${
                    isActive
                      ? 'text-cozinha-cta'
                      : 'text-cozinha-text-secondary'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

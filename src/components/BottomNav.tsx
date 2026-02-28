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
      {/* Center logo — floats above the bar */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-[30px] z-30">
        <div className="relative">
          {/* White ring that creates the circular cutout illusion */}
          <div className="absolute inset-0 rounded-full scale-[1.15] bg-cozinha-bg" />
          {/* Green logo circle */}
          <div className="relative flex items-center justify-center w-[68px] h-[68px] rounded-full bg-cozinha-highlight shadow-lg">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.svg"
                alt="Cozinha Leve"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* White bar */}
      <div
        className="relative bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Circular notch — background-colored circle that "cuts" into the bar */}
<div className="absolute -top-[30px] left-1/2 -translate-x-1/2 w-[84px] h-[84px] rounded-full bg-white z-10" />

        {/* Navigation items */}
        <div className="relative z-20 flex items-center justify-around py-2">
          {navItems.map((item, idx) => {
            if (idx === 2) {
              // Spacer for center logo area
              return <div key="logo-center" className="w-[76px]" />
            }

            const isActive =
              pathname === item.href ||
              (item.href === '/receita' && pathname === '/')

            const IconComponent = item.icon!

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 min-w-[56px]"
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

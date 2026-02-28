'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-cozinha-cta/10 px-4 py-3 font-semibold text-cozinha-cta transition hover:bg-cozinha-cta/20"
    >
      <LogOut size={18} />
      Sair da conta
    </button>
  )
}

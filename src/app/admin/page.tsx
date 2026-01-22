'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import RecipeForm from '@/components/RecipeForm'

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh() // Clear cache
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-cozinha-text">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <a href="/admin/users" className="text-sm font-medium text-cozinha-cta hover:text-cozinha-hover underline">
            Gerenciar Usuários
          </a>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-bold"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>

      <RecipeForm />
    </div>
  )
}

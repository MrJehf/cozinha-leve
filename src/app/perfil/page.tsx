import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import EditNameForm from './EditNameForm'
import Link from 'next/link'
import { KeyRound, ChevronRight } from 'lucide-react'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="text-3xl font-bold text-cozinha-text mb-8 text-center">
        Meu Perfil
      </h1>

      <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-black/5">
        {/* User info header */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-bold text-cozinha-text">
            {profile?.full_name || 'Usuário'}
          </h2>
          <p className="text-sm text-cozinha-text-secondary mt-1">
            {user.email}
          </p>
          {profile?.role && (
            <span className="mt-2 inline-block rounded-full bg-cozinha-highlight/20 px-3 py-0.5 text-xs font-semibold text-cozinha-highlight">
              {profile.role === 'admin' ? 'Administrador' : 'Cliente'}
            </span>
          )}
        </div>

        {/* Account Settings */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-xs text-cozinha-text-secondary uppercase tracking-wider mb-4 font-semibold">
            Configurações da Conta
          </h3>

          <div className="space-y-5">
            {/* Edit Name */}
            <EditNameForm currentName={profile?.full_name || ''} />

            {/* Change Password */}
            <div>
              <p className="text-xs text-cozinha-text-secondary uppercase tracking-wider mb-1">
                Senha
              </p>
              <Link
                href="/perfil/alterar-senha"
                className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 transition hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-lg bg-cozinha-cta/10 p-2">
                    <KeyRound size={18} className="text-cozinha-cta" />
                  </div>
                  <span className="font-medium text-cozinha-text">Alterar senha</span>
                </div>
                <ChevronRight size={18} className="text-cozinha-text-secondary group-hover:text-cozinha-text transition" />
              </Link>
            </div>

            {/* Email (read-only) */}
            <div>
              <p className="text-xs text-cozinha-text-secondary uppercase tracking-wider mb-1">
                E-mail
              </p>
              <p className="text-cozinha-text font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

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
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cozinha-soft text-4xl mb-3">
            👤
          </div>
          <h2 className="text-xl font-bold text-cozinha-text">
            {profile?.full_name || 'Usuário'}
          </h2>
          <p className="text-sm text-cozinha-text-secondary">
            {user.email}
          </p>
          {profile?.role && (
            <span className="mt-2 inline-block rounded-full bg-cozinha-highlight/20 px-3 py-0.5 text-xs font-semibold text-cozinha-highlight">
              {profile.role === 'admin' ? 'Administrador' : 'Cliente'}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <div>
            <p className="text-xs text-cozinha-text-secondary uppercase tracking-wider mb-1">
              E-mail
            </p>
            <p className="text-cozinha-text font-medium">{user.email}</p>
          </div>
          {profile?.full_name && (
            <div>
              <p className="text-xs text-cozinha-text-secondary uppercase tracking-wider mb-1">
                Nome
              </p>
              <p className="text-cozinha-text font-medium">
                {profile.full_name}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import EditNameForm from './EditNameForm'
import PushNotifications from '@/components/PushNotifications'
import Link from 'next/link'
import { KeyRound, ChevronRight, Clock } from 'lucide-react'

function getDaysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

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

  const daysRemaining = getDaysRemaining(profile?.expires_at ?? null)
  const isLifetime = profile?.plan === 'lifetime' || !profile?.expires_at
  const isAdmin = profile?.role === 'admin'

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
              {isAdmin ? 'Administrador' : 'Cliente'}
            </span>
          )}
        </div>

        {/* Contador de acesso */}
        {!isAdmin && (
          <div className={`mb-6 rounded-xl px-4 py-3 flex items-center gap-3 ${
            isLifetime
              ? 'bg-green-50 border border-green-200'
              : daysRemaining !== null && daysRemaining <= 3
              ? 'bg-red-50 border border-red-200'
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <Clock size={18} className={
              isLifetime ? 'text-green-600' :
              daysRemaining !== null && daysRemaining <= 3 ? 'text-red-500' : 'text-amber-500'
            } />
            <div>
              <p className={`text-sm font-semibold ${
                isLifetime ? 'text-green-700' :
                daysRemaining !== null && daysRemaining <= 3 ? 'text-red-600' : 'text-amber-700'
              }`}>
                {isLifetime
                  ? 'Acesso vitalício'
                  : daysRemaining !== null && daysRemaining > 0
                  ? `${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`
                  : 'Acesso expirado'}
              </p>
              <p className="text-xs text-cozinha-text-secondary mt-0.5">
                {isLifetime
                  ? 'Você tem acesso completo para sempre'
                  : daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0
                  ? 'Seu acesso está quase no fim. Renove agora!'
                  : daysRemaining !== null && daysRemaining > 0
                  ? 'Aproveite todas as receitas enquanto seu acesso é válido'
                  : ''}
              </p>
            </div>
          </div>
        )}

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

            {/* Push Notifications (apenas para não-admin e não-vitalício) */}
            {!isAdmin && !isLifetime && (
              <PushNotifications />
            )}

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

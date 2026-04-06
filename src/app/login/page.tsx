'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Mode = 'magic' | 'password'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('magic')

  // Magic link state
  const [magicEmail, setMagicEmail] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [magicError, setMagicError] = useState<string | null>(null)

  // Password state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setMagicLoading(true)
    setMagicError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMagicError('Não foi possível enviar o link. Verifique o e-mail e tente novamente.')
    } else {
      setMagicSent(true)
    }
    setMagicLoading(false)
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwLoading(true)
    setPwError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setPwError('E-mail ou senha incorretos.')
      setPwLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-cozinha-bg px-4 pb-60 pt-32">
      <div className="mb-14 flex flex-col items-center justify-center">
        <div className="relative mb-2 h-64 w-64">
          <Image
            src="/logo.svg"
            alt="Cozinha Leve Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h2 className="text-center text-2xl font-medium text-cozinha-text">
          Bem-vindo(a) ao
          <br />
          <span className="font-bold text-cozinha-cta">Cozinha</span>{' '}
          <span className="font-bold text-cozinha-soft">Leve</span>
        </h2>
      </div>

      <div className="w-full max-w-md rounded-3xl bg-cozinha-card p-8 shadow-lg border border-cozinha-cta">
        {/* Tabs */}
        <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setMode('magic')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'magic'
                ? 'bg-white text-cozinha-cta shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Link por e-mail
          </button>
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'password'
                ? 'bg-white text-cozinha-cta shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            E-mail e senha
          </button>
        </div>

        {/* Magic Link */}
        {mode === 'magic' && (
          <>
            {magicSent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">📬</div>
                <h3 className="text-lg font-bold text-cozinha-text mb-2">Verifique seu e-mail</h3>
                <p className="text-sm text-cozinha-text-secondary leading-relaxed">
                  Enviamos um link de acesso para{' '}
                  <span className="font-semibold text-cozinha-text">{magicEmail}</span>.
                  Clique no link para entrar.
                </p>
                <button
                  type="button"
                  onClick={() => { setMagicSent(false); setMagicEmail('') }}
                  className="mt-6 text-sm text-cozinha-cta underline"
                >
                  Usar outro e-mail
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <p className="text-sm text-cozinha-text-secondary mb-2">
                  Digite seu e-mail e enviaremos um link para você entrar sem precisar de senha.
                </p>
                {magicError && (
                  <div className="rounded bg-red-100 p-3 text-sm text-red-600">{magicError}</div>
                )}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">E-mail</label>
                  <input
                    type="email"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-base focus:border-cozinha-highlight focus:outline-none"
                    placeholder="seu@email.com"
                    required
                    suppressHydrationWarning
                  />
                </div>
                <button
                  type="submit"
                  disabled={magicLoading}
                  className="w-full rounded-xl bg-cozinha-cta py-3 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {magicLoading ? 'Enviando...' : 'Enviar link de acesso'}
                </button>
              </form>
            )}
          </>
        )}

        {/* Password */}
        {mode === 'password' && (
          <form onSubmit={handlePassword} className="space-y-4">
            {pwError && (
              <div className="rounded bg-red-100 p-3 text-sm text-red-600">{pwError}</div>
            )}
            <div>
              <label className="mb-2 block text-lg font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-lg focus:border-cozinha-highlight focus:outline-none"
                required
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="mb-2 block text-lg font-medium text-gray-700">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-lg focus:border-cozinha-highlight focus:outline-none"
                required
                suppressHydrationWarning
              />
            </div>
            <button
              type="submit"
              disabled={pwLoading}
              className="w-full rounded-xl bg-cozinha-cta py-3 text-xl font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {pwLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

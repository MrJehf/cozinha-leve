'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/') // Redirect to home (middleware handles role-based routing)
      router.refresh()
    }
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-cozinha-bg px-4 pb-60 pt-32">
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
          Bem-vindo(a) ao<br />
          <span className="text-cozinha-cta font-bold">Cozinha</span>{' '}
          <span className="text-cozinha-soft font-bold">Leve</span>
        </h2>
      </div>

      <div className="w-full max-w-md rounded-3xl bg-cozinha-card p-8 shadow-lg border border-cozinha-cta">
        <h1 className="mb-6 text-center text-3xl font-bold text-cozinha-cta">Login</h1>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-lg font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-lg focus:border-cozinha-highlight focus:outline-none"
              required
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
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cozinha-cta py-3 text-xl font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

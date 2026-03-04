'use client'

import { useState, useMemo } from 'react'
import { changeOwnPassword } from '@/app/actions/user-actions'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: '', color: '' }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { level: 1, label: 'Fraca', color: '#F47C7C' }
  if (score <= 2) return { level: 2, label: 'Razoável', color: '#FFB347' }
  if (score <= 3) return { level: 3, label: 'Boa', color: '#87CEEB' }
  if (score <= 4) return { level: 4, label: 'Forte', color: '#7ED6B2' }
  return { level: 5, label: 'Muito forte', color: '#4CAF50' }
}

export default function AlterarSenhaPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword])

  const validationErrors = useMemo(() => {
    const errors: string[] = []
    if (newPassword && newPassword.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres.')
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      errors.push('As senhas não coincidem.')
    }
    return errors
  }, [newPassword, confirmPassword])

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await changeOwnPassword(currentPassword, newPassword)

    if (result.success) {
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      // Redirect back to profile after a moment
      setTimeout(() => router.push('/perfil'), 2000)
    } else {
      setError(result.error || 'Erro ao alterar senha.')
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/perfil"
          className="flex items-center justify-center rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5 transition hover:bg-gray-50"
        >
          <ArrowLeft size={20} className="text-cozinha-text" />
        </Link>
        <h1 className="text-2xl font-bold text-cozinha-text">Alterar Senha</h1>
      </div>

      {/* Security notice */}
      <div className="mb-6 flex items-start gap-3 rounded-xl bg-cozinha-highlight/10 p-4">
        <ShieldCheck size={20} className="mt-0.5 flex-shrink-0 text-cozinha-highlight" />
        <p className="text-sm text-cozinha-text-secondary">
          Para sua segurança, informe sua senha atual antes de definir uma nova senha.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cozinha-text">
              Senha atual
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Lock size={16} className="text-cozinha-text-secondary" />
              </div>
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-12 text-cozinha-text focus:border-cozinha-highlight focus:outline-none transition"
                placeholder="Digite sua senha atual"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cozinha-text-secondary hover:text-cozinha-text transition"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* New Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cozinha-text">
              Nova senha
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Lock size={16} className="text-cozinha-text-secondary" />
              </div>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-12 text-cozinha-text focus:border-cozinha-highlight focus:outline-none transition"
                placeholder="Mínimo de 8 caracteres"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cozinha-text-secondary hover:text-cozinha-text transition"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: i <= strength.level ? strength.color : '#E5E7EB',
                      }}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cozinha-text">
              Confirmar nova senha
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Lock size={16} className="text-cozinha-text-secondary" />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-12 text-cozinha-text focus:border-cozinha-highlight focus:outline-none transition"
                placeholder="Repita a nova senha"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cozinha-text-secondary hover:text-cozinha-text transition"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="rounded-lg bg-red-50 p-3">
              {validationErrors.map((err, i) => (
                <p key={i} className="text-sm text-red-500">{err}</p>
              ))}
            </div>
          )}

          {/* Server error */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-sm font-medium text-cozinha-highlight">
                ✅ Senha alterada com sucesso! Redirecionando...
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-cozinha-cta py-3 text-lg font-bold text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  )
}

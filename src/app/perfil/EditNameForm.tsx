'use client'

import { useState } from 'react'
import { updateOwnName } from '@/app/actions/user-actions'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X } from 'lucide-react'

interface EditNameFormProps {
  currentName: string
}

export default function EditNameForm({ currentName }: EditNameFormProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    if (name.trim() === currentName) {
      setEditing(false)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateOwnName(name)

    if (result.success) {
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } else {
      setError(result.error || 'Erro ao atualizar nome.')
    }

    setLoading(false)
  }

  const handleCancel = () => {
    setName(currentName)
    setEditing(false)
    setError(null)
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-cozinha-text-secondary uppercase tracking-wider mb-1">
            Nome de usuário
          </p>
          <p className="text-cozinha-text font-medium">{currentName}</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-lg bg-cozinha-highlight/10 px-3 py-1.5 text-sm font-medium text-cozinha-highlight transition hover:bg-cozinha-highlight/20"
        >
          <Pencil size={14} />
          Alterar
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-cozinha-text-secondary uppercase tracking-wider mb-2">
        Nome de usuário
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-cozinha-text focus:border-cozinha-highlight focus:outline-none transition"
          maxLength={50}
          minLength={2}
          autoFocus
          disabled={loading}
        />
        <button
          onClick={handleSave}
          disabled={loading || name.trim().length < 2}
          className="flex items-center justify-center rounded-lg bg-cozinha-highlight px-3 py-2 text-white transition hover:opacity-90 disabled:opacity-50"
          title="Salvar"
        >
          <Check size={18} />
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center justify-center rounded-lg bg-gray-200 px-3 py-2 text-cozinha-text transition hover:bg-gray-300"
          title="Cancelar"
        >
          <X size={18} />
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
      {success && (
        <p className="mt-2 text-sm text-cozinha-highlight">Nome atualizado com sucesso!</p>
      )}
    </div>
  )
}

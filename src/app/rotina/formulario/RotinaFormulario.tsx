'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ChefHat } from 'lucide-react'

const OBJETIVOS = ['Emagrecer', 'Manter peso', 'Ganhar massa magra']
const NIVEIS = ['Sedentária', 'Levemente ativa', 'Moderadamente ativa', 'Muito ativa']
const REFEICOES = ['3 refeições', '4 refeições', '5 refeições', '6 refeições']
const TEMPOS = ['Até 15 minutos', 'Até 30 minutos', 'Até 1 hora', 'Mais de 1 hora']
const RESTRICOES = [
  'Sem glúten',
  'Sem lactose',
  'Vegetariana',
  'Vegana',
  'Sem frutos do mar',
  'Sem amendoim',
  'Nenhuma',
]

interface FormData {
  peso: string
  altura: string
  idade: string
  objetivo: string
  nivel_atividade: string
  refeicoes_por_dia: string
  restricoes: string[]
  alimentos_nao_gosta: string
  tempo_cozinhar: string
}

const initialForm: FormData = {
  peso: '',
  altura: '',
  idade: '',
  objetivo: '',
  nivel_atividade: '',
  refeicoes_por_dia: '',
  restricoes: [],
  alimentos_nao_gosta: '',
  tempo_cozinhar: '',
}

export default function RotinaFormulario() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleRestricao(item: string) {
    setForm((prev) => {
      if (item === 'Nenhuma') {
        return { ...prev, restricoes: ['Nenhuma'] }
      }
      const sem = prev.restricoes.filter((r) => r !== 'Nenhuma')
      return {
        ...prev,
        restricoes: sem.includes(item) ? sem.filter((r) => r !== item) : [...sem, item],
      }
    })
  }

  function validate(): boolean {
    const { peso, altura, idade, objetivo, nivel_atividade, refeicoes_por_dia, restricoes, tempo_cozinhar } = form
    if (!peso || !altura || !idade || !objetivo || !nivel_atividade || !refeicoes_por_dia || !tempo_cozinhar) {
      setError('Preencha todos os campos obrigatórios.')
      return false
    }
    if (restricoes.length === 0) {
      setError('Selecione ao menos uma opção em Restrições alimentares.')
      return false
    }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/gerar-rotina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Erro ao gerar plano')
      }

      router.push('/rotina/plano')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cozinha-soft">
          <ChefHat size={28} className="text-cozinha-cta" />
        </div>
        <h1 className="text-2xl font-bold text-cozinha-text">Monte seu Plano Alimentar</h1>
        <p className="mt-1 text-sm text-cozinha-text-secondary">
          Responda as perguntas abaixo para gerar sua rotina personalizada.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dados físicos */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-cozinha-text-secondary">
            Dados físicos
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-cozinha-text">Peso (kg)</label>
              <input
                type="number"
                min="30"
                max="300"
                step="0.1"
                required
                placeholder="65"
                value={form.peso}
                onChange={(e) => set('peso', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-cozinha-text focus:border-cozinha-highlight focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-cozinha-text">Altura (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                required
                placeholder="165"
                value={form.altura}
                onChange={(e) => set('altura', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-cozinha-text focus:border-cozinha-highlight focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-cozinha-text">Idade</label>
              <input
                type="number"
                min="10"
                max="120"
                required
                placeholder="30"
                value={form.idade}
                onChange={(e) => set('idade', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-cozinha-text focus:border-cozinha-highlight focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Objetivo e atividade */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-cozinha-text-secondary">
            Objetivo e rotina
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-cozinha-text">Objetivo *</label>
              <select
                required
                value={form.objetivo}
                onChange={(e) => set('objetivo', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-cozinha-text focus:border-cozinha-highlight focus:outline-none"
              >
                <option value="">Selecione...</option>
                {OBJETIVOS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-cozinha-text">Nível de atividade física *</label>
              <select
                required
                value={form.nivel_atividade}
                onChange={(e) => set('nivel_atividade', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-cozinha-text focus:border-cozinha-highlight focus:outline-none"
              >
                <option value="">Selecione...</option>
                {NIVEIS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-cozinha-text">Refeições por dia *</label>
              <select
                required
                value={form.refeicoes_por_dia}
                onChange={(e) => set('refeicoes_por_dia', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-cozinha-text focus:border-cozinha-highlight focus:outline-none"
              >
                <option value="">Selecione...</option>
                {REFEICOES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-cozinha-text">
                Tempo disponível para cozinhar por dia *
              </label>
              <select
                required
                value={form.tempo_cozinhar}
                onChange={(e) => set('tempo_cozinhar', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-cozinha-text focus:border-cozinha-highlight focus:outline-none"
              >
                <option value="">Selecione...</option>
                {TEMPOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Restrições */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-cozinha-text-secondary">
            Restrições alimentares *
          </h2>
          <div className="flex flex-wrap gap-2">
            {RESTRICOES.map((r) => {
              const checked = form.restricoes.includes(r)
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRestricao(r)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    checked
                      ? 'border-cozinha-cta bg-cozinha-soft text-cozinha-cta'
                      : 'border-gray-200 bg-white text-cozinha-text-secondary hover:border-gray-300'
                  }`}
                >
                  {r}
                </button>
              )
            })}
          </div>
        </div>

        {/* Preferências */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-cozinha-text-secondary">
            Preferências
          </h2>
          <label className="mb-1 block text-xs font-medium text-cozinha-text">
            Alimentos que você não gosta (opcional)
          </label>
          <textarea
            rows={3}
            placeholder="Ex: fígado, brócolis, peixe..."
            value={form.alimentos_nao_gosta}
            onChange={(e) => set('alimentos_nao_gosta', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-cozinha-text focus:border-cozinha-highlight focus:outline-none resize-none"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cozinha-cta px-6 py-4 text-base font-bold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Gerando seu plano... (pode levar até 1 min)
            </>
          ) : (
            'Gerar meu plano alimentar'
          )}
        </button>

        {loading && (
          <p className="text-center text-xs text-cozinha-text-secondary">
            A IA está montando um plano personalizado só para você. Aguarde!
          </p>
        )}
      </form>
    </div>
  )
}

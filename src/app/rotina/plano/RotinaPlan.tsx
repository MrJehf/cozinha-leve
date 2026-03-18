'use client'

import { useState } from 'react'
import { Clock, Flame, AlertCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'

interface Refeicao {
  nome: string
  horario_sugerido: string
  alimentos: string[]
  porcoes: string[]
  calorias_aproximadas: number
  dica?: string
}

interface Dia {
  dia: string
  refeicoes: Refeicao[]
}

interface Plano {
  resumo_perfil: string
  calorias_diarias: number
  distribuicao_macros: {
    proteinas_pct: number
    carboidratos_pct: number
    gorduras_pct: number
  }
  dias: Dia[]
  orientacoes_gerais: string[]
  alimentos_evitar: string[]
}

const DIA_LABELS: Record<string, string> = {
  'Segunda-feira': 'Seg',
  'Terça-feira': 'Ter',
  'Quarta-feira': 'Qua',
  'Quinta-feira': 'Qui',
  'Sexta-feira': 'Sex',
  'Sábado': 'Sáb',
  'Domingo': 'Dom',
}

export default function RotinaPlan({
  plano,
  geradaEm,
  nome,
}: {
  plano: Plano
  geradaEm: string
  nome: string
}) {
  const [diaAtivo, setDiaAtivo] = useState(0)
  const [refeicaoAberta, setRefeicaoAberta] = useState<number | null>(null)

  const dataFormatada = geradaEm
    ? new Date(geradaEm).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const { proteinas_pct, carboidratos_pct, gorduras_pct } = plano.distribuicao_macros
  const diaAtual = plano.dias[diaAtivo]

  return (
    <div className="container mx-auto max-w-lg px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs text-cozinha-text-secondary">Plano gerado em {dataFormatada}</p>
        <h1 className="mt-0.5 text-xl font-bold text-cozinha-text">
          Rotina de {nome.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-cozinha-text-secondary leading-relaxed">
          {plano.resumo_perfil}
        </p>
      </div>

      {/* Card de macros */}
      <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-cozinha-text">Meta diária</span>
          <span className="flex items-center gap-1 text-sm font-bold text-cozinha-cta">
            <Flame size={15} />
            {plano.calorias_diarias} kcal
          </span>
        </div>

        {/* Barra de macros */}
        <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full">
          <div
            style={{ width: `${proteinas_pct}%` }}
            className="bg-[#7ED6B2]"
            title={`Proteínas ${proteinas_pct}%`}
          />
          <div
            style={{ width: `${carboidratos_pct}%` }}
            className="bg-[#8494FF]"
            title={`Carboidratos ${carboidratos_pct}%`}
          />
          <div
            style={{ width: `${gorduras_pct}%` }}
            className="bg-[#F47C7C]"
            title={`Gorduras ${gorduras_pct}%`}
          />
        </div>

        <div className="flex justify-between text-xs text-cozinha-text-secondary">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#7ED6B2]" />
            Proteínas {proteinas_pct}%
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#8494FF]" />
            Carbs {carboidratos_pct}%
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#F47C7C]" />
            Gorduras {gorduras_pct}%
          </span>
        </div>
      </div>

      {/* Navegação por dias */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {plano.dias.map((dia, i) => {
          const label = DIA_LABELS[dia.dia] ?? dia.dia.slice(0, 3)
          return (
            <button
              key={dia.dia}
              onClick={() => {
                setDiaAtivo(i)
                setRefeicaoAberta(null)
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                diaAtivo === i
                  ? 'bg-cozinha-cta text-white shadow-sm'
                  : 'bg-white text-cozinha-text-secondary ring-1 ring-black/10 hover:ring-cozinha-cta/40'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Refeições do dia */}
      <div className="mb-5 space-y-3">
        <h2 className="text-sm font-semibold text-cozinha-text">{diaAtual?.dia}</h2>

        {diaAtual?.refeicoes.map((refeicao, i) => {
          const aberta = refeicaoAberta === i
          return (
            <div key={i} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
              <button
                onClick={() => setRefeicaoAberta(aberta ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div>
                    <p className="text-sm font-semibold text-cozinha-text">{refeicao.nome}</p>
                    <p className="flex items-center gap-1 text-xs text-cozinha-text-secondary">
                      <Clock size={11} />
                      {refeicao.horario_sugerido}
                      <span className="mx-1">·</span>
                      <Flame size={11} className="text-cozinha-cta" />
                      {refeicao.calorias_aproximadas} kcal
                    </p>
                  </div>
                </div>
                {aberta ? (
                  <ChevronUp size={16} className="shrink-0 text-cozinha-text-secondary" />
                ) : (
                  <ChevronDown size={16} className="shrink-0 text-cozinha-text-secondary" />
                )}
              </button>

              {aberta && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                  <ul className="space-y-1.5">
                    {refeicao.alimentos.map((alimento, j) => (
                      <li key={j} className="flex items-start justify-between gap-2">
                        <span className="text-sm text-cozinha-text">{alimento}</span>
                        <span className="shrink-0 text-xs text-cozinha-text-secondary">
                          {refeicao.porcoes[j]}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {refeicao.dica && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-cozinha-soft/60 px-3 py-2">
                      <Lightbulb size={14} className="mt-0.5 shrink-0 text-cozinha-cta" />
                      <p className="text-xs text-cozinha-text">{refeicao.dica}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Orientações gerais */}
      {plano.orientacoes_gerais?.length > 0 && (
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-cozinha-text">
            <Lightbulb size={16} className="text-cozinha-highlight" />
            Orientações gerais
          </h2>
          <ul className="space-y-2">
            {plano.orientacoes_gerais.map((dica, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-cozinha-text">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cozinha-highlight" />
                {dica}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alimentos para evitar */}
      {plano.alimentos_evitar?.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-cozinha-text">
            <AlertCircle size={16} className="text-cozinha-cta" />
            Alimentos para evitar
          </h2>
          <div className="flex flex-wrap gap-2">
            {plano.alimentos_evitar.map((alimento, i) => (
              <span
                key={i}
                className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600"
              >
                {alimento}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

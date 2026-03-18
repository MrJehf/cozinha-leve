'use client'

import { useState } from 'react'
import { X, FileText, ClipboardList } from 'lucide-react'

interface RotinasRow {
  user_id: string
  email: string
  full_name: string | null
  rotina_plano: unknown
  rotina_form_data: unknown
  rotina_gerada_em: string | null
}

export default function AdminRotinasClient({ rows }: { rows: RotinasRow[] }) {
  const [modal, setModal] = useState<{ tipo: 'plano' | 'form'; dados: unknown; nome: string } | null>(null)

  function abrirModal(tipo: 'plano' | 'form', dados: unknown, nome: string) {
    setModal({ tipo, dados, nome })
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cozinha-text">Rotinas dos Clientes</h1>
          <p className="text-sm text-cozinha-text-secondary">
            {rows.length} cliente{rows.length !== 1 ? 's' : ''} com acesso à Rotina
          </p>
        </div>
        <a
          href="/admin"
          className="text-sm font-medium text-cozinha-cta underline hover:opacity-80"
        >
          ← Admin
        </a>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
          <p className="text-cozinha-text-secondary">Nenhum cliente com acesso à Rotina ainda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-cozinha-text-secondary">
                  Cliente
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-cozinha-text-secondary">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-cozinha-text-secondary">
                  Gerado em
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-cozinha-text-secondary">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row) => {
                const nome = row.full_name ?? row.email
                const temPlano = Boolean(row.rotina_plano)
                const dataFormatada = row.rotina_gerada_em
                  ? new Date(row.rotina_gerada_em).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : '—'

                return (
                  <tr key={row.user_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-cozinha-text">{nome}</p>
                      <p className="text-xs text-cozinha-text-secondary">{row.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {temPlano ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          Plano gerado
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          Aguardando
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-cozinha-text-secondary">{dataFormatada}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {temPlano && (
                          <button
                            onClick={() => abrirModal('plano', row.rotina_plano, nome)}
                            className="flex items-center gap-1 rounded-lg bg-cozinha-highlight/15 px-3 py-1.5 text-xs font-medium text-cozinha-highlight hover:bg-cozinha-highlight/25 transition"
                          >
                            <FileText size={13} />
                            Ver plano
                          </button>
                        )}
                        {row.rotina_form_data && (
                          <button
                            onClick={() => abrirModal('form', row.rotina_form_data, nome)}
                            className="flex items-center gap-1 rounded-lg bg-cozinha-soft px-3 py-1.5 text-xs font-medium text-cozinha-cta hover:bg-cozinha-soft/70 transition"
                          >
                            <ClipboardList size={13} />
                            Ver respostas
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 sm:items-center">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-cozinha-text">
                  {modal.tipo === 'plano' ? 'Plano alimentar' : 'Respostas do formulário'}
                </h2>
                <p className="text-xs text-cozinha-text-secondary">{modal.nome}</p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(80vh - 72px)' }}>
              {modal.tipo === 'form' ? (
                <FormDataView data={modal.dados as Record<string, unknown>} />
              ) : (
                <pre className="whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-xs text-gray-700 font-mono">
                  {JSON.stringify(modal.dados, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const LABELS: Record<string, string> = {
  peso: 'Peso (kg)',
  altura: 'Altura (cm)',
  idade: 'Idade',
  objetivo: 'Objetivo',
  nivel_atividade: 'Nível de atividade',
  refeicoes_por_dia: 'Refeições por dia',
  restricoes: 'Restrições alimentares',
  alimentos_nao_gosta: 'Alimentos que não gosta',
  tempo_cozinhar: 'Tempo para cozinhar',
}

function FormDataView({ data }: { data: Record<string, unknown> }) {
  return (
    <dl className="space-y-3">
      {Object.entries(data).map(([key, val]) => (
        <div key={key} className="flex flex-col gap-0.5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-cozinha-text-secondary">
            {LABELS[key] ?? key}
          </dt>
          <dd className="text-sm text-cozinha-text">
            {Array.isArray(val) ? val.join(', ') : String(val ?? '—')}
          </dd>
        </div>
      ))}
    </dl>
  )
}

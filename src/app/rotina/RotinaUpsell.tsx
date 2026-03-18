'use client'

import { Sparkles, CheckCircle, ArrowRight, Utensils, Calendar, Target } from 'lucide-react'

export default function RotinaUpsell() {
  const upsellUrl = process.env.NEXT_PUBLIC_UPSELL_ROTINA_URL ?? '#'

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      {/* Hero */}
      <div className="mb-6 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-cozinha-soft">
          <Sparkles size={32} className="text-cozinha-cta" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-cozinha-text">
          Sua Rotina Personalizada
        </h1>
        <p className="text-cozinha-text-secondary leading-relaxed">
          Um plano alimentar feito por nossa nutricionista expert exclusivamente para você — com base
          no seu corpo, objetivos e estilo de vida.
        </p>
      </div>

      {/* Benefícios */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-cozinha-text-secondary">
          O que você recebe
        </h2>
        <ul className="space-y-3">
          {[
            { icon: Calendar, text: '7 dias completos de cardápio personalizado' },
            { icon: Utensils, text: 'Refeições práticas com alimentos do dia a dia' },
            { icon: Target, text: 'Calorias e macros calculados para o seu objetivo' },
            { icon: CheckCircle, text: 'Respeita suas restrições e preferências alimentares' },
            { icon: Sparkles, text: 'Desenvolvido por nutricionista especializada' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <Icon size={18} className="mt-0.5 shrink-0 text-cozinha-highlight" />
              <span className="text-sm text-cozinha-text">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <a
        href={upsellUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cozinha-cta px-6 py-4 text-base font-bold text-white shadow-md transition hover:opacity-90 active:scale-95"
      >
        Quero minha Rotina Personalizada
        <ArrowRight size={20} />
      </a>

      <p className="mt-3 text-center text-xs text-cozinha-text-secondary">
        Compra única · Acesso vitalício ao seu plano
      </p>
    </div>
  )
}

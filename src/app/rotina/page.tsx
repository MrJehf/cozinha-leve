import { Construction } from 'lucide-react'

export default function RotinaPage() {
  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-lg ring-1 ring-black/5">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cozinha-soft">
          <Construction size={40} className="text-cozinha-cta" />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-cozinha-text">
          Em Construção
        </h1>

        <p className="mb-6 text-gray-500 leading-relaxed">
          A funcionalidade de <strong>Rotina</strong> está sendo desenvolvida
          com muito carinho. Em breve você poderá planejar suas refeições
          semanais aqui!
        </p>

        <div className="flex items-center gap-2 rounded-full bg-cozinha-highlight/15 px-4 py-2 text-sm font-medium text-cozinha-highlight">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cozinha-highlight opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cozinha-highlight"></span>
          </span>
          Em desenvolvimento
        </div>
      </div>
    </div>
  )
}

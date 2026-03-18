export default function AcessoExpiradoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="max-w-sm">
        <div className="text-5xl mb-6">⏰</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Seu acesso expirou
        </h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          O período do seu plano chegou ao fim. Para continuar acessando as receitas
          do Cozinha Leve, renove seu acesso.
        </p>
        <a
          href="https://pay.hotmart.com/N104950744U"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full transition-colors text-sm"
        >
          Renovar acesso
        </a>
        <p className="mt-6 text-xs text-gray-400">
          Dúvidas? Fale com a gente pelo WhatsApp.
        </p>
      </div>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import RecipeCard from '@/components/RecipeCard'

export const revalidate = 60 // Revalidate every minute

export default async function Home() {
  const supabase = await createClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <section className="mb-12 text-center">
        <div className="mb-4 inline-block rounded-full bg-cozinha-soft/50 px-4 py-1.5 text-sm font-medium text-cozinha-cta">
          Receitas leves & deliciosas
        </div>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-cozinha-text md:text-5xl lg:text-6xl">
          Sabor e saúde <br className="hidden sm:block" />
          <span className="text-cozinha-cta">na sua mesa todos os dias</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Descubra receitas práticas, nutritivas e saborosas pensadas para o seu bem-estar.
        </p>
      </section>

      {recipes && recipes.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-lg ring-1 ring-black/5">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cozinha-soft text-3xl">
            🍳
          </div>
          <h3 className="mb-2 text-xl font-bold text-cozinha-text">Nenhuma receita encontrada</h3>
          <p className="text-gray-500">
            Ainda não temos receitas cadastradas. Que tal adicionar a primeira?
          </p>
        </div>
      )}
    </div>
  )
}

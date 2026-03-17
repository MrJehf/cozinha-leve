import { createClient } from '@/utils/supabase/server'
import RecipeCard from '@/components/RecipeCard'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import { getUserFavoriteIds } from '@/app/actions/favorite-actions'
import { Suspense } from 'react'

export const revalidate = 60 // Revalidate every minute

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; subcategory?: string }>
}) {
  const { q, category, subcategory } = await searchParams
  const supabase = await createClient()
  
  // Build query based on filters
  let basicQuery;

  if (subcategory) {
    // Filter by subcategory (most specific filter)
    basicQuery = supabase
      .from('recipes')
      .select('*, categories(*), subcategories!inner(*)')
      .eq('subcategories.id', subcategory)
      .order('is_highlight', { ascending: false })
      .order('created_at', { ascending: false })
  } else if (category) {
    // Filter by category only
    basicQuery = supabase
      .from('recipes')
      .select('*, categories!inner(*), subcategories(*)')
      .eq('categories.id', category)
      .order('is_highlight', { ascending: false })
      .order('created_at', { ascending: false })
  } else {
    // No filter — get all recipes with their categories and subcategories
    basicQuery = supabase
      .from('recipes')
      .select('*, categories(*), subcategories(*)')
      .order('is_highlight', { ascending: false })
      .order('created_at', { ascending: false })
  }

  if (q) {
    basicQuery = basicQuery.ilike('title', `%${q}%`)
  }

  const { data: recipes } = await basicQuery
  const { data: { user } } = await supabase.auth.getUser()
  
  let isAdmin = false
  let favoriteIds: string[] = []
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
    favoriteIds = await getUserFavoriteIds()
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4">
      <section className="mb-2 text-center">
        <div className="mb-2 inline-block rounded-full bg-cozinha-soft/50 px-4 py-1.5 text-sm font-medium text-cozinha-cta">
          Receitas leves & deliciosas
        </div>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-cozinha-text md:text-5xl lg:text-6xl">
          Sabor e saúde <br className="hidden sm:block" />
          <span className="text-cozinha-cta">na sua mesa todos os dias</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          Descubra receitas práticas, nutritivas e saborosas pensadas para o seu bem-estar.
        </p>

        <div className="flex flex-col items-center justify-center gap-4">
          <Suspense>
             <SearchBar />
          </Suspense>
        </div>
      </section>

      <section className="mb-8 p-1">
        <Suspense>
           <CategoryFilter />
        </Suspense>
      </section>

      {recipes && recipes.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} isAdmin={isAdmin} isFavorite={favoriteIds.includes(String(recipe.id))} />
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

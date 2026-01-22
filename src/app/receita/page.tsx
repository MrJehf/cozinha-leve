import { createClient } from '@/utils/supabase/server'
import RecipeCard from '@/components/RecipeCard'
import SearchBar from '@/components/SearchBar'
import TagFilter from '@/components/TagFilter'
import { Suspense } from 'react'

export const revalidate = 60 // Revalidate every minute

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>
}) {
  const { q, tag } = await searchParams
  const supabase = await createClient()
  
  let query = supabase
    .from('recipes')
    .select('*, tags!inner(*)') // Use inner join if filtering by tag, otherwise left join is fine but we want to show tags anyway. 
                                // Actually, if we filter by tag, we need inner join logic or special filter.
                                // Supabase syntax for filtering by relation: .eq('tags.id', tagId) might not work directly on M-to-M easily without !inner.
                                // For now let's just select tags.
                                
  // Efficient M-to-M filtering in Supabase/PostgREST usually requires:
  // .eq('recipe_tags.tag_id', tag) but we are querying recipes.
  // We can use !inner on the join if we want to filter ONLY recipes that have that tag.
  
  // Let's construct the query more carefully.
  let basicQuery = supabase
       .from('recipes')
       .select('*, tags(*)')
       .order('created_at', { ascending: false })

  if (q) {
      basicQuery = basicQuery.ilike('title', `%${q}%`)
  }
  
  // Tag filtering needs to filter the PARENT (recipes) based on the CHILD (tags).
  // In Supabase standard client:
  if (tag) {
     // This is the tricky part with M-to-M. 
     // We can use !inner on the tags select to filter recipes that have at least one matching tag.
     basicQuery = supabase
       .from('recipes')
       .select('*, tags!inner(*)')
       .order('created_at', { ascending: false })
       .eq('tags.id', tag)
       
     if (q) {
         basicQuery = basicQuery.ilike('title', `%${q}%`)
     }
  }

  const { data: recipes } = await basicQuery
  const { data: { user } } = await supabase.auth.getUser()
  
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <section className="mb-2 text-center">
        <div className="mb-4 inline-block rounded-full bg-cozinha-soft/50 px-4 py-1.5 text-sm font-medium text-cozinha-cta">
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
           <TagFilter />
        </Suspense>
      </section>

      {recipes && recipes.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} isAdmin={isAdmin} />
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

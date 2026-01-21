import { createClient } from '@/utils/supabase/server'
import { Clock, Flame, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (!recipe) {
    notFound()
  }

  // Parse ingredients if stored as JSONB, assuming array of strings
  const ingredients = Array.isArray(recipe.ingredients) 
    ? recipe.ingredients 
    : typeof recipe.ingredients === 'string' 
      ? JSON.parse(recipe.ingredients) 
      : []

  return (
    <div className="container mx-auto max-w-4xl pb-10">
      <div className="sticky top-16 z-10 bg-cozinha-bg/95 p-4 backdrop-blur-sm">
        <Link href="/" className="inline-flex items-center gap-1 text-cozinha-text hover:text-cozinha-cta font-medium">
          <ChevronLeft size={20} />
          Voltar
        </Link>
      </div>

      {/* Video Player */}
      <div className="bg-black aspect-video w-full sm:rounded-xl overflow-hidden shadow-lg mb-6">
        {recipe.video_url ? (
            // Assuming embeddable URL or use a smart component. 
            // For MVP, iframe is safest if user provides embed URL.
            <iframe 
                src={recipe.video_url} 
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-white">No Video Available</div>
        )}
      </div>

      <div className="px-4">
        {/* Header Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cozinha-text mb-2">{recipe.title}</h1>
          <p className="text-xl text-gray-500 mb-4">{recipe.subtitle}</p>
          
          <div className="flex gap-4 border-y border-gray-200 py-4">
            <div className="flex items-center gap-2 text-cozinha-text font-medium">
              <Clock className="text-cozinha-highlight" />
              <span>{recipe.prep_time}</span>
            </div>
             <div className="flex items-center gap-2 text-cozinha-text font-medium">
              <Flame className="text-cozinha-cta" />
              <span>{recipe.calories}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ingredients */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-cozinha-text mb-4 pb-2 border-b border-gray-100">
              Ingredientes
            </h2>
            <ul className="space-y-3">
              {ingredients.map((ing: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 min-w-[6px] rounded-full bg-cozinha-highlight" />
                  <span>{ing}</span>
                </li>
              ))}
              {ingredients.length === 0 && <li className="text-gray-400">Nenhum ingrediente listado.</li>}
            </ul>
          </div>

          {/* Preparation Mode */}
          <div>
            <h2 className="text-xl font-bold text-cozinha-text mb-4 pb-2 border-b border-gray-100">
              Modo de Preparo
            </h2>
            <div className="prose prose-stone text-gray-700 whitespace-pre-line">
              {recipe.steps}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

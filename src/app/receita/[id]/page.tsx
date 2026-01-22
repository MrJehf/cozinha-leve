import { createClient } from '@/utils/supabase/server'
import { Clock, Flame, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import FavoriteButton from '@/components/FavoriteButton'

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

// Helper to extract video ID and create embed URL
  const getEmbedUrl = (url: string) => {
    try {
      if (!url) return ''
      
      // Handle already valid embed URLs
      if (url.includes('/embed/')) return url

      let videoId = ''
      // Regex to match various YouTube formats including Shorts
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = url.match(youtubeRegex)

      if (match && match[1]) {
        videoId = match[1]
        return `https://www.youtube.com/embed/${videoId}`
      }
      
      return url
    } catch (e) {
      console.error('Error parsing video URL:', e)
      return url
    }
  }

  const embedUrl = getEmbedUrl(recipe.video_url)

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
        {embedUrl ? (
            <iframe 
                src={embedUrl}
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
          
          <div className="flex items-center justify-between border-y border-gray-200 py-4">
            <div className="flex gap-6">
                <div className="flex items-center gap-2 text-cozinha-text font-medium">
                <Clock className="text-cozinha-highlight" />
                <span>{recipe.prep_time}</span>
                </div>
                <div className="flex items-center gap-2 text-cozinha-text font-medium">
                <Flame className="text-cozinha-cta" />
                <span>{recipe.calories}</span>
                </div>
            </div>
            
            <FavoriteButton recipeId={recipe.id} />
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
            <div className="prose prose-stone max-w-none text-gray-700">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {recipe.steps}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

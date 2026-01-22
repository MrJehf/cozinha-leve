'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, Flame, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'


// TODO: Define proper types
interface Recipe {
  id: string | number
  title: string
  subtitle?: string
  thumbnail_url?: string
  is_highlight?: boolean
  prep_time?: string
  calories?: string
}

interface RecipeCardProps {
  recipe: Recipe
  isAdmin?: boolean
}

export default function RecipeCard({ recipe, isAdmin }: RecipeCardProps) {
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent link navigation
    e.stopPropagation()
    
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipe.id)

    if (error) {
      alert('Erro ao excluir: ' + error.message)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="group block h-full relative">
      <Link href={`/receita/${recipe.id}`} className="block h-full">
        <div className="h-full overflow-hidden rounded-xl bg-cozinha-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
              {/* Thumbnail */}
            {recipe.thumbnail_url ? (
              <img
                src={recipe.thumbnail_url}
                alt={recipe.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
               <div className="flex h-full w-full items-center justify-center text-gray-400">
                  Sem imagem
               </div>
            )}
            
            {/* Highlight Badge */}
            {recipe.is_highlight && (
              <div className="absolute top-2 right-2 rounded-full bg-cozinha-highlight px-3 py-1 text-xs font-bold text-white shadow-sm">
                Destaque
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="mb-1 text-lg font-bold text-cozinha-text line-clamp-1 group-hover:text-cozinha-cta">
              {recipe.title}
            </h3>
            <p className="mb-3 text-sm text-gray-500 line-clamp-2">
              {recipe.subtitle}
            </p>

            <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{recipe.prep_time}</span>
              </div>
               <div className="flex items-center gap-1">
                <Flame size={14} />
                <span>{recipe.calories}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {isAdmin && (
        <div className="absolute top-2 left-2 flex gap-2 z-10">
          <Link
            href={`/admin/receita/${recipe.id}`}
            className="rounded-full bg-white p-2 text-blue-500 shadow-md hover:bg-blue-50 transition"
            onClick={(e) => e.stopPropagation()}
            title="Editar Receita"
          >
            <Pencil size={16} />
          </Link>
          <button
            onClick={handleDelete}
            className="rounded-full bg-white p-2 text-red-500 shadow-md hover:bg-red-50 transition"
            title="Excluir Receita"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

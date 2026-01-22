'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, Flame, Pencil, Trash2, Heart } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toggleFavorite, checkIsFavorite } from '@/app/actions/favorite-actions'

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
  isFavorite?: boolean
  hideBadge?: boolean
}

export default function RecipeCard({ recipe, isAdmin, isFavorite: initialIsFavorite = false, hideBadge = false }: RecipeCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loadingFav, setLoadingFav] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Determine if we should check the status. 
    // If it was passed as true, we assume it's true.
    // If false, it might just be unknown/default.
    // We can check to be sure, especially if we are in a list where we didn't pre-fetch user favorites.
    const checkStatus = async () => {
      // If we are admin, no need to check favorites
      if (isAdmin) return
      
      const status = await checkIsFavorite(String(recipe.id))
      setIsFavorite(status)
    }

    checkStatus()
  }, [recipe.id, isAdmin])

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loadingFav) return

    // Optimistic UI
    const previousState = isFavorite
    setIsFavorite(!isFavorite)
    setLoadingFav(true)

    const res = await toggleFavorite(String(recipe.id))
    
    setLoadingFav(false)

    if (!res.success) {
      alert('Erro ao atualizar favoritos: ' + res.error)
      setIsFavorite(previousState)
    }
  }

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
            {recipe.is_highlight && !hideBadge && (
              <div className="absolute top-2 right-2 rounded-full bg-cozinha-highlight px-3 py-1 text-xs font-bold text-white shadow-sm">
                Destaque
              </div>
            )}

            {/* Favorite Button (Visible for non-admins usually, or everyone) */}
            {!isAdmin && (
                <button
                    onClick={handleFavorite}
                    disabled={loadingFav}
                    className="absolute top-2 left-2 rounded-full bg-white/90 p-2 text-cozinha-cta shadow-sm hover:bg-white hover:scale-110 transition-all z-10 disabled:opacity-50"
                    title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                    <Heart size={18} className={isFavorite ? "fill-current" : ""} />
                </button>
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

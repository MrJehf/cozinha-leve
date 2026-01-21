'use client'

import Link from 'next/link'
import { Clock, Flame } from 'lucide-react'


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
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/receita/${recipe.id}`} className="group block h-full">
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
  )
}

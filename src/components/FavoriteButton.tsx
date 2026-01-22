'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavorite, checkIsFavorite } from '@/app/actions/favorite-actions'

interface FavoriteButtonProps {
  recipeId: string | number
  initialIsFavorite?: boolean
}

export default function FavoriteButton({ recipeId, initialIsFavorite = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkIsFavorite(String(recipeId))
      setIsFavorite(status)
    }
    checkStatus()
  }, [recipeId])

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return

    const previousState = isFavorite
    setIsFavorite(!isFavorite)
    setLoading(true)

    const res = await toggleFavorite(String(recipeId))
    setLoading(false)

    if (!res.success) {
      alert('Erro: ' + res.error)
      setIsFavorite(previousState)
    }
  }

  return (
    <button
      onClick={handleFavorite}
      disabled={loading}
      className={`rounded-full p-2 transition-all hover:scale-110 disabled:opacity-50 ${
        isFavorite 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400'
      }`}
      title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart size={20} className={isFavorite ? "fill-current" : ""} />
    </button>
  )
}

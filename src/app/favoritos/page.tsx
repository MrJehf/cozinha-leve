'use server'

import { getFavorites } from '@/app/actions/favorite-actions'
import RecipeCard from '@/components/RecipeCard'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function FavoritosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const recipes = await getFavorites()

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-cozinha-text mb-2">Meus Favoritos</h1>
                <p className="text-gray-500">
                    Receitas que você salvou para preparar depois.
                </p>
            </div>

            {recipes.length > 0 ? (
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {recipes.map((recipe: any) => (
                        <RecipeCard 
                          key={recipe.id} 
                          recipe={recipe} 
                          isFavorite={true} // Since it's in favorites page, it is favorite
                          hideBadge={true}
                        />
                    ))}
                 </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <h3 className="text-xl font-medium text-gray-400 mb-2">Nenhuma receita salva ainda</h3>
                    <p className="text-gray-400 mb-6">Explore nossas receitas e salve as que você mais gostar!</p>
                    <a 
                        href="/receita" 
                        className="inline-flex items-center justify-center rounded-lg bg-cozinha-cta px-6 py-3 font-bold text-white transition hover:bg-opacity-90"
                    >
                        Ver Receitas
                    </a>
                </div>
            )}
        </div>
    )
}

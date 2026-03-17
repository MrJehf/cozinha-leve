'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(recipeId: string) {
  const supabase =await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Check if already favorite
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id)

    if (error) return { success: false, error: error.message }
    
    revalidatePath('/')
    revalidatePath('/receita')
    revalidatePath('/favoritos')
    return { success: true, isFavorite: false }
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        recipe_id: recipeId
      })

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/receita')
    revalidatePath('/favoritos')
    return { success: true, isFavorite: true }
  }
}

export async function getFavorites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('favorites')
    .select(`
      recipe_id,
      recipes (
        *
      )
    `)
    .eq('user_id', user.id)

  if (!data) return []

  // Map to just recipes
  return data.map((item: any) => item.recipes)
}

export async function checkIsFavorite(recipeId: string) {
  const supabase =await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  return !!data
}

export async function getUserFavoriteIds(): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('favorites')
    .select('recipe_id')
    .eq('user_id', user.id)

  return (data ?? []).map((f: any) => String(f.recipe_id))
}

import { createClient } from '@/utils/supabase/server'
import RecipeForm from '@/components/RecipeForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Fetch recipe
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !recipe) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Receita não encontrada</h2>
        <Link href="/receita" className="mt-4 inline-block text-cozinha-cta hover:underline">
          Voltar para Receitas
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link href="/receita" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-cozinha-cta transition">
        <ArrowLeft size={16} /> Voltar para Receitas
      </Link>
      
      <RecipeForm initialData={recipe} recipeId={id} />
    </div>
  )
}

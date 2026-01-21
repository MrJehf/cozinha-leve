'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, LogOut } from 'lucide-react'

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    prep_time: '',
    calories: '',
    video_url: '',
    thumbnail_url: '',
    steps: '',
    is_highlight: false,
  })
  const [ingredients, setIngredients] = useState<string[]>([''])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh() // Clear cache
  }

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = value
    setIngredients(newIngredients)
  }

  const addIngredient = () => {
    setIngredients([...ingredients, ''])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length === 1) return
    const newIngredients = ingredients.filter((_, i) => i !== index)
    setIngredients(newIngredients)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    
    // Filter empty ingredients
    const validIngredients = ingredients.filter(i => i.trim() !== '')

    const { error } = await supabase.from('recipes').insert([{
      ...formData,
      ingredients: validIngredients
    }])

    setLoading(false)

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      setSuccess(true)
      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        prep_time: '',
        calories: '',
        video_url: '',
        thumbnail_url: '',
        steps: '',
        is_highlight: false,
      })
      setIngredients([''])
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-cozinha-text">Admin Dashboard</h1>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-bold"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="mb-6 text-xl font-bold text-gray-800 border-b pb-2">Nova Receita</h2>
        
        {success && (
          <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
            Receita salva com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-cozinha-cta focus:outline-none"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Subtítulo (breve descrição)</label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-cozinha-cta focus:outline-none"
              value={formData.subtitle}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tempo de Preparo</label>
              <input
                type="text"
                placeholder="ex: 30 min"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-cozinha-cta focus:outline-none"
                value={formData.prep_time}
                onChange={(e) => setFormData({...formData, prep_time: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Calorias</label>
              <input
                type="text"
                placeholder="ex: 120 Kcal"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-cozinha-cta focus:outline-none"
                value={formData.calories}
                onChange={(e) => setFormData({...formData, calories: e.target.value})}
              />
            </div>
          </div>

          {/* Media */}
          <div>
            <label className="block text-sm font-medium text-gray-700">URL do Vídeo (Embed)</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/embed/..."
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-cozinha-cta focus:outline-none"
              value={formData.video_url}
              onChange={(e) => setFormData({...formData, video_url: e.target.value})}
            />
            <p className="mt-1 text-xs text-gray-500">Use a URL de embed (ex: youtube.com/embed/ID)</p>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">URL da Thumbnail</label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-cozinha-cta focus:outline-none"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredientes</label>
            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={ing}
                    onChange={(e) => handleIngredientChange(idx, e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 p-2 focus:border-cozinha-cta focus:outline-none"
                    placeholder={`Ingrediente ${idx + 1}`}
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredient}
              className="mt-2 flex items-center gap-1 text-sm font-bold text-cozinha-cta hover:text-cozinha-highlight"
            >
              <Plus size={16} /> Adicionar Ingrediente
            </button>
          </div>

          {/* Steps */}
           <div>
            <label className="block text-sm font-medium text-gray-700">Modo de Preparo</label>
            <textarea
              rows={6}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-cozinha-cta focus:outline-none"
              value={formData.steps}
              onChange={(e) => setFormData({...formData, steps: e.target.value})}
            />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2">
             <input
              type="checkbox"
              id="highlight"
              checked={formData.is_highlight}
              onChange={(e) => setFormData({...formData, is_highlight: e.target.checked})}
              className="h-4 w-4 rounded border-gray-300 text-cozinha-cta focus:ring-cozinha-cta"
            />
            <label htmlFor="highlight" className="text-sm text-gray-700">Destaque na Home</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cozinha-cta py-3 font-bold text-white shadow-md transition hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Receita'}
          </button>
        </form>
      </div>
    </div>
  )
}

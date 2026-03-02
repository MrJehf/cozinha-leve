'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Category, Subcategory } from '@/types'

interface RecipeFormProps {
  initialData?: any
  recipeId?: string | number
  onSuccess?: () => void
}

export default function RecipeForm({ initialData, recipeId, onSuccess }: RecipeFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
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
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([])

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      if (cats) setAvailableCategories(cats)

      // Fetch subcategories
      const { data: subs } = await supabase.from('subcategories').select('*').order('name')
      if (subs) setAvailableSubcategories(subs)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        prep_time: initialData.prep_time || '',
        calories: initialData.calories || '',
        video_url: initialData.video_url || '',
        thumbnail_url: initialData.thumbnail_url || '',
        steps: initialData.steps || '',
        is_highlight: initialData.is_highlight || false,
      })
      if (initialData.ingredients && Array.isArray(initialData.ingredients)) {
        setIngredients(initialData.ingredients.length > 0 ? initialData.ingredients : [''])
      }
      
      // Fetch existing categories and subcategories for this recipe if editing
      if (recipeId) {
        const fetchRecipeRelations = async () => {
          // Fetch recipe categories
          const { data: catData } = await supabase
            .from('recipe_categories')
            .select('category_id')
            .eq('recipe_id', recipeId)
          
          if (catData) {
            setSelectedCategories(catData.map(rc => rc.category_id))
          }

          // Fetch recipe subcategories
          const { data: subData } = await supabase
            .from('recipe_subcategories')
            .select('subcategory_id')
            .eq('recipe_id', recipeId)
          
          if (subData) {
            setSelectedSubcategories(subData.map(rs => rs.subcategory_id))
          }
        }
        fetchRecipeRelations()
      }
    }
  }, [initialData, recipeId])

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

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleSubcategory = (subcategoryId: number) => {
    setSelectedSubcategories(prev => 
      prev.includes(subcategoryId) 
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')
    
    // Filter empty ingredients
    const validIngredients = ingredients.filter(i => i.trim() !== '')

    const dataToSave = {
      ...formData,
      ingredients: validIngredients
    }

    let error
    let savedRecipeId = recipeId

    if (recipeId) {
      // Update
      const { data, error: updateError } = await supabase
        .from('recipes')
        .update(dataToSave)
        .eq('id', recipeId)
        .select()
      
      error = updateError
      
      if (!error && (!data || data.length === 0)) {
           error = { message: 'Nenhuma alteração realizada. Verifique se você tem permissão ou se a receita existe.' }
      }
    } else {
      // Insert
      const { data, error: insertError } = await supabase
        .from('recipes')
        .insert([dataToSave])
        .select()
        
      if (data && data[0]) {
          savedRecipeId = data[0].id
      }
      error = insertError
    }

    // Save Categories and Subcategories if recipe saved successfully
    if (!error && savedRecipeId) {
      // Delete existing relations first (simple approach)
      if (recipeId) {
        await supabase.from('recipe_categories').delete().eq('recipe_id', savedRecipeId)
        await supabase.from('recipe_subcategories').delete().eq('recipe_id', savedRecipeId)
      }
      
      // Insert categories
      if (selectedCategories.length > 0) {
        const catsToInsert = selectedCategories.map(catId => ({
          recipe_id: savedRecipeId,
          category_id: catId
        }))
        const { error: catError } = await supabase.from('recipe_categories').insert(catsToInsert)
        if (catError) console.error('Error saving categories:', catError)
      }

      // Insert subcategories
      if (selectedSubcategories.length > 0) {
        const subsToInsert = selectedSubcategories.map(subId => ({
          recipe_id: savedRecipeId,
          subcategory_id: subId
        }))
        const { error: subError } = await supabase.from('recipe_subcategories').insert(subsToInsert)
        if (subError) console.error('Error saving subcategories:', subError)
      }
    }

    setLoading(false)

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      setSuccessMessage('Receita salva com sucesso!')
      if (!recipeId) {
        // Reset form only on create
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
        setSelectedCategories([])
        setSelectedSubcategories([])
      }
      if (onSuccess) onSuccess()
      router.refresh()
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="mb-6 text-xl font-bold text-gray-800 border-b pb-2">
        {recipeId ? 'Editar Receita' : 'Nova Receita'}
      </h2>
      
      {successMessage && (
        <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
          {successMessage}
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
            suppressHydrationWarning
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
            suppressHydrationWarning
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
              suppressHydrationWarning
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
              suppressHydrationWarning
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
            suppressHydrationWarning
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
            suppressHydrationWarning
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
                  suppressHydrationWarning
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
          <label className="block text-sm font-medium text-gray-700">Modo de Preparo (Markdown suportado)</label>
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
            suppressHydrationWarning
          />
          <label htmlFor="highlight" className="text-sm text-gray-700">Destaque na Home</label>
        </div>

        {/* Categories Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categorias</label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-cozinha-cta text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategories Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subcategorias</label>
          <div className="flex flex-wrap gap-2">
            {availableSubcategories.map(sub => (
              <button
                key={sub.id}
                type="button"
                onClick={() => toggleSubcategory(sub.id)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedSubcategories.includes(sub.id)
                    ? 'bg-cozinha-highlight text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
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
  )
}

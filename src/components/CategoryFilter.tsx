'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Category, Subcategory } from '@/types'

interface CategoryWithSubs extends Category {
  subcategories: Subcategory[]
}

export default function CategoryFilter() {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentCategoryId = searchParams.get('category')
  const currentSubcategoryId = searchParams.get('subcategory')

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()

      // Fetch categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (!cats) return

      // Fetch all category_subcategories links with subcategory data
      const { data: links } = await supabase
        .from('category_subcategories')
        .select('category_id, subcategory:subcategories(*)')

      if (!links) {
        setCategories(cats.map(c => ({ ...c, subcategories: [] })))
        return
      }

      // Group subcategories by category
      const catMap = new Map<number, Subcategory[]>()
      links.forEach((link: any) => {
        const catId = link.category_id
        const sub = link.subcategory as Subcategory
        if (!catMap.has(catId)) catMap.set(catId, [])
        catMap.get(catId)!.push(sub)
      })

      const enriched: CategoryWithSubs[] = cats.map(cat => ({
        ...cat,
        subcategories: (catMap.get(cat.id) || []).sort((a, b) => a.name.localeCompare(b.name))
      }))

      setCategories(enriched)
    }
    fetchCategories()
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams)
    if (currentCategoryId === categoryId) {
      params.delete('category')
      params.delete('subcategory')
    } else {
      params.set('category', categoryId)
      params.delete('subcategory') // Reset subcategory when switching category
    }
    router.replace(`?${params.toString()}`)
  }

  const handleSubcategoryClick = (subcategoryId: string) => {
    const params = new URLSearchParams(searchParams)
    if (currentSubcategoryId === subcategoryId) {
      params.delete('subcategory')
    } else {
      params.set('subcategory', subcategoryId)
    }
    router.replace(`?${params.toString()}`)
  }

  const selectedCategory = categories.find(c => String(c.id) === currentCategoryId)

  return (
    <div className="space-y-2">
      {/* Categories Row */}
      <div className="no-scrollbar flex w-full gap-2 overflow-x-auto py-2">
        {categories.map((cat) => {
          const isActive = currentCategoryId === String(cat.id)
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(String(cat.id))}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cozinha-cta text-white shadow-md'
                  : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Subcategories Row (shown when a category is selected) */}
      {selectedCategory && selectedCategory.subcategories.length > 0 && (
        <div className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-2 pl-1">
          {selectedCategory.subcategories.map((sub) => {
            const isActive = currentSubcategoryId === String(sub.id)
            return (
              <button
                key={sub.id}
                onClick={() => handleSubcategoryClick(String(sub.id))}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cozinha-highlight text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {sub.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

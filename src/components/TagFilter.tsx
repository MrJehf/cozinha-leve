'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Tag } from '@/types'

export default function TagFilter() {
  const [tags, setTags] = useState<Tag[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentTagId = searchParams.get('tag')

  useEffect(() => {
    const fetchTags = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('tags').select('*').order('name')
      if (data) setTags(data)
    }
    fetchTags()
  }, [])

  const handleTagClick = (tagId: string) => {
    const params = new URLSearchParams(searchParams)
    if (currentTagId === tagId) {
      params.delete('tag')
    } else {
      params.set('tag', tagId)
    }
    router.replace(`?${params.toString()}`)
  }

  return (
    <div className="no-scrollbar flex w-full gap-2 overflow-x-auto py-2">
      {tags.map((tag) => {
        const isActive = currentTagId === String(tag.id)
        return (
          <button
            key={tag.id}
            onClick={() => handleTagClick(String(tag.id))}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              isActive
                ? 'bg-cozinha-cta text-white shadow-md'
                : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'
            }`}
          >
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}

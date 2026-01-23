'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function SearchBar() {
  const searchParams = useSearchParams()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    replace(`?${params.toString()}`)
  }, 300)

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        <Search size={20} />
      </div>
      <input
        type="text"
        placeholder="Buscar receitas..."
        className="block w-full rounded-full border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 shadow-sm transition placeholder:text-gray-400 focus:border-cozinha-cta focus:outline-none focus:ring-1 focus:ring-cozinha-cta"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('q')?.toString()}
        suppressHydrationWarning
      />
    </div>
  )
}

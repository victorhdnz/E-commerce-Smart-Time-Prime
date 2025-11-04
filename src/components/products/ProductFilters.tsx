'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FilterState {
  categories: string[]
  priceRange: [number, number]
  sortBy: string
  search: string
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void
  categories: string[]
}

export const ProductFilters = ({ onFilterChange, categories }: ProductFiltersProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 2000],
    sortBy: 'all',
    search: '',
  })

  const sortOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'featured', label: 'Em Destaque' },
    { value: 'price_asc', label: 'Menor Preço' },
    { value: 'price_desc', label: 'Maior Preço' },
    { value: 'name_asc', label: 'Nome A-Z' },
    { value: 'name_desc', label: 'Nome Z-A' },
    { value: 'newest', label: 'Mais Recentes' },
    { value: 'favorites', label: 'Favoritos' },
  ]

  const priceRanges = [
    { min: 0, max: 200, label: 'Até R$ 200' },
    { min: 200, max: 500, label: 'R$ 200 - R$ 500' },
    { min: 500, max: 1000, label: 'R$ 500 - R$ 1000' },
    { min: 1000, max: 2000, label: 'Acima de R$ 1000' },
  ]

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    
    const newFilters = { ...filters, categories: newCategories }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handlePriceRange = (min: number, max: number) => {
    const newFilters = { ...filters, priceRange: [min, max] as [number, number] }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSearch = (search: string) => {
    const newFilters = { ...filters, search }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const newFilters = {
      categories: [],
      priceRange: [0, 2000] as [number, number],
      sortBy: 'all',
      search: '',
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const activeFiltersCount = 
    filters.categories.length + 
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 2000 ? 1 : 0)

  return (
    <div className="mb-8">
      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
          />
        </div>

        {/* Ordenação */}
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors bg-white cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Botão Filtros */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-black hover:bg-black hover:text-white transition-colors font-medium"
        >
          <SlidersHorizontal size={20} />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-accent text-black px-2 py-0.5 rounded-full text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Painel de Filtros */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              {/* Categorias */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center justify-between">
                  Categorias
                  {filters.categories.length > 0 && (
                    <button
                      onClick={() => {
                        const newFilters = { ...filters, categories: [] }
                        setFilters(newFilters)
                        onFilterChange(newFilters)
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Limpar
                    </button>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        filters.categories.includes(category)
                          ? 'bg-black text-white'
                          : 'bg-white border-2 border-gray-300 hover:border-black'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Faixa de Preço */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Faixa de Preço</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handlePriceRange(range.min, range.max)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        filters.priceRange[0] === range.min &&
                        filters.priceRange[1] === range.max
                          ? 'bg-black text-white'
                          : 'bg-white border-2 border-gray-300 hover:border-black'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="flex-1"
                >
                  Limpar Tudo
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros Ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.categories.map((category) => (
            <div
              key={category}
              className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-sm"
            >
              {category}
              <button
                onClick={() => handleCategoryToggle(category)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 2000) && (
            <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-sm">
              R$ {filters.priceRange[0]} - R$ {filters.priceRange[1]}
              <button
                onClick={() => handlePriceRange(0, 2000)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


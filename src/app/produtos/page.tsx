'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductFilters } from '@/components/products/ProductFilters'
import { FadeInSection } from '@/components/ui/FadeInSection'
import { PageLoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { Product } from '@/types'
import { motion } from 'framer-motion'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        colors:product_colors(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (data) {
      setProducts(data as any)
      setFilteredProducts(data as any)
      
      // Extrair categorias únicas
      const uniqueCategories = Array.from(
        new Set(data.map((p: any) => p.category).filter(Boolean))
      ) as string[]
      setCategories(uniqueCategories)
    }
    setLoading(false)
  }

  const handleFilterChange = (filters: any) => {
    let filtered = [...products]

    // Filtro por busca
    if (filters.search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Filtro por categoria
    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) =>
        filters.categories.includes(p.category)
      )
    }

    // Filtro por preço
    filtered = filtered.filter(
      (p) =>
        p.local_price >= filters.priceRange[0] &&
        p.local_price <= filters.priceRange[1]
    )

    // Ordenação
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.local_price - b.local_price)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.local_price - a.local_price)
        break
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'newest':
        filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'featured':
        filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
        break
    }

    setFilteredProducts(filtered)
  }

  if (loading) {
    return <PageLoadingSkeleton />
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Nossa Coleção
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore nossa seleção exclusiva de relógios premium
        </p>
        <div className="w-24 h-1 bg-black mx-auto mt-6" />
      </div>

      {/* Filters */}
      <ProductFilters 
        onFilterChange={handleFilterChange}
        categories={categories}
      />

      {/* Products Grid */}
      {filteredProducts && filteredProducts.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      ) : products.length > 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou buscar por outro termo.
          </p>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600">
            Estamos atualizando nosso catálogo. Volte em breve!
          </p>
        </div>
      )}
    </div>
  )
}


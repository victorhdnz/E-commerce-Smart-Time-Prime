'use client'

import { useState, useEffect } from 'react'
import { FadeInSection } from '@/components/ui/FadeInSection'
import { PageLoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductFilters } from '@/components/products/ProductFilters'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { useAuth } from '@/hooks/useAuth'

interface FilterState {
  categories: string[]
  priceRange: [number, number]
  sortBy: string
  search: string
}

export default function ProductsPage() {
  console.log('🎯 ProductsPage renderizado!')
  
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  const loadProducts = async () => {
    console.log('🚀 loadProducts executado!')
    try {
      setLoading(true)
      console.log('📡 Fazendo requisição para API...')
      
      // Usar cache: 'no-store' para garantir produtos atualizados
      // Adicionar timestamp para evitar cache do navegador
      const response = await fetch(`/api/products?t=${Date.now()}`, {
        cache: 'no-store',
      })
      const result = await response.json()
      
      console.log('📊 Resultado da API:', { 
        success: result.success, 
        count: result.count 
      })

      if (!result.success) {
        console.error('❌ Erro na API:', result.error)
        return
      }

      const productsData = result.products || []
      console.log('✅ Produtos carregados:', productsData.length)
      console.log('📦 Primeiros 3 produtos:', productsData.slice(0, 3).map((p: any) => ({ id: p.id, name: p.name })))
      
      setProducts(productsData)
      setFilteredProducts(productsData)

      // Extrair categorias únicas
      const uniqueCategories = [...new Set(productsData.map((p: any) => p.category).filter(Boolean))] as string[]
      console.log('🏷️ Categorias encontradas:', uniqueCategories)
      setCategories(uniqueCategories)

      // Carregar favoritos do usuário se autenticado
      if (isAuthenticated) {
        try {
          const supabase = createClient()
          const user = await supabase.auth.getUser()
          if (user.data.user) {
            const { data: favorites } = await supabase
              .from('favorites')
              .select('product_id')
              .eq('user_id', user.data.user.id)

            if (favorites) {
              setFavoriteIds(favorites.map((f: any) => f.product_id))
            }
          }
        } catch (error) {
          console.error('Erro ao carregar favoritos:', error)
        }
      }

    } catch (error) {
      console.error('❌ Erro na requisição:', error)
      console.error('❌ Stack trace:', error)
    } finally {
      console.log('🏁 Finalizando loading...')
      setLoading(false)
    }
  }

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...products]

    // Filtrar por categoria
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.category || '')
      )
    }

    // Filtrar por faixa de preço
    filtered = filtered.filter(product => 
      product.local_price >= filters.priceRange[0] && 
      product.local_price <= filters.priceRange[1]
    )

    // Filtrar por busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.short_description?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)
      )
    }

    // Ordenar
    switch (filters.sortBy) {
      case 'all':
        // Mostrar todos os produtos sem ordenação especial (ordem padrão do banco)
        break
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
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'favorites':
        if (!isAuthenticated || favoriteIds.length === 0) {
          filtered = []
          break
        }
        filtered = filtered.filter((p) => favoriteIds.includes(p.id))
        break
      case 'featured':
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1
          if (!a.is_featured && b.is_featured) return 1
          return 0
        })
        break
      default:
        // Sem ordenação especial
        break
    }

    setFilteredProducts(filtered)
  }

  useEffect(() => {
    console.log('🚀 useEffect executado!')
    loadProducts()
  }, [isAuthenticated])

  // Recarregar produtos quando a página receber foco (útil após criar produto)
  useEffect(() => {
    const handleFocus = () => {
      console.log('📱 Página recebeu foco, recarregando produtos...')
      loadProducts()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <PageLoadingSkeleton />
  }

  return (
    <FadeInSection>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nossos Produtos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubra nossa coleção exclusiva de relógios premium
          </p>
        </div>

        <ProductFilters 
          onFilterChange={handleFilterChange}
          categories={categories}
        />

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Nenhum produto encontrado.</p>
            <p className="text-gray-500 mt-2">Tente ajustar os filtros ou buscar por outros termos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </FadeInSection>
  )
}
'use client'

import { createClient } from '@/lib/supabase/client'
import { ProductCatalog, Product } from '@/types'
import { notFound, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronRight, ShoppingBag, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function CatalogPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [catalog, setCatalog] = useState<ProductCatalog | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar catálogo
        const { data: catalogData, error: catalogError } = await supabase
          .from('product_catalogs')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single()

        if (catalogError || !catalogData) {
          setCatalog(null)
          setLoading(false)
          return
        }

        setCatalog(catalogData as ProductCatalog)

        // Carregar todos os produtos para mapear
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)

        setProducts(productsData || [])
      } catch (error) {
        console.error('Erro ao carregar catálogo:', error)
        setCatalog(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!catalog) {
    return notFound()
  }

  const content = catalog.content as any
  const colors = catalog.theme_colors as any || {}
  
  // Obter produtos por IDs
  const getProductById = (id: string) => products.find(p => p.id === id)
  const featuredProducts = (content.featured_products || [])
    .map((id: string) => getProductById(id))
    .filter(Boolean) as Product[]

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background || '#ffffff' }}>
      {/* Hero Section */}
      {content.hero && (content.hero.title || content.hero.image) && (
        <section className="py-16 px-4" style={{ backgroundColor: colors.background || '#ffffff' }}>
          <div className="max-w-6xl mx-auto text-center">
            {content.hero.badge && (
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
                style={{ backgroundColor: colors.accent || '#D4AF37', color: '#ffffff' }}
              >
                {content.hero.badge}
              </span>
            )}
            
            {content.hero.title && (
              <h1 
                className="text-5xl md:text-7xl font-bold mb-4"
                style={{ color: colors.text || '#000000' }}
              >
                {content.hero.title}
              </h1>
            )}
            
            {content.hero.subtitle && (
              <p 
                className="text-xl md:text-2xl mb-8"
                style={{ color: colors.text ? `${colors.text}99` : '#666666' }}
              >
                {content.hero.subtitle}
              </p>
            )}

            {content.hero.image && (
              <div className="mt-8">
                <Image
                  src={content.hero.image}
                  alt={content.hero.title || 'Hero'}
                  width={800}
                  height={500}
                  className="mx-auto object-contain"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Produtos em Destaque */}
      {featuredProducts.length > 0 && (
        <section className="py-16 px-4" style={{ backgroundColor: colors.secondary || '#f9fafb' }}>
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-12"
              style={{ color: colors.text || '#000000' }}
            >
              Destaques
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map(product => (
                <Link
                  key={product.id}
                  href={`/produto/${product.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag size={48} className="text-gray-300" />
                      </div>
                    )}
                    {product.is_featured && (
                      <span 
                        className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: colors.accent || '#D4AF37' }}
                      >
                        Destaque
                      </span>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 
                      className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors"
                      style={{ color: colors.text || '#000000' }}
                    >
                      {product.name}
                    </h3>
                    
                    {product.short_description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.short_description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xl font-bold"
                        style={{ color: colors.primary || '#000000' }}
                      >
                        {formatPrice(product.local_price)}
                      </span>
                      <span 
                        className="text-sm flex items-center gap-1"
                        style={{ color: colors.accent || '#D4AF37' }}
                      >
                        Ver produto <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categorias */}
      {content.categories && content.categories.length > 0 && (
        <section className="py-16 px-4" style={{ backgroundColor: colors.background || '#ffffff' }}>
          <div className="max-w-6xl mx-auto">
            {content.categories.map((category: any, categoryIndex: number) => {
              const categoryProducts = (category.products || [])
                .map((id: string) => getProductById(id))
                .filter(Boolean) as Product[]

              if (categoryProducts.length === 0) return null

              return (
                <div key={category.id || categoryIndex} className="mb-16 last:mb-0">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 
                        className="text-2xl md:text-3xl font-bold"
                        style={{ color: colors.text || '#000000' }}
                      >
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-gray-600 mt-2">{category.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryProducts.map(product => (
                      <Link
                        key={product.id}
                        href={`/produto/${product.slug}`}
                        className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                      >
                        <div className="aspect-square bg-gray-50 relative overflow-hidden">
                          {product.images && product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ShoppingBag size={32} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(product.local_price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section 
        className="py-20 px-4"
        style={{ backgroundColor: colors.primary || '#000000' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Encontre o produto ideal
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Veja nossa coleção completa e encontre o que você precisa
          </p>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
            style={{ 
              backgroundColor: colors.accent || '#D4AF37',
              color: '#ffffff'
            }}
          >
            Ver todos os produtos
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}


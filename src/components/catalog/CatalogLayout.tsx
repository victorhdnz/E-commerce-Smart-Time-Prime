'use client'

import { ProductCatalog, Product } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Play, Star, ShoppingBag, Check } from 'lucide-react'
import { useState } from 'react'

interface CatalogLayoutProps {
  catalog: ProductCatalog
  products: Product[]
}

export function CatalogLayout({ catalog, products }: CatalogLayoutProps) {
  const content = catalog.content as any
  const colors = catalog.theme_colors as any || {}
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  const getProductById = (id: string) => products.find(p => p.id === id)
  const featuredProducts = (content.featured_products || [])
    .map((id: string) => getProductById(id))
    .filter(Boolean) as Product[]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getVideoId = (url: string) => {
    if (!url) return null
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(youtubeRegex)
    return match ? match[1] : null
  }

  // Verificar se há conteúdo para exibir
  const hasContent = content.hero?.title || content.hero?.image || 
                     content.video?.url || 
                     (content.features && content.features.length > 0) ||
                     (content.gallery && content.gallery.length > 0) ||
                     content.product_showcase ||
                     (featuredProducts && featuredProducts.length > 0)

  // Se não houver conteúdo, mostrar mensagem
  if (!hasContent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background || '#ffffff' }}>
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold mb-4" style={{ color: colors.text || '#000000' }}>
            {catalog.title || 'Catálogo'}
          </h1>
          <p className="text-lg mb-8" style={{ color: colors.text ? `${colors.text}99` : '#666666' }}>
            Este catálogo ainda não possui conteúdo. Edite-o no dashboard para adicionar informações.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background || '#ffffff' }}>
      {/* Hero Section */}
      {content.hero && (content.hero.title || content.hero.image) && (
        <section 
          className="relative py-20 md:py-32 px-4 overflow-hidden"
          style={{ backgroundColor: colors.primary || '#000000' }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                {content.hero.badge && (
                  <span 
                    className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
                    style={{ backgroundColor: colors.accent || '#D4AF37', color: '#000000' }}
                  >
                    {content.hero.badge}
                  </span>
                )}
                
                {content.hero.title && (
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                    {content.hero.title}
                  </h1>
                )}
                
                {content.hero.subtitle && (
                  <p className="text-xl md:text-2xl mb-8 opacity-90">
                    {content.hero.subtitle}
                  </p>
                )}

                {content.hero.cta_text && content.hero.cta_link && (
                  <Link
                    href={content.hero.cta_link}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: colors.accent || '#D4AF37',
                      color: '#000000'
                    }}
                  >
                    {content.hero.cta_text}
                    <ChevronRight size={20} />
                  </Link>
                )}
              </div>

              {content.hero.image && (
                <div className="relative">
                  <div className="relative aspect-square max-w-lg mx-auto">
                    <Image
                      src={content.hero.image}
                      alt={content.hero.title || 'Hero'}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Video Section */}
      {content.video && content.video.url && (
        <section className="py-20 px-4" style={{ backgroundColor: colors.secondary || '#f9fafb' }}>
          <div className="max-w-6xl mx-auto">
            {content.video.title && (
              <h2 
                className="text-3xl md:text-4xl font-bold text-center mb-4"
                style={{ color: colors.text || '#000000' }}
              >
                {content.video.title}
              </h2>
            )}
            {content.video.description && (
              <p 
                className="text-lg text-center mb-12 max-w-2xl mx-auto"
                style={{ color: colors.text ? `${colors.text}99` : '#666666' }}
              >
                {content.video.description}
              </p>
            )}
            
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
              {playingVideo === content.video.url ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getVideoId(content.video.url)}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full">
                  {content.video.thumbnail && (
                    <Image
                      src={content.video.thumbnail}
                      alt={content.video.title || 'Video'}
                      fill
                      className="object-cover"
                    />
                  )}
                  <button
                    onClick={() => setPlayingVideo(content.video.url)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                  >
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.accent || '#D4AF37' }}
                    >
                      <Play size={32} className="text-black ml-1" fill="currentColor" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {content.features && content.features.length > 0 && (
        <section className="py-20 px-4" style={{ backgroundColor: colors.background || '#ffffff' }}>
          <div className="max-w-7xl mx-auto">
            {content.features_title && (
              <h2 
                className="text-3xl md:text-4xl font-bold text-center mb-4"
                style={{ color: colors.text || '#000000' }}
              >
                {content.features_title}
              </h2>
            )}
            {content.features_subtitle && (
              <p 
                className="text-lg text-center mb-16 max-w-2xl mx-auto"
                style={{ color: colors.text ? `${colors.text}99` : '#666666' }}
              >
                {content.features_subtitle}
              </p>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.features.map((feature: any, index: number) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all"
                  style={{ backgroundColor: colors.secondary || '#ffffff' }}
                >
                  {feature.icon && (
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                      style={{ backgroundColor: colors.accent || '#D4AF37' }}
                    >
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                  )}
                  {feature.title && (
                    <h3 
                      className="text-xl font-bold mb-3"
                      style={{ color: colors.text || '#000000' }}
                    >
                      {feature.title}
                    </h3>
                  )}
                  {feature.description && (
                    <p 
                      className="text-gray-600"
                      style={{ color: colors.text ? `${colors.text}99` : '#666666' }}
                    >
                      {feature.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Image Gallery Section */}
      {content.gallery && content.gallery.length > 0 && (
        <section className="py-20 px-4" style={{ backgroundColor: colors.secondary || '#f9fafb' }}>
          <div className="max-w-7xl mx-auto">
            {content.gallery_title && (
              <h2 
                className="text-3xl md:text-4xl font-bold text-center mb-16"
                style={{ color: colors.text || '#000000' }}
              >
                {content.gallery_title}
              </h2>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.gallery.map((image: string, index: number) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <Image
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Showcase Section */}
      {content.product_showcase && (
        <section className="py-20 px-4" style={{ backgroundColor: colors.background || '#ffffff' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {content.product_showcase.image && (
                <div className="relative aspect-square">
                  <Image
                    src={content.product_showcase.image}
                    alt={content.product_showcase.title || 'Product'}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              <div>
                {content.product_showcase.title && (
                  <h2 
                    className="text-4xl md:text-5xl font-bold mb-6"
                    style={{ color: colors.text || '#000000' }}
                  >
                    {content.product_showcase.title}
                  </h2>
                )}
                {content.product_showcase.description && (
                  <p 
                    className="text-lg mb-8"
                    style={{ color: colors.text ? `${colors.text}99` : '#666666' }}
                  >
                    {content.product_showcase.description}
                  </p>
                )}

                {content.product_showcase.features && content.product_showcase.features.length > 0 && (
                  <ul className="space-y-4 mb-8">
                    {content.product_showcase.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check 
                          size={24} 
                          className="flex-shrink-0 mt-0.5"
                          style={{ color: colors.accent || '#D4AF37' }}
                        />
                        <span style={{ color: colors.text || '#000000' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {content.product_showcase.cta_text && content.product_showcase.cta_link && (
                  <Link
                    href={content.product_showcase.cta_link}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: colors.accent || '#D4AF37',
                      color: '#000000'
                    }}
                  >
                    {content.product_showcase.cta_text}
                    <ChevronRight size={20} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-4" style={{ backgroundColor: colors.secondary || '#f9fafb' }}>
          <div className="max-w-7xl mx-auto">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-4"
              style={{ color: colors.text || '#000000' }}
            >
              Produtos em Destaque
            </h2>
            {content.featured_subtitle && (
              <p 
                className="text-lg text-center mb-12 max-w-2xl mx-auto"
                style={{ color: colors.text ? `${colors.text}99` : '#666666' }}
              >
                {content.featured_subtitle}
              </p>
            )}
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map(product => (
                <Link
                  key={product.id}
                  href={product.ecommerce_url || `/produto/${product.slug}`}
                  target={product.ecommerce_url ? '_blank' : '_self'}
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
                  </div>
                  
                  <div className="p-6">
                    <h3 
                      className="font-semibold text-xl mb-2 group-hover:opacity-80 transition-opacity"
                      style={{ color: colors.text || '#000000' }}
                    >
                      {product.name}
                    </h3>
                    
                    {product.short_description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {product.short_description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-2xl font-bold"
                        style={{ color: colors.primary || '#000000' }}
                      >
                        {formatPrice(product.local_price || 0)}
                      </span>
                      <span 
                        className="text-sm flex items-center gap-1 font-medium"
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

      {/* CTA Final */}
      <section 
        className="py-20 px-4"
        style={{ backgroundColor: colors.primary || '#000000' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {content.cta_title && (
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {content.cta_title}
            </h2>
          )}
          {content.cta_description && (
            <p className="text-lg text-white/80 mb-8">
              {content.cta_description}
            </p>
          )}
          {content.cta_link && content.cta_text && (
            <Link
              href={content.cta_link}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
              style={{ 
                backgroundColor: colors.accent || '#D4AF37',
                color: '#000000'
              }}
            >
              {content.cta_text}
              <ChevronRight size={20} />
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}


'use client'

import { createClient } from '@/lib/supabase/client'
import { ProductSupportPage } from '@/types'
import { notFound, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Search, Book, Play, List, HelpCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface SupportSection {
  id: string
  type: 'hero' | 'text' | 'image' | 'video' | 'list' | 'accordion' | 'feature-card' | 'steps'
  title?: string
  subtitle?: string
  content?: string
  image?: string
  video?: string
  link?: string
  linkText?: string
  items?: Array<{ 
    title: string
    description: string
    image?: string
    link?: string
  }>
}

export default function SupportPage() {
  const params = useParams()
  const slug = params['modelo-slug'] as string
  
  const [supportPage, setSupportPage] = useState<(ProductSupportPage & { product: any }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const loadPage = async () => {
      try {
        const { data, error } = await supabase
          .from('product_support_pages')
          .select(`
            *,
            product:products(*)
          `)
          .eq('model_slug', slug)
          .eq('is_active', true)
          .single()

        if (error || !data) {
          setSupportPage(null)
        } else {
          setSupportPage(data as any)
        }
      } catch (error) {
        console.error('Erro ao buscar página de suporte:', error)
        setSupportPage(null)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [slug, supabase])

  const toggleAccordion = (id: string) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!supportPage) {
    return notFound()
  }

  const content = supportPage.content as any
  const sections: SupportSection[] = content?.sections || []

  // Renderizar seção baseada no tipo
  const renderSection = (section: SupportSection, index: number) => {
    switch (section.type) {
      case 'hero':
        return (
          <section key={index} className="bg-gradient-to-b from-gray-50 to-white py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {section.title || supportPage.title}
                  </h1>
                  <p className="text-xl text-gray-600 mb-6">
                    {section.subtitle || `Tudo o que você precisa saber sobre o ${supportPage.product?.name || 'produto'}.`}
                  </p>
                  
                  {/* Barra de busca */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar neste manual"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Índice rápido */}
                  {sections.length > 2 && (
                    <div className="mt-6">
                      <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                        Índice <ChevronDown size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {section.image && (
                  <div className="relative">
                    <Image
                      src={section.image}
                      alt={section.title || 'Hero'}
                      width={500}
                      height={400}
                      className="rounded-2xl object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )

      case 'feature-card':
        return (
          <section key={index} className="py-16 px-4 border-t border-gray-100">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {index % 2 === 0 ? (
                  <>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
                      <p className="text-lg text-gray-600 mb-6 whitespace-pre-line">{section.content}</p>
                      {section.link && (
                        <Link 
                          href={section.link}
                          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                        >
                          {section.linkText || 'Saiba mais'} <ChevronRight size={16} />
                        </Link>
                      )}
                    </div>
                    {section.image && (
                      <div className="flex justify-center">
                        <Image
                          src={section.image}
                          alt={section.title || ''}
                          width={350}
                          height={350}
                          className="rounded-2xl object-contain"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {section.image && (
                      <div className="flex justify-center md:order-1">
                        <Image
                          src={section.image}
                          alt={section.title || ''}
                          width={350}
                          height={350}
                          className="rounded-2xl object-contain"
                        />
                      </div>
                    )}
                    <div className="md:order-2">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
                      <p className="text-lg text-gray-600 mb-6 whitespace-pre-line">{section.content}</p>
                      {section.link && (
                        <Link 
                          href={section.link}
                          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                        >
                          {section.linkText || 'Saiba mais'} <ChevronRight size={16} />
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )

      case 'steps':
        return (
          <section key={index} className="py-16 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              {section.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">{section.title}</h2>
              )}
              {section.subtitle && (
                <p className="text-gray-600 text-center mb-12">{section.subtitle}</p>
              )}
              
              <div className="space-y-8">
                {section.items?.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
                      {item.image && (
                        <div className="w-full md:w-48 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={200}
                            height={200}
                            className="rounded-xl object-contain w-full"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 whitespace-pre-line">{item.description}</p>
                        {item.link && (
                          <Link 
                            href={item.link}
                            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 mt-3"
                          >
                            Ver mais <ChevronRight size={16} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case 'text':
        return (
          <section key={index} className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              {section.title && (
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              )}
              <div 
                className="prose prose-lg max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: section.content || '' }}
              />
            </div>
          </section>
        )

      case 'image':
        return (
          <section key={index} className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              {section.title && (
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              )}
              {section.image && (
                <div className="rounded-2xl overflow-hidden">
                  <Image
                    src={section.image}
                    alt={section.title || 'Imagem'}
                    width={800}
                    height={500}
                    className="w-full object-contain"
                  />
                </div>
              )}
              {section.content && (
                <p className="text-gray-600 mt-4 text-center">{section.content}</p>
              )}
            </div>
          </section>
        )

      case 'video':
        return (
          <section key={index} className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              {section.title && (
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              )}
              {section.video && (
                <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
                  <iframe
                    src={section.video}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </section>
        )

      case 'list':
        return (
          <section key={index} className="py-12 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              {section.title && (
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
              )}
              <div className="space-y-4">
                {section.items?.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex gap-4 bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {itemIndex + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case 'accordion':
        return (
          <section key={index} className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              {section.title && (
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
              )}
              <div className="space-y-3">
                {section.items?.map((item, itemIndex) => {
                  const accordionId = `${index}-${itemIndex}`
                  const isExpanded = expandedAccordions[accordionId]
                  
                  return (
                    <div key={itemIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleAccordion(accordionId)}
                        className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 text-left">{item.title}</span>
                        <ChevronDown 
                          size={20} 
                          className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="p-4 pt-0 bg-white">
                          <p className="text-gray-600 whitespace-pre-line">{item.description}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )

      default:
        return null
    }
  }

  // Gerar índice de navegação a partir das seções
  const tableOfContents = sections
    .filter(s => s.title && (s.type === 'feature-card' || s.type === 'steps' || s.type === 'text'))
    .map((section, index) => ({
      id: section.id || `section-${index}`,
      title: section.title || '',
      type: section.type,
    }))

  return (
    <div className="min-h-screen bg-white">
      {/* Header fixo estilo Apple */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book size={20} className="text-gray-600" />
            <span className="font-medium text-gray-900">{supportPage.title}</span>
          </div>
          <Link 
            href="/comparar"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Voltar ao comparador
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar de Navegação - Estilo Apple Guide */}
          {sections.length > 0 && tableOfContents.length > 0 && (
            <aside className="hidden lg:block sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto py-8">
              <div className="border-r border-gray-200 pr-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                  Neste manual
                </h2>
                <nav className="space-y-1">
                  {tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        setActiveSection(item.id)
                        const element = document.getElementById(item.id)
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }}
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Conteúdo Principal */}
          <main className="min-w-0">
            {/* Se não houver seções ou só texto básico, mostrar layout padrão */}
            {sections.length === 0 ? (
              <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{supportPage.title}</h1>
                {supportPage.product && (
                  <p className="text-lg text-gray-600 mb-8">{supportPage.product.name}</p>
                )}
                <div className="text-center py-16 text-gray-500">
                  <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Conteúdo em desenvolvimento...</p>
                </div>
              </div>
            ) : (
              // Renderizar seções
              <div>
                {sections.map((section, index) => {
                  const sectionId = section.id || `section-${index}`
                  return (
                    <div key={sectionId} id={sectionId}>
                      {renderSection(section, index)}
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Links relacionados no final */}
      {sections.length > 0 && (
        <section className="py-12 px-4 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quer saber mais?</h3>
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/produtos" 
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Ver produtos <ChevronRight size={16} />
              </Link>
              <Link 
                href="/contato" 
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Fale conosco <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

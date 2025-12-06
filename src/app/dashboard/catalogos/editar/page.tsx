'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ProductCatalog, Product } from '@/types'
import { Save, ArrowLeft, Home, Eye, Package, Palette, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/Input'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { VideoUploader } from '@/components/ui/VideoUploader'
import { ArrayImageManager } from '@/components/ui/ArrayImageManager'

interface CatalogSettings {
  title: string
  description: string
  cover_image: string
  hero: {
    title: string
    subtitle: string
    badge: string
    image: string
    cta_text?: string
    cta_link?: string
  }
  video?: {
    url: string
    thumbnail?: string
    title?: string
    description?: string
  }
  features?: Array<{
    icon?: string
    title: string
    description: string
  }>
  features_title?: string
  features_subtitle?: string
  gallery?: string[]
  gallery_title?: string
  product_showcase?: {
    title: string
    description: string
    image: string
    features?: string[]
    cta_text?: string
    cta_link?: string
  }
  featured_subtitle?: string
  cta_title?: string
  cta_description?: string
  cta_text?: string
  cta_link?: string
  theme_colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  featured_products: string[]
  categories: Array<{
    id: string
    name: string
    description: string
    image: string
    products: string[]
  }>
}

function EditCatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const supabase = createClient()

  const versionId = searchParams.get('version')
  const [catalog, setCatalog] = useState<ProductCatalog | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('hero')

  const [settings, setSettings] = useState<CatalogSettings>({
    title: '',
    description: '',
    cover_image: '',
    hero: {
      title: '',
      subtitle: '',
      badge: '',
      image: '',
    },
    theme_colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#D4AF37',
      background: '#ffffff',
      text: '#000000',
    },
    featured_products: [],
    categories: [],
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !isEditor) {
      router.push('/dashboard')
      return
    }

    if (!versionId) {
      toast.error('Versão não especificada')
      router.push('/dashboard/catalogos')
      return
    }

    loadCatalog()
    loadProducts()
  }, [versionId, isAuthenticated, isEditor, authLoading, router])

  const loadCatalog = async () => {
    try {
      const { data, error } = await supabase
        .from('product_catalogs')
        .select('*')
        .eq('id', versionId)
        .single()

      if (error) throw error
      if (!data) {
        toast.error('Catálogo não encontrado')
        router.push('/dashboard/catalogos')
        return
      }

      setCatalog(data as ProductCatalog)
      const content = (data.content as any) || {}
      
      // Se não houver conteúdo, criar estrutura pré-definida
      const hasContent = content.hero?.title || content.features?.length > 0 || content.gallery?.length > 0
      
      setSettings({
        title: data.title || '',
        description: data.description || '',
        cover_image: data.cover_image || '',
        hero: content.hero || (hasContent ? { title: '', subtitle: '', badge: '', image: '', cta_text: '', cta_link: '' } : {
          title: data.title || 'Smart Watch',
          subtitle: 'O mais poderoso de todos os tempos.',
          badge: 'Novo',
          image: '',
          cta_text: 'Comprar Agora',
          cta_link: '/comparar',
        }),
        video: content.video || undefined,
        features: content.features || (hasContent ? [] : [
          { icon: '💡', title: 'Design Moderno', description: 'Estilo contemporâneo que combina com qualquer ocasião.' },
          { icon: '⚡', title: 'Alta Performance', description: 'Processador rápido e eficiente para todas as suas necessidades.' },
          { icon: '🔋', title: 'Bateria Duradoura', description: 'Bateria que dura o dia todo com uma única carga.' },
        ]),
        features_title: content.features_title || (hasContent ? '' : 'Recursos Principais'),
        features_subtitle: content.features_subtitle || (hasContent ? '' : 'Descubra o que torna este produto especial'),
        gallery: content.gallery || [],
        gallery_title: content.gallery_title || (hasContent ? '' : 'Galeria de Imagens'),
        product_showcase: content.product_showcase || undefined,
        featured_subtitle: content.featured_subtitle || (hasContent ? '' : 'Produtos em Destaque'),
        cta_title: content.cta_title || (hasContent ? '' : 'Pronto para começar?'),
        cta_description: content.cta_description || (hasContent ? '' : 'Explore nossa coleção completa de produtos.'),
        cta_text: content.cta_text || (hasContent ? '' : 'Ver todos os produtos'),
        cta_link: content.cta_link || (hasContent ? '' : '/comparar'),
        theme_colors: (data.theme_colors as any) || {
          primary: '#000000',
          secondary: '#ffffff',
          accent: '#D4AF37',
          background: '#ffffff',
          text: '#000000',
        },
        featured_products: content.featured_products || [],
        categories: content.categories || [],
      })
    } catch (error: any) {
      console.error('Erro ao carregar catálogo:', error)
      toast.error('Erro ao carregar catálogo')
      router.push('/dashboard/catalogos')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const content = {
        hero: settings.hero,
        video: settings.video,
        features: settings.features,
        features_title: settings.features_title,
        features_subtitle: settings.features_subtitle,
        gallery: settings.gallery,
        gallery_title: settings.gallery_title,
        product_showcase: settings.product_showcase,
        featured_products: settings.featured_products,
        featured_subtitle: settings.featured_subtitle,
        cta_title: settings.cta_title,
        cta_description: settings.cta_description,
        cta_text: settings.cta_text,
        cta_link: settings.cta_link,
        categories: settings.categories,
        sections: [],
      }

      const { error } = await supabase
        .from('product_catalogs')
        .update({
          title: settings.title,
          description: settings.description,
          cover_image: settings.cover_image,
          theme_colors: settings.theme_colors,
          content: content,
        })
        .eq('id', versionId)

      if (error) throw error
      toast.success('Catálogo salvo com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar catálogo:', error)
      toast.error('Erro ao salvar catálogo')
    } finally {
      setSaving(false)
    }
  }

  const toggleFeaturedProduct = (productId: string) => {
    const featured = settings.featured_products || []
    if (featured.includes(productId)) {
      setSettings({
        ...settings,
        featured_products: featured.filter(id => id !== productId)
      })
    } else {
      setSettings({
        ...settings,
        featured_products: [...featured, productId]
      })
    }
  }

  const addCategory = () => {
    setSettings({
      ...settings,
      categories: [
        ...settings.categories,
        { id: Date.now().toString(), name: '', description: '', image: '', products: [] }
      ]
    })
  }

  const updateCategory = (index: number, updates: any) => {
    const categories = [...settings.categories]
    categories[index] = { ...categories[index], ...updates }
    setSettings({ ...settings, categories })
  }

  const removeCategory = (index: number) => {
    const categories = settings.categories.filter((_, i) => i !== index)
    setSettings({ ...settings, categories })
  }

  const toggleProductInCategory = (categoryIndex: number, productId: string) => {
    const categories = [...settings.categories]
    const products = categories[categoryIndex].products || []
    
    if (products.includes(productId)) {
      categories[categoryIndex].products = products.filter((id: string) => id !== productId)
    } else {
      categories[categoryIndex].products = [...products, productId]
    }
    
    setSettings({ ...settings, categories })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!catalog) {
    return null
  }

  const SectionWrapper = ({ section, icon, title, children }: any) => {
    const isExpanded = expandedSection === section
    return (
      <motion.div className="border rounded-xl overflow-hidden mb-4">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : section)}
          className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
        >
          <span className="font-semibold flex items-center gap-2">
            {icon}
            {title}
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4"
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/catalogos"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Editar: {catalog.title}</h1>
                <p className="text-sm text-gray-500">Catálogo de Produtos /catalogo/{catalog.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Home size={18} />
                Dashboard
              </Link>
              <Link
                href={`/catalogo/${catalog.slug}`}
                target="_blank"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye size={18} />
                Ver Prévia
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Editor Principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold mb-6">Conteúdo do Catálogo</h2>

              {/* Informações Básicas */}
              <SectionWrapper section="basic" icon={<Package size={18} />} title="Informações Básicas">
                <div className="space-y-4">
                  <Input
                    label="Título do Catálogo"
                    value={settings.title}
                    onChange={(e) => {
                      const newValue = e.target.value
                      setSettings(prev => ({ ...prev, title: newValue }))
                    }}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <textarea
                      value={settings.description}
                      onChange={(e) => {
                        const newValue = e.target.value
                        setSettings(prev => ({ ...prev, description: newValue }))
                      }}
                      className="w-full border rounded-lg px-4 py-2.5"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Imagem de Capa</label>
                    <ImageUploader
                      value={settings.cover_image}
                      onChange={(url) => setSettings(prev => ({ ...prev, cover_image: url }))}
                      placeholder="Clique para fazer upload da imagem de capa"
                      recommendedDimensions="1920 x 1080px (Banner horizontal)"
                      cropType="banner"
                    />
                  </div>
                </div>
              </SectionWrapper>

              {/* Hero */}
              <SectionWrapper section="hero" icon={<Package size={18} />} title="Seção Hero (Topo)">
                <div className="space-y-4">
                  <Input
                    label="Título do Hero"
                    value={settings.hero.title}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value }
                    }))}
                    placeholder="Smart Watch"
                  />
                  <Input
                    label="Subtítulo"
                    value={settings.hero.subtitle}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value }
                    }))}
                    placeholder="O mais poderoso de todos os tempos."
                  />
                  <Input
                    label="Badge (ex: Novo)"
                    value={settings.hero.badge}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      hero: { ...prev.hero, badge: e.target.value }
                    }))}
                    placeholder="Novo"
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Imagem do Hero</label>
                    <ImageUploader
                      value={settings.hero.image}
                      onChange={(url) => setSettings(prev => ({
                        ...prev,
                        hero: { ...prev.hero, image: url }
                      }))}
                      placeholder="Clique para fazer upload da imagem do hero"
                      recommendedDimensions="1920 x 1080px (Banner horizontal)"
                      cropType="banner"
                    />
                  </div>
                  <Input
                    label="Texto do Botão CTA"
                    value={settings.hero.cta_text || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      hero: { ...prev.hero, cta_text: e.target.value }
                    }))}
                    placeholder="Comprar Agora"
                  />
                  <Input
                    label="Link do Botão CTA"
                    value={settings.hero.cta_link || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      hero: { ...prev.hero, cta_link: e.target.value }
                    }))}
                    placeholder="/comparar"
                  />
                </div>
              </SectionWrapper>

              {/* Vídeo */}
              <SectionWrapper section="video" icon={<Package size={18} />} title="Seção de Vídeo">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">URL do Vídeo (YouTube) ou Upload</label>
                    <div className="space-y-2">
                      <Input
                        value={settings.video?.url || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          video: { ...prev.video, url: e.target.value } as any
                        }))}
                        placeholder="https://www.youtube.com/watch?v=... ou faça upload abaixo"
                      />
                      <VideoUploader
                        value={settings.video?.url || ''}
                        onChange={(url) => setSettings(prev => ({
                          ...prev,
                          video: { ...prev.video, url: url } as any
                        }))}
                        placeholder="Ou faça upload de um vídeo"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Thumbnail do Vídeo</label>
                    <ImageUploader
                      value={settings.video?.thumbnail || ''}
                      onChange={(url) => setSettings(prev => ({
                        ...prev,
                        video: { ...prev.video, thumbnail: url } as any
                      }))}
                      placeholder="Clique para fazer upload da thumbnail"
                      recommendedDimensions="1920 x 1080px"
                      cropType="banner"
                    />
                  </div>
                  <Input
                    label="Título"
                    value={settings.video?.title || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      video: { ...prev.video, title: e.target.value } as any
                    }))}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <textarea
                      value={settings.video?.description || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        video: { ...prev.video, description: e.target.value } as any
                      }))}
                      className="w-full border rounded-lg px-4 py-2.5"
                      rows={3}
                    />
                  </div>
                </div>
              </SectionWrapper>

              {/* Features */}
              <SectionWrapper section="features" icon={<Package size={18} />} title={`Features (${settings.features?.length || 0})`}>
                <div className="space-y-4">
                  <Input
                    label="Título da Seção"
                    value={settings.features_title || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, features_title: e.target.value }))}
                  />
                  <Input
                    label="Subtítulo"
                    value={settings.features_subtitle || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, features_subtitle: e.target.value }))}
                  />
                  <div className="space-y-3">
                    {(settings.features || []).map((feature, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">Feature {index + 1}</h4>
                          <button
                            onClick={() => {
                              setSettings(prev => {
                                const features = [...(prev.features || [])]
                                features.splice(index, 1)
                                return { ...prev, features }
                              })
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <Input
                            label="Ícone (emoji ou texto)"
                            value={feature.icon || ''}
                            onChange={(e) => {
                              setSettings(prev => {
                                const features = [...(prev.features || [])]
                                features[index] = { ...features[index], icon: e.target.value }
                                return { ...prev, features }
                              })
                            }}
                            placeholder="💡"
                          />
                          <Input
                            label="Título"
                            value={feature.title}
                            onChange={(e) => {
                              setSettings(prev => {
                                const features = [...(prev.features || [])]
                                features[index] = { ...features[index], title: e.target.value }
                                return { ...prev, features }
                              })
                            }}
                          />
                          <div>
                            <label className="block text-sm font-medium mb-2">Descrição</label>
                            <textarea
                              value={feature.description}
                              onChange={(e) => {
                                setSettings(prev => {
                                  const features = [...(prev.features || [])]
                                  features[index] = { ...features[index], description: e.target.value }
                                  return { ...prev, features }
                                })
                              }}
                              className="w-full border rounded-lg px-4 py-2.5"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setSettings(prev => ({
                          ...prev,
                          features: [...(prev.features || []), { title: '', description: '', icon: '' }]
                        }))
                      }}
                      className="w-full py-2 border-2 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Adicionar Feature
                    </button>
                  </div>
                </div>
              </SectionWrapper>

              {/* Gallery */}
              <SectionWrapper section="gallery" icon={<Package size={18} />} title={`Galeria (${settings.gallery?.length || 0})`}>
                <div className="space-y-4">
                  <Input
                    label="Título da Galeria"
                    value={settings.gallery_title || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, gallery_title: e.target.value }))}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Imagens da Galeria</label>
                    <ArrayImageManager
                      value={settings.gallery || []}
                      onChange={(images) => setSettings(prev => ({ ...prev, gallery: images }))}
                      maxImages={10}
                      label=""
                    />
                  </div>
                </div>
              </SectionWrapper>

              {/* Product Showcase */}
              <SectionWrapper section="showcase" icon={<Package size={18} />} title="Destaque de Produto">
                <div className="space-y-4">
                  <Input
                    label="Título"
                    value={settings.product_showcase?.title || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      product_showcase: { ...prev.product_showcase, title: e.target.value } as any
                    }))}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <textarea
                      value={settings.product_showcase?.description || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        product_showcase: { ...prev.product_showcase, description: e.target.value } as any
                      }))}
                      className="w-full border rounded-lg px-4 py-2.5"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Imagem</label>
                    <ImageUploader
                      value={settings.product_showcase?.image || ''}
                      onChange={(url) => setSettings(prev => ({
                        ...prev,
                        product_showcase: { ...prev.product_showcase, image: url } as any
                      }))}
                      placeholder="Clique para fazer upload da imagem"
                      recommendedDimensions="1920 x 1080px"
                      cropType="banner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Features (uma por linha)</label>
                    <textarea
                      value={(settings.product_showcase?.features || []).join('\n')}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        product_showcase: { 
                          ...prev.product_showcase, 
                          features: e.target.value.split('\n').filter(Boolean) 
                        } as any
                      }))}
                      className="w-full border rounded-lg px-4 py-2.5"
                      rows={4}
                      placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    />
                  </div>
                  <Input
                    label="Texto do Botão CTA"
                    value={settings.product_showcase?.cta_text || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      product_showcase: { ...prev.product_showcase, cta_text: e.target.value } as any
                    }))}
                    placeholder="Comprar Agora"
                  />
                  <Input
                    label="Link do Botão CTA"
                    value={settings.product_showcase?.cta_link || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      product_showcase: { ...prev.product_showcase, cta_link: e.target.value } as any
                    }))}
                    placeholder="/comparar"
                  />
                </div>
              </SectionWrapper>

              {/* Produtos em Destaque */}
              <SectionWrapper section="featured" icon={<Package size={18} />} title={`Produtos em Destaque (${settings.featured_products.length})`}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {products.map(product => (
                    <label 
                      key={product.id}
                      className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm ${
                        settings.featured_products.includes(product.id) ? 'border-purple-500 bg-purple-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settings.featured_products.includes(product.id)}
                        onChange={() => toggleFeaturedProduct(product.id)}
                        className="rounded"
                      />
                      <span className="truncate">{product.name}</span>
                    </label>
                  ))}
                </div>
              </SectionWrapper>

              {/* CTA Final */}
              <SectionWrapper section="cta" icon={<Package size={18} />} title="CTA Final">
                <div className="space-y-4">
                  <Input
                    label="Título"
                    value={settings.cta_title || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, cta_title: e.target.value }))}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <textarea
                      value={settings.cta_description || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, cta_description: e.target.value }))}
                      className="w-full border rounded-lg px-4 py-2.5"
                      rows={2}
                    />
                  </div>
                  <Input
                    label="Texto do Botão"
                    value={settings.cta_text || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, cta_text: e.target.value }))}
                    placeholder="Ver todos os produtos"
                  />
                  <Input
                    label="Link do Botão"
                    value={settings.cta_link || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, cta_link: e.target.value }))}
                    placeholder="/comparar"
                  />
                </div>
              </SectionWrapper>

              {/* Produtos em Destaque - Subtítulo */}
              <SectionWrapper section="featured_subtitle" icon={<Package size={18} />} title="Subtítulo dos Produtos em Destaque">
                <Input
                  label="Subtítulo"
                  value={settings.featured_subtitle || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, featured_subtitle: e.target.value }))}
                  placeholder="Veja nossa coleção completa"
                />
              </SectionWrapper>

              {/* Categorias */}
              <SectionWrapper section="categories" icon={<Package size={18} />} title={`Categorias (${settings.categories.length})`}>
                <div className="space-y-4">
                  {settings.categories.map((category, index) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Categoria {index + 1}</h4>
                        <button
                          onClick={() => removeCategory(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <Input
                          label="Nome"
                          value={category.name}
                          onChange={(e) => updateCategory(index, { name: e.target.value })}
                        />
                        <Input
                          label="Descrição"
                          value={category.description}
                          onChange={(e) => updateCategory(index, { description: e.target.value })}
                        />
                        <div>
                          <label className="block text-sm font-medium mb-2">Imagem</label>
                          <ImageUploader
                            value={category.image}
                            onChange={(url) => updateCategory(index, { image: url })}
                            placeholder="Clique para fazer upload da imagem"
                            recommendedDimensions="800 x 600px"
                            cropType="square"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Produtos ({category.products?.length || 0}):</p>
                          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                            {products.map(product => (
                              <label 
                                key={product.id}
                                className={`flex items-center gap-2 p-2 border rounded cursor-pointer text-xs ${
                                  category.products?.includes(product.id) ? 'border-blue-500 bg-blue-50' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={category.products?.includes(product.id) || false}
                                  onChange={() => toggleProductInCategory(index, product.id)}
                                  className="rounded"
                                />
                                <span className="truncate">{product.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addCategory}
                    className="w-full py-2 border-2 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Adicionar Categoria
                  </button>
                </div>
              </SectionWrapper>
            </div>
          </div>

          {/* Sidebar - Cores */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Palette size={20} />
                Cores do Tema
              </h2>
              <div className="space-y-4">
                {Object.entries(settings.theme_colors).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme_colors: { ...settings.theme_colors, [key]: e.target.value }
                        })}
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme_colors: { ...settings.theme_colors, [key]: e.target.value }
                        })}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EditCatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    }>
      <EditCatalogContent />
    </Suspense>
  )
}


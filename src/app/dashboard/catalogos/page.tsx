'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ProductCatalog, Product } from '@/types'
import { Plus, Edit, Trash2, Eye, BookOpen, ArrowLeft, Search, Package, ChevronDown, ChevronUp, Palette, Check, Link2, Layers, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface CatalogLayout {
  id: string
  name: string
  slug: string
  description: string
  preview_image: string | null
  default_content: any
  is_active: boolean
}

export default function CatalogsPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [layouts, setLayouts] = useState<CatalogLayout[]>([])
  const [catalogs, setCatalogs] = useState<ProductCatalog[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLayout, setSelectedLayout] = useState<CatalogLayout | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCatalog, setEditingCatalog] = useState<ProductCatalog | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    cover_image: '',
    theme_colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#D4AF37',
      background: '#ffffff',
      text: '#000000',
    },
    content: {
      hero: { title: '', subtitle: '', image: '', badge: '' },
      categories: [] as any[],
      featured_products: [] as string[],
      sections: [] as any[],
    },
    is_active: true,
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !isEditor) {
      router.push('/dashboard')
      return
    }

    loadLayouts()
    loadProducts()
  }, [isAuthenticated, isEditor, authLoading, router])

  useEffect(() => {
    if (selectedLayout) {
      loadCatalogs(selectedLayout.id)
    }
  }, [selectedLayout])

  const loadLayouts = async () => {
    try {
      // Primeiro tenta carregar da tabela catalog_layouts
      const { data, error } = await supabase
        .from('catalog_layouts')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        // Se a tabela não existir, usa layouts padrão
        console.log('Tabela catalog_layouts não existe, usando layouts padrão')
        setLayouts([
          {
            id: 'apple-style',
            name: 'Catálogo Apple Style',
            slug: 'apple-style',
            description: 'Layout minimalista e elegante inspirado no estilo Apple.',
            preview_image: null,
            default_content: {},
            is_active: true,
          },
          {
            id: 'grade',
            name: 'Catálogo Grade',
            slug: 'grade',
            description: 'Layout em grade com múltiplos produtos por linha.',
            preview_image: null,
            default_content: {},
            is_active: true,
          },
        ])
      } else {
        setLayouts(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar layouts:', error)
      // Usar layouts padrão como fallback
      setLayouts([
        {
          id: 'apple-style',
          name: 'Catálogo Apple Style',
          slug: 'apple-style',
          description: 'Layout minimalista e elegante inspirado no estilo Apple.',
          preview_image: null,
          default_content: {},
          is_active: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadCatalogs = async (layoutId?: string) => {
    try {
      let query = supabase
        .from('product_catalogs')
        .select('*')
        .order('created_at', { ascending: false })

      // Se tiver layout_id, filtrar
      if (layoutId && layoutId !== 'apple-style' && layoutId !== 'grade') {
        query = query.eq('layout_id', layoutId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao carregar catálogos:', error)
        setCatalogs([])
      } else {
        setCatalogs(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar catálogos:', error)
      setCatalogs([])
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
    try {
      if (!formData.slug || !formData.title) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      const catalogData: any = {
        slug: formData.slug,
        title: formData.title,
        description: formData.description || null,
        cover_image: formData.cover_image || null,
        theme_colors: formData.theme_colors,
        content: formData.content,
        is_active: formData.is_active,
      }

      // Adicionar layout_id se o layout tiver ID do banco
      if (selectedLayout && selectedLayout.id !== 'apple-style' && selectedLayout.id !== 'grade') {
        catalogData.layout_id = selectedLayout.id
      }

      if (editingCatalog) {
        const { error } = await supabase
          .from('product_catalogs')
          .update(catalogData)
          .eq('id', editingCatalog.id)

        if (error) throw error
        toast.success('Catálogo atualizado!')
      } else {
        const { error } = await supabase
          .from('product_catalogs')
          .insert(catalogData)

        if (error) throw error
        toast.success('Catálogo criado!')
      }

      setIsModalOpen(false)
      setEditingCatalog(null)
      resetForm()
      loadCatalogs(selectedLayout?.id)
    } catch (error: any) {
      console.error('Erro ao salvar catálogo:', error)
      toast.error(error.message || 'Erro ao salvar catálogo')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este catálogo?')) return

    try {
      const { error } = await supabase
        .from('product_catalogs')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Catálogo excluído!')
      loadCatalogs(selectedLayout?.id)
    } catch (error: any) {
      console.error('Erro ao excluir catálogo:', error)
      toast.error('Erro ao excluir catálogo')
    }
  }

  const resetForm = () => {
    const defaultContent = selectedLayout?.default_content || {}
    setFormData({
      slug: '',
      title: '',
      description: '',
      cover_image: '',
      theme_colors: defaultContent.theme_colors || {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#D4AF37',
        background: '#ffffff',
        text: '#000000',
      },
      content: {
        hero: defaultContent.hero || { title: '', subtitle: '', image: '', badge: '' },
        categories: [],
        featured_products: [],
        sections: [],
      },
      is_active: true,
    })
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/catalogo/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedLink(slug)
    toast.success('Link copiado!')
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const toggleFeaturedProduct = (productId: string) => {
    const featured = formData.content.featured_products || []
    
    if (featured.includes(productId)) {
      setFormData({
        ...formData,
        content: {
          ...formData.content,
          featured_products: featured.filter(id => id !== productId)
        }
      })
    } else {
      setFormData({
        ...formData,
        content: {
          ...formData.content,
          featured_products: [...featured, productId]
        }
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  // Se não selecionou layout, mostrar seleção de layouts
  if (!selectedLayout) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Catálogos de Produtos</h1>
                <p className="text-gray-600">Selecione um layout para gerenciar seus catálogos</p>
              </div>
            </div>
          </div>

          {/* Layouts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {layouts.map((layout, index) => (
              <motion.div
                key={layout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedLayout(layout)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:border-purple-200 transition-all group"
              >
                {/* Preview Image */}
                <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-50 relative flex items-center justify-center">
                  {layout.preview_image ? (
                    <img 
                      src={layout.preview_image} 
                      alt={layout.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Layers size={48} className="mx-auto text-purple-300 mb-2" />
                      <span className="text-purple-400 text-sm">{layout.slug}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                      Selecionar <ArrowRight size={16} />
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{layout.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{layout.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Layout selecionado - mostrar catálogos
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSelectedLayout(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedLayout.name}</h1>
              <p className="text-gray-600">{selectedLayout.description}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingCatalog(null)
                resetForm()
                setIsModalOpen(true)
              }}
              className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <Plus size={20} />
              Novo Catálogo
            </button>
          </div>
        </div>

        {/* Lista de Catálogos */}
        {catalogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum catálogo neste layout</h3>
            <p className="text-gray-500 mb-6">Crie seu primeiro catálogo com o layout {selectedLayout.name}</p>
            <button
              onClick={() => {
                setEditingCatalog(null)
                resetForm()
                setIsModalOpen(true)
              }}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Criar Catálogo
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Catálogo</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">URL</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {catalogs.map(catalog => (
                  <tr key={catalog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{catalog.title}</p>
                        {catalog.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{catalog.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/catalogo/{catalog.slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        catalog.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {catalog.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyLink(catalog.slug)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copiar link"
                        >
                          {copiedLink === catalog.slug ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Link2 size={18} className="text-gray-500" />
                          )}
                        </button>
                        <Link
                          href={`/catalogo/${catalog.slug}`}
                          target="_blank"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye size={18} className="text-gray-500" />
                        </Link>
                        <button
                          onClick={() => {
                            setEditingCatalog(catalog)
                            setFormData({
                              slug: catalog.slug,
                              title: catalog.title,
                              description: catalog.description || '',
                              cover_image: catalog.cover_image || '',
                              theme_colors: catalog.theme_colors as any || {
                                primary: '#000000',
                                secondary: '#ffffff',
                                accent: '#D4AF37',
                                background: '#ffffff',
                                text: '#000000',
                              },
                              content: catalog.content as any || {
                                hero: { title: '', subtitle: '', image: '', badge: '' },
                                categories: [],
                                featured_products: [],
                                sections: [],
                              },
                              is_active: catalog.is_active,
                            })
                            setIsModalOpen(true)
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(catalog.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Edição */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold">
                  {editingCatalog ? 'Editar Catálogo' : 'Novo Catálogo'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Layout: {selectedLayout.name}</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="Catálogo de Smartwatches"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug (URL) *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="smartwatches-2024"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL: /catalogo/{formData.slug || 'slug'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5"
                    rows={2}
                    placeholder="Descrição do catálogo..."
                  />
                </div>

                {/* Hero */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Seção Hero (Topo)</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.content.hero?.title || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        content: { ...formData.content, hero: { ...formData.content.hero, title: e.target.value } }
                      })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="Título do Hero (ex: Smart Watch)"
                    />
                    <input
                      type="text"
                      value={formData.content.hero?.subtitle || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        content: { ...formData.content, hero: { ...formData.content.hero, subtitle: e.target.value } }
                      })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="Subtítulo (ex: O mais poderoso de todos os tempos.)"
                    />
                    <input
                      type="text"
                      value={formData.content.hero?.badge || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        content: { ...formData.content, hero: { ...formData.content.hero, badge: e.target.value } }
                      })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="Badge (ex: Novo)"
                    />
                  </div>
                </div>

                {/* Produtos em Destaque */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Produtos em Destaque ({formData.content.featured_products?.length || 0})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {products.map(product => (
                      <label 
                        key={product.id}
                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm ${
                          formData.content.featured_products?.includes(product.id) ? 'border-purple-500 bg-purple-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.content.featured_products?.includes(product.id) || false}
                          onChange={() => toggleFeaturedProduct(product.id)}
                          className="rounded"
                        />
                        <span className="truncate">{product.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t pt-4">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <label className="text-sm">Catálogo ativo (visível publicamente)</label>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-4 sticky bottom-0 bg-white">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingCatalog(null)
                    resetForm()
                  }}
                  className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

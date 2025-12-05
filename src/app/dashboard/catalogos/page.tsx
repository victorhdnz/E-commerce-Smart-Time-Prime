'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ProductCatalog, Product } from '@/types'
import { Plus, Edit, Trash2, Eye, BookOpen, ArrowLeft, Search, Package, Image as ImageIcon, ChevronDown, ChevronUp, GripVertical, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CatalogsPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [catalogs, setCatalogs] = useState<ProductCatalog[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCatalog, setEditingCatalog] = useState<ProductCatalog | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('basic')
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
      hero: {
        title: '',
        subtitle: '',
        image: '',
        badge: '',
      },
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

    loadCatalogs()
    loadProducts()
  }, [isAuthenticated, isEditor, authLoading, router])

  const loadCatalogs = async () => {
    try {
      const { data, error } = await supabase
        .from('product_catalogs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCatalogs(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar catálogos:', error)
      // Tabela pode não existir ainda
      setCatalogs([])
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
    try {
      if (!formData.slug || !formData.title) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      const catalogData = {
        slug: formData.slug,
        title: formData.title,
        description: formData.description || null,
        cover_image: formData.cover_image || null,
        theme_colors: formData.theme_colors,
        content: formData.content,
        is_active: formData.is_active,
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
      loadCatalogs()
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
      loadCatalogs()
    } catch (error: any) {
      console.error('Erro ao excluir catálogo:', error)
      toast.error('Erro ao excluir catálogo')
    }
  }

  const resetForm = () => {
    setFormData({
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
        categories: [],
        featured_products: [],
        sections: [],
      },
      is_active: true,
    })
  }

  const addCategory = () => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        categories: [
          ...formData.content.categories,
          { id: Date.now().toString(), name: '', description: '', image: '', products: [] }
        ]
      }
    })
  }

  const updateCategory = (index: number, updates: any) => {
    const categories = [...formData.content.categories]
    categories[index] = { ...categories[index], ...updates }
    setFormData({
      ...formData,
      content: { ...formData.content, categories }
    })
  }

  const removeCategory = (index: number) => {
    const categories = formData.content.categories.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      content: { ...formData.content, categories }
    })
  }

  const toggleProductInCategory = (categoryIndex: number, productId: string) => {
    const categories = [...formData.content.categories]
    const products = categories[categoryIndex].products || []
    
    if (products.includes(productId)) {
      categories[categoryIndex].products = products.filter((id: string) => id !== productId)
    } else {
      categories[categoryIndex].products = [...products, productId]
    }
    
    setFormData({
      ...formData,
      content: { ...formData.content, categories }
    })
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

  // Filtrar catálogos pela busca
  const filteredCatalogs = catalogs.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

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
              <p className="text-gray-600">Crie catálogos visuais para seus produtos</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar catálogo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
              />
            </div>
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
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum catálogo</h3>
            <p className="text-gray-500 mb-6">Crie catálogos visuais para exibir seus produtos</p>
            <button
              onClick={() => {
                setEditingCatalog(null)
                resetForm()
                setIsModalOpen(true)
              }}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Criar Primeiro Catálogo
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalogs.map(catalog => (
              <div key={catalog.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover Image */}
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {catalog.cover_image ? (
                    <img 
                      src={catalog.cover_image} 
                      alt={catalog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen size={48} className="text-gray-300" />
                    </div>
                  )}
                  <div 
                    className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: catalog.is_active ? '#22c55e' : '#ef4444',
                      color: 'white'
                    }}
                  >
                    {catalog.is_active ? 'Ativo' : 'Inativo'}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{catalog.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">/catalogo/{catalog.slug}</p>
                  {catalog.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{catalog.description}</p>
                  )}

                  <div className="flex gap-2 pt-3 border-t">
                    <Link
                      href={`/catalogo/${catalog.slug}`}
                      target="_blank"
                      className="flex-1 py-2 px-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
                    >
                      <Eye size={16} />
                      Ver
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
                      className="flex-1 py-2 px-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(catalog.id)}
                      className="py-2 px-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Edição */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold">
                  {editingCatalog ? 'Editar Catálogo' : 'Novo Catálogo'}
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Seção: Informações Básicas */}
                <motion.div className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'basic' ? null : 'basic')}
                    className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <BookOpen size={18} />
                      Informações Básicas
                    </span>
                    {expandedSection === 'basic' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {expandedSection === 'basic' && (
                    <div className="p-4 space-y-4">
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
                          rows={3}
                          placeholder="Descrição do catálogo..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Imagem de Capa</label>
                        <input
                          type="text"
                          value={formData.cover_image}
                          onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="URL da imagem de capa"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="w-5 h-5 rounded"
                        />
                        <label className="text-sm">Catálogo ativo (visível publicamente)</label>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Seção: Hero */}
                <motion.div className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'hero' ? null : 'hero')}
                    className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <ImageIcon size={18} />
                      Seção Hero (Topo)
                    </span>
                    {expandedSection === 'hero' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {expandedSection === 'hero' && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Título do Hero</label>
                        <input
                          type="text"
                          value={formData.content.hero?.title || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            content: {
                              ...formData.content,
                              hero: { ...formData.content.hero, title: e.target.value }
                            }
                          })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="Smart Watch"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Subtítulo</label>
                        <input
                          type="text"
                          value={formData.content.hero?.subtitle || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            content: {
                              ...formData.content,
                              hero: { ...formData.content.hero, subtitle: e.target.value }
                            }
                          })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="O mais poderoso de todos os tempos."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Badge (Ex: "Novo")</label>
                        <input
                          type="text"
                          value={formData.content.hero?.badge || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            content: {
                              ...formData.content,
                              hero: { ...formData.content.hero, badge: e.target.value }
                            }
                          })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="Novo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Imagem do Hero</label>
                        <input
                          type="text"
                          value={formData.content.hero?.image || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            content: {
                              ...formData.content,
                              hero: { ...formData.content.hero, image: e.target.value }
                            }
                          })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="URL da imagem"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Seção: Produtos em Destaque */}
                <motion.div className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'featured' ? null : 'featured')}
                    className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <Package size={18} />
                      Produtos em Destaque ({formData.content.featured_products?.length || 0})
                    </span>
                    {expandedSection === 'featured' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {expandedSection === 'featured' && (
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Selecione os produtos que aparecerão em destaque no catálogo.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                        {products.map(product => (
                          <label 
                            key={product.id}
                            className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                              formData.content.featured_products?.includes(product.id) ? 'border-blue-500 bg-blue-50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.content.featured_products?.includes(product.id) || false}
                              onChange={() => toggleFeaturedProduct(product.id)}
                              className="rounded"
                            />
                            <span className="text-sm truncate">{product.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Seção: Categorias */}
                <motion.div className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'categories' ? null : 'categories')}
                    className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <GripVertical size={18} />
                      Categorias ({formData.content.categories?.length || 0})
                    </span>
                    {expandedSection === 'categories' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {expandedSection === 'categories' && (
                    <div className="p-4 space-y-4">
                      {formData.content.categories.map((category, index) => (
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
                            <input
                              type="text"
                              value={category.name || ''}
                              onChange={(e) => updateCategory(index, { name: e.target.value })}
                              placeholder="Nome da categoria"
                              className="w-full border rounded-lg px-3 py-2"
                            />
                            <input
                              type="text"
                              value={category.description || ''}
                              onChange={(e) => updateCategory(index, { description: e.target.value })}
                              placeholder="Descrição (opcional)"
                              className="w-full border rounded-lg px-3 py-2"
                            />
                            <input
                              type="text"
                              value={category.image || ''}
                              onChange={(e) => updateCategory(index, { image: e.target.value })}
                              placeholder="URL da imagem (opcional)"
                              className="w-full border rounded-lg px-3 py-2"
                            />
                            
                            <div>
                              <p className="text-sm font-medium mb-2">Produtos nesta categoria:</p>
                              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
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
                  )}
                </motion.div>

                {/* Seção: Cores */}
                <motion.div className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'colors' ? null : 'colors')}
                    className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <Palette size={18} />
                      Cores do Tema
                    </span>
                    {expandedSection === 'colors' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {expandedSection === 'colors' && (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(formData.theme_colors).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => setFormData({
                                ...formData,
                                theme_colors: { ...formData.theme_colors, [key]: e.target.value }
                              })}
                              className="w-12 h-10 rounded border cursor-pointer"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setFormData({
                                ...formData,
                                theme_colors: { ...formData.theme_colors, [key]: e.target.value }
                              })}
                              className="flex-1 border rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
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


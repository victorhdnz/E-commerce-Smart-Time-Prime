'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ProductSupportPage, Product } from '@/types'
import { Plus, Edit, Trash2, Eye, FileText, ArrowLeft, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SupportPagesPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [supportPages, setSupportPages] = useState<(ProductSupportPage & { product?: Product })[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<ProductSupportPage | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  const [formData, setFormData] = useState({
    product_id: '',
    model_slug: '',
    title: '',
    content: {
      sections: [] as any[],
    },
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !isEditor) {
      router.push('/dashboard')
      return
    }

    loadSupportPages()
    loadProducts()
  }, [isAuthenticated, isEditor, authLoading, router])

  const loadSupportPages = async () => {
    try {
      const { data, error } = await supabase
        .from('product_support_pages')
        .select(`
          *,
          product:products(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSupportPages(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar páginas de suporte:', error)
      toast.error('Erro ao carregar páginas de suporte')
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
      if (!formData.product_id || !formData.model_slug || !formData.title) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      const pageData = {
        product_id: formData.product_id,
        model_slug: formData.model_slug,
        title: formData.title,
        content: formData.content,
        is_active: true,
      }

      if (editingPage) {
        const { error } = await supabase
          .from('product_support_pages')
          .update(pageData)
          .eq('id', editingPage.id)

        if (error) throw error
        toast.success('Página atualizada!')
      } else {
        const { error } = await supabase
          .from('product_support_pages')
          .insert(pageData)

        if (error) throw error
        toast.success('Página criada!')
      }

      setIsModalOpen(false)
      setEditingPage(null)
      resetForm()
      loadSupportPages()
    } catch (error: any) {
      console.error('Erro ao salvar página:', error)
      toast.error(error.message || 'Erro ao salvar página')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta página?')) return

    try {
      const { error } = await supabase
        .from('product_support_pages')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Página excluída!')
      loadSupportPages()
    } catch (error: any) {
      console.error('Erro ao excluir página:', error)
      toast.error('Erro ao excluir página')
    }
  }

  const resetForm = () => {
    setFormData({
      product_id: '',
      model_slug: '',
      title: '',
      content: { sections: [] },
    })
  }

  const addSection = (type: string) => {
    const newSection = {
      id: Date.now().toString(),
      type,
      title: '',
      content: '',
      image: '',
      video: '',
      items: [],
    }
    setFormData({
      ...formData,
      content: {
        sections: [...formData.content.sections, newSection],
      },
    })
  }

  const updateSection = (index: number, updates: any) => {
    const sections = [...formData.content.sections]
    sections[index] = { ...sections[index], ...updates }
    setFormData({
      ...formData,
      content: { sections },
    })
  }

  const removeSection = (index: number) => {
    const sections = formData.content.sections.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      content: { sections },
    })
  }

  // Filtrar páginas pela busca
  const filteredPages = supportPages.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.model_slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900">Páginas de Suporte</h1>
              <p className="text-gray-600">Manuais e guias de configuração por modelo de produto</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar página..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
              />
            </div>
            <button
              onClick={() => {
                setEditingPage(null)
                resetForm()
                setIsModalOpen(true)
              }}
              className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <Plus size={20} />
              Nova Página
            </button>
          </div>
        </div>

        {/* Lista de Páginas */}
        {supportPages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma página de suporte</h3>
            <p className="text-gray-500 mb-6">Crie manuais e guias para seus produtos</p>
            <button
              onClick={() => {
                setEditingPage(null)
                resetForm()
                setIsModalOpen(true)
              }}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Criar Primeira Página
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map(page => (
              <div key={page.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{page.title}</h3>
                    <p className="text-sm text-gray-500">/suporte/{page.model_slug}</p>
                    {page.product && (
                      <p className="text-sm text-gray-600 mt-2">{page.product.name}</p>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  {((page.content as any)?.sections?.length || 0)} seções
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Link
                    href={`/suporte/${page.model_slug}`}
                    target="_blank"
                    className="flex-1 py-2 px-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye size={16} />
                    Ver
                  </Link>
                  <button
                    onClick={() => {
                      setEditingPage(page)
                      setFormData({
                        product_id: page.product_id,
                        model_slug: page.model_slug,
                        title: page.title,
                        content: (page.content as any) || { sections: [] },
                      })
                      setIsModalOpen(true)
                    }}
                    className="flex-1 py-2 px-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="py-2 px-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold">
                  {editingPage ? 'Editar Página' : 'Nova Página de Suporte'}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Produto *</label>
                    <select
                      value={formData.product_id}
                      onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2.5"
                    >
                      <option value="">Selecione um produto</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug do Modelo *</label>
                    <input
                      type="text"
                      value={formData.model_slug}
                      onChange={(e) => setFormData({ ...formData, model_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="smartwatch-serie-11"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL: /suporte/{formData.model_slug || 'slug'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Título da Página *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5"
                    placeholder="Como usar o Smartwatch Série 11"
                  />
                </div>

                {/* Seções */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Seções do Conteúdo</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addSection('text')}
                        className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        + Texto
                      </button>
                      <button
                        onClick={() => addSection('image')}
                        className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        + Imagem
                      </button>
                      <button
                        onClick={() => addSection('video')}
                        className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        + Vídeo
                      </button>
                      <button
                        onClick={() => addSection('list')}
                        className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        + Lista
                      </button>
                    </div>
                  </div>

                  {formData.content.sections.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-gray-500">Adicione seções para criar o conteúdo da página</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.content.sections.map((section, index) => (
                        <div key={section.id || index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <select
                              value={section.type}
                              onChange={(e) => updateSection(index, { type: e.target.value })}
                              className="border rounded px-2 py-1 text-sm"
                            >
                              <option value="text">Texto</option>
                              <option value="image">Imagem</option>
                              <option value="video">Vídeo</option>
                              <option value="list">Lista</option>
                              <option value="accordion">Accordion</option>
                            </select>
                            <button
                              onClick={() => removeSection(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={section.title || ''}
                            onChange={(e) => updateSection(index, { title: e.target.value })}
                            placeholder="Título da seção"
                            className="w-full border rounded-lg px-3 py-2 mb-2"
                          />
                          {section.type === 'text' && (
                            <textarea
                              value={section.content || ''}
                              onChange={(e) => updateSection(index, { content: e.target.value })}
                              placeholder="Conteúdo"
                              className="w-full border rounded-lg px-3 py-2"
                              rows={4}
                            />
                          )}
                          {section.type === 'image' && (
                            <input
                              type="text"
                              value={section.image || ''}
                              onChange={(e) => updateSection(index, { image: e.target.value })}
                              placeholder="URL da imagem"
                              className="w-full border rounded-lg px-3 py-2"
                            />
                          )}
                          {section.type === 'video' && (
                            <input
                              type="text"
                              value={section.video || ''}
                              onChange={(e) => updateSection(index, { video: e.target.value })}
                              placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
                              className="w-full border rounded-lg px-3 py-2"
                            />
                          )}
                          {(section.type === 'list' || section.type === 'accordion') && (
                            <div className="space-y-2">
                              {(section.items || []).map((item: any, itemIndex: number) => (
                                <div key={itemIndex} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={item.title || ''}
                                    onChange={(e) => {
                                      const items = [...(section.items || [])]
                                      items[itemIndex] = { ...items[itemIndex], title: e.target.value }
                                      updateSection(index, { items })
                                    }}
                                    placeholder="Título"
                                    className="flex-1 border rounded-lg px-3 py-2"
                                  />
                                  <input
                                    type="text"
                                    value={item.description || ''}
                                    onChange={(e) => {
                                      const items = [...(section.items || [])]
                                      items[itemIndex] = { ...items[itemIndex], description: e.target.value }
                                      updateSection(index, { items })
                                    }}
                                    placeholder="Descrição"
                                    className="flex-1 border rounded-lg px-3 py-2"
                                  />
                                  <button
                                    onClick={() => {
                                      const items = (section.items || []).filter((_: any, i: number) => i !== itemIndex)
                                      updateSection(index, { items })
                                    }}
                                    className="text-red-600 p-2"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const items = [...(section.items || []), { title: '', description: '' }]
                                  updateSection(index, { items })
                                }}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                + Adicionar item
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-4 sticky bottom-0 bg-white">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingPage(null)
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


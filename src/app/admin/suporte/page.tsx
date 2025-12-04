'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ProductSupportPage, Product } from '@/types'
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminSupportPage() {
  const router = useRouter()
  const { isAuthenticated, profile, loading: authLoading } = useAuth()
  const [supportPages, setSupportPages] = useState<(ProductSupportPage & { product: Product })[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<ProductSupportPage | null>(null)
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

    if (!isAuthenticated || (profile?.role !== 'admin' && profile?.role !== 'editor')) {
      router.push('/')
      return
    }

    loadSupportPages()
    loadProducts()
  }, [isAuthenticated, profile, authLoading, router])

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Páginas de Suporte</h1>
            <p className="text-gray-600">Gerencie páginas de manual/suporte por modelo</p>
          </div>
          <button
            onClick={() => {
              setEditingPage(null)
              resetForm()
              setIsModalOpen(true)
            }}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Página
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportPages.map(page => (
            <div key={page.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{page.title}</h3>
                  <p className="text-sm text-gray-500">/{page.model_slug}</p>
                  {page.product && (
                    <p className="text-sm text-gray-600 mt-1">{page.product.name}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/suporte/${page.model_slug}`}
                    target="_blank"
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Eye size={18} />
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
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">
                  {editingPage ? 'Editar Página' : 'Nova Página'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Produto</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
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
                  <label className="block text-sm font-medium mb-2">Slug do Modelo</label>
                  <input
                    type="text"
                    value={formData.model_slug}
                    onChange={(e) => setFormData({ ...formData, model_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="apple-watch-series-11"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL: /suporte/{formData.model_slug || 'slug'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="Como usar o Apple Watch Series 11"
                  />
                </div>

                {/* Seções */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Seções</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addSection('text')}
                        className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                      >
                        + Texto
                      </button>
                      <button
                        onClick={() => addSection('image')}
                        className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                      >
                        + Imagem
                      </button>
                      <button
                        onClick={() => addSection('list')}
                        className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                      >
                        + Lista
                      </button>
                      <button
                        onClick={() => addSection('accordion')}
                        className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                      >
                        + Accordion
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.content.sections.map((section, index) => (
                      <div key={section.id || index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
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
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => updateSection(index, { title: e.target.value })}
                          placeholder="Título da seção"
                          className="w-full border rounded px-3 py-2 mb-2"
                        />
                        {section.type === 'text' && (
                          <textarea
                            value={section.content || ''}
                            onChange={(e) => updateSection(index, { content: e.target.value })}
                            placeholder="Conteúdo"
                            className="w-full border rounded px-3 py-2"
                            rows={4}
                          />
                        )}
                        {section.type === 'image' && (
                          <input
                            type="text"
                            value={section.image || ''}
                            onChange={(e) => updateSection(index, { image: e.target.value })}
                            placeholder="URL da imagem"
                            className="w-full border rounded px-3 py-2"
                          />
                        )}
                        {section.type === 'video' && (
                          <input
                            type="text"
                            value={section.video || ''}
                            onChange={(e) => updateSection(index, { video: e.target.value })}
                            placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
                            className="w-full border rounded px-3 py-2"
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
                                  className="flex-1 border rounded px-3 py-2"
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
                                  className="flex-1 border rounded px-3 py-2"
                                />
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
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingPage(null)
                    resetForm()
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
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


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ProductSupportPage, Product } from '@/types'
import { Plus, Edit, Trash2, Eye, FileText, ArrowLeft, Search, Check, Link2, Layers, ArrowRight, BookOpen, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface SupportLayout {
  id: string
  name: string
  slug: string
  description: string
  preview_image: string | null
  default_content: any
  is_active: boolean
}

export default function SupportPagesPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [layouts, setLayouts] = useState<SupportLayout[]>([])
  const [supportPages, setSupportPages] = useState<(ProductSupportPage & { product?: Product })[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLayout, setSelectedLayout] = useState<SupportLayout | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<ProductSupportPage | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
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

    loadLayouts()
    loadProducts()
  }, [isAuthenticated, isEditor, authLoading, router])

  useEffect(() => {
    if (selectedLayout) {
      loadSupportPages()
    }
  }, [selectedLayout])

  const loadLayouts = async () => {
    try {
      // Primeiro tenta carregar da tabela support_layouts
      const { data, error } = await supabase
        .from('support_layouts')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        // Se a tabela não existir, usa layouts padrão
        console.log('Tabela support_layouts não existe, usando layouts padrão')
        setLayouts([
          {
            id: 'apple-guide',
            name: 'Manual Apple Guide',
            slug: 'apple-guide',
            description: 'Layout estilo manual da Apple com seções de feature-cards, steps e accordion. Ideal para guias de configuração.',
            preview_image: null,
            default_content: { sections: [] },
            is_active: true,
          },
          {
            id: 'faq-expandido',
            name: 'FAQ Expandido',
            slug: 'faq-expandido',
            description: 'Layout focado em perguntas frequentes com seções de accordion.',
            preview_image: null,
            default_content: { sections: [] },
            is_active: true,
          },
        ])
      } else {
        setLayouts(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar layouts:', error)
      setLayouts([
        {
          id: 'apple-guide',
          name: 'Manual Apple Guide',
          slug: 'apple-guide',
          description: 'Layout estilo manual da Apple.',
          preview_image: null,
          default_content: { sections: [] },
          is_active: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

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
      setSupportPages([])
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

      const pageData: any = {
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
    const defaultContent = selectedLayout?.default_content || {}
    setFormData({
      product_id: '',
      model_slug: '',
      title: '',
      content: defaultContent.sections ? { sections: [...defaultContent.sections] } : { sections: [] },
    })
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/suporte/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedLink(slug)
    toast.success('Link copiado!')
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const addSection = (type: string) => {
    const newSection = {
      id: Date.now().toString(),
      type,
      title: '',
      subtitle: '',
      content: '',
      image: '',
      video: '',
      link: '',
      linkText: '',
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
                <h1 className="text-3xl font-bold text-gray-900">Manuais e Guias</h1>
                <p className="text-gray-600">Selecione um layout para gerenciar suas páginas de suporte</p>
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
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:border-cyan-200 transition-all group"
              >
                {/* Preview */}
                <div className="h-48 bg-gradient-to-br from-cyan-100 to-cyan-50 relative flex items-center justify-center">
                  {layout.preview_image ? (
                    <img 
                      src={layout.preview_image} 
                      alt={layout.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <BookOpen size={48} className="mx-auto text-cyan-300 mb-2" />
                      <span className="text-cyan-400 text-sm">{layout.slug}</span>
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

  // Layout selecionado - mostrar páginas
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
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma página neste layout</h3>
            <p className="text-gray-500 mb-6">Crie seu primeiro manual ou guia com o layout {selectedLayout.name}</p>
            <button
              onClick={() => {
                setEditingPage(null)
                resetForm()
                setIsModalOpen(true)
              }}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Criar Página
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Página</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Produto</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">URL</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Seções</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {supportPages.map(page => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{page.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{page.product?.name || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/suporte/{page.model_slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {((page.content as any)?.sections?.length || 0)} seções
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyLink(page.model_slug)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copiar link"
                        >
                          {copiedLink === page.model_slug ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Link2 size={18} className="text-gray-500" />
                          )}
                        </button>
                        <Link
                          href={`/suporte/${page.model_slug}`}
                          target="_blank"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye size={18} className="text-gray-500" />
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
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
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
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold">
                  {editingPage ? 'Editar Página' : 'Nova Página de Suporte'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Layout: {selectedLayout.name}</p>
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
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => addSection('hero')}
                        className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        + Hero
                      </button>
                      <button
                        onClick={() => addSection('feature-card')}
                        className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        + Feature Card
                      </button>
                      <button
                        onClick={() => addSection('steps')}
                        className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        + Steps
                      </button>
                      <button
                        onClick={() => addSection('text')}
                        className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        + Texto
                      </button>
                      <button
                        onClick={() => addSection('accordion')}
                        className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        + FAQ
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
                              <option value="hero">Hero</option>
                              <option value="feature-card">Feature Card</option>
                              <option value="steps">Steps</option>
                              <option value="text">Texto</option>
                              <option value="image">Imagem</option>
                              <option value="video">Vídeo</option>
                              <option value="list">Lista</option>
                              <option value="accordion">FAQ/Accordion</option>
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
                          
                          {(section.type === 'hero' || section.type === 'feature-card' || section.type === 'steps') && (
                            <input
                              type="text"
                              value={section.subtitle || ''}
                              onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                              placeholder="Subtítulo"
                              className="w-full border rounded-lg px-3 py-2 mb-2"
                            />
                          )}
                          
                          {(section.type === 'text' || section.type === 'feature-card') && (
                            <textarea
                              value={section.content || ''}
                              onChange={(e) => updateSection(index, { content: e.target.value })}
                              placeholder="Conteúdo"
                              className="w-full border rounded-lg px-3 py-2 mb-2"
                              rows={3}
                            />
                          )}
                          
                          {(section.type === 'hero' || section.type === 'image' || section.type === 'feature-card') && (
                            <input
                              type="text"
                              value={section.image || ''}
                              onChange={(e) => updateSection(index, { image: e.target.value })}
                              placeholder="URL da imagem"
                              className="w-full border rounded-lg px-3 py-2 mb-2"
                            />
                          )}

                          {section.type === 'feature-card' && (
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={section.link || ''}
                                onChange={(e) => updateSection(index, { link: e.target.value })}
                                placeholder="URL do link"
                                className="border rounded-lg px-3 py-2"
                              />
                              <input
                                type="text"
                                value={section.linkText || ''}
                                onChange={(e) => updateSection(index, { linkText: e.target.value })}
                                placeholder="Texto do link (ex: Saiba mais)"
                                className="border rounded-lg px-3 py-2"
                              />
                            </div>
                          )}
                          
                          {section.type === 'video' && (
                            <input
                              type="text"
                              value={section.video || ''}
                              onChange={(e) => updateSection(index, { video: e.target.value })}
                              placeholder="URL do vídeo (YouTube, Vimeo)"
                              className="w-full border rounded-lg px-3 py-2"
                            />
                          )}
                          
                          {(section.type === 'list' || section.type === 'accordion' || section.type === 'steps') && (
                            <div className="space-y-2 mt-2">
                              <p className="text-sm font-medium text-gray-600">Itens:</p>
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
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
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
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                  />
                                  <button
                                    onClick={() => {
                                      const items = (section.items || []).filter((_: any, i: number) => i !== itemIndex)
                                      updateSection(index, { items })
                                    }}
                                    className="text-red-600 p-2"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const items = [...(section.items || []), { title: '', description: '' }]
                                  updateSection(index, { items })
                                }}
                                className="text-sm text-cyan-600 hover:underline"
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

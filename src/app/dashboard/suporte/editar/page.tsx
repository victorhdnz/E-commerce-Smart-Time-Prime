'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ProductSupportPage } from '@/types'
import { Save, ArrowLeft, Home, Eye, BookOpen, ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/Input'

interface SupportSection {
  id: string
  type: 'hero' | 'feature-card' | 'steps' | 'text' | 'image' | 'video' | 'list' | 'accordion'
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

function EditSupportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const supabase = createClient()

  const versionId = searchParams.get('version')
  const [supportPage, setSupportPage] = useState<ProductSupportPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null)

  const [sections, setSections] = useState<SupportSection[]>([])

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !isEditor) {
      router.push('/dashboard')
      return
    }

    if (!versionId) {
      toast.error('Página não especificada')
      router.push('/dashboard/suporte')
      return
    }

    loadSupportPage()
  }, [versionId, isAuthenticated, isEditor, authLoading, router])

  const loadSupportPage = async () => {
    try {
      const { data, error } = await supabase
        .from('product_support_pages')
        .select('*')
        .eq('id', versionId)
        .single()

      if (error) throw error
      if (!data) {
        toast.error('Página não encontrada')
        router.push('/dashboard/suporte')
        return
      }

      setSupportPage(data as ProductSupportPage)
      const content = (data.content as any) || {}
      setSections(content.sections || [])
    } catch (error: any) {
      console.error('Erro ao carregar página:', error)
      toast.error('Erro ao carregar página')
      router.push('/dashboard/suporte')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const content = {
        sections: sections,
      }

      const { error } = await supabase
        .from('product_support_pages')
        .update({
          content: content,
        })
        .eq('id', versionId)

      if (error) throw error
      toast.success('Página salva com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar página:', error)
      toast.error('Erro ao salvar página')
    } finally {
      setSaving(false)
    }
  }

  const addSection = (type: SupportSection['type']) => {
    const newSection: SupportSection = {
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
    setSections([...sections, newSection])
    setEditingSectionIndex(sections.length)
  }

  const updateSection = (index: number, updates: Partial<SupportSection>) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], ...updates }
    setSections(updated)
  }

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
    if (editingSectionIndex === index) {
      setEditingSectionIndex(null)
    }
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return
    
    const updated = [...sections]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    setSections(updated)
    toast.success('Seção movida!')
  }

  const addItemToSection = (sectionIndex: number) => {
    const updated = [...sections]
    if (!updated[sectionIndex].items) {
      updated[sectionIndex].items = []
    }
    updated[sectionIndex].items!.push({ title: '', description: '' })
    setSections(updated)
  }

  const updateItemInSection = (sectionIndex: number, itemIndex: number, updates: any) => {
    const updated = [...sections]
    if (!updated[sectionIndex].items) return
    
    const items = [...updated[sectionIndex].items!]
    items[itemIndex] = { ...items[itemIndex], ...updates }
    updated[sectionIndex].items = items
    setSections(updated)
  }

  const removeItemFromSection = (sectionIndex: number, itemIndex: number) => {
    const updated = [...sections]
    if (!updated[sectionIndex].items) return
    
    updated[sectionIndex].items = updated[sectionIndex].items!.filter((_, i) => i !== itemIndex)
    setSections(updated)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!supportPage) {
    return null
  }

  const SectionEditor = ({ section, index }: { section: SupportSection; index: number }) => {
    const isExpanded = editingSectionIndex === index
    
    return (
      <motion.div className="border rounded-xl overflow-hidden mb-4">
        <div className="bg-gray-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <GripVertical size={18} className="text-gray-400 cursor-move" />
            <span className="font-semibold text-sm">
              {index + 1}. {section.type === 'hero' ? 'Hero' : 
                section.type === 'feature-card' ? 'Feature Card' :
                section.type === 'steps' ? 'Steps' :
                section.type === 'accordion' ? 'FAQ/Accordion' :
                section.type === 'text' ? 'Texto' :
                section.type === 'image' ? 'Imagem' :
                section.type === 'video' ? 'Vídeo' :
                section.type === 'list' ? 'Lista' : section.type}
            </span>
            {section.title && (
              <span className="text-xs text-gray-500">- {section.title}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveSection(index, 'up')}
              disabled={index === 0}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
              title="Mover para cima"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => moveSection(index, 'down')}
              disabled={index === sections.length - 1}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
              title="Mover para baixo"
            >
              <ChevronDown size={16} />
            </button>
            <button
              onClick={() => setEditingSectionIndex(isExpanded ? null : index)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              onClick={() => removeSection(index)}
              className="p-1 hover:bg-red-100 rounded text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 space-y-4"
          >
            {/* Tipo de seção */}
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Seção</label>
              <select
                value={section.type}
                onChange={(e) => updateSection(index, { type: e.target.value as SupportSection['type'] })}
                className="w-full border rounded-lg px-4 py-2.5"
              >
                <option value="hero">Hero</option>
                <option value="feature-card">Feature Card</option>
                <option value="steps">Steps (Passos)</option>
                <option value="text">Texto</option>
                <option value="image">Imagem</option>
                <option value="video">Vídeo</option>
                <option value="list">Lista</option>
                <option value="accordion">FAQ/Accordion</option>
              </select>
            </div>

            {/* Campos comuns */}
            <Input
              label="Título"
              value={section.title || ''}
              onChange={(e) => updateSection(index, { title: e.target.value })}
            />

            {(section.type === 'hero' || section.type === 'feature-card' || section.type === 'steps') && (
              <Input
                label="Subtítulo"
                value={section.subtitle || ''}
                onChange={(e) => updateSection(index, { subtitle: e.target.value })}
              />
            )}

            {/* Campos específicos por tipo */}
            {(section.type === 'text' || section.type === 'feature-card') && (
              <div>
                <label className="block text-sm font-medium mb-2">Conteúdo</label>
                <textarea
                  value={section.content || ''}
                  onChange={(e) => updateSection(index, { content: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5"
                  rows={4}
                  placeholder="Digite o conteúdo..."
                />
              </div>
            )}

            {(section.type === 'hero' || section.type === 'image' || section.type === 'feature-card') && (
              <Input
                label="URL da Imagem"
                value={section.image || ''}
                onChange={(e) => updateSection(index, { image: e.target.value })}
                placeholder="https://..."
              />
            )}

            {section.type === 'video' && (
              <Input
                label="URL do Vídeo (YouTube, Vimeo)"
                value={section.video || ''}
                onChange={(e) => updateSection(index, { video: e.target.value })}
                placeholder="https://..."
              />
            )}

            {section.type === 'feature-card' && (
              <>
                <Input
                  label="URL do Link"
                  value={section.link || ''}
                  onChange={(e) => updateSection(index, { link: e.target.value })}
                  placeholder="https://..."
                />
                <Input
                  label="Texto do Link"
                  value={section.linkText || ''}
                  onChange={(e) => updateSection(index, { linkText: e.target.value })}
                  placeholder="Saiba mais"
                />
              </>
            )}

            {/* Itens para list, accordion, steps */}
            {(section.type === 'list' || section.type === 'accordion' || section.type === 'steps') && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium">Itens ({section.items?.length || 0})</label>
                  <button
                    onClick={() => addItemToSection(index)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Adicionar Item
                  </button>
                </div>
                <div className="space-y-3">
                  {(section.items || []).map((item, itemIndex) => (
                    <div key={itemIndex} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-gray-500">Item {itemIndex + 1}</span>
                        <button
                          onClick={() => removeItemFromSection(index, itemIndex)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          label="Título"
                          value={item.title}
                          onChange={(e) => updateItemInSection(index, itemIndex, { title: e.target.value })}
                        />
                        <div>
                          <label className="block text-sm font-medium mb-1">Descrição</label>
                          <textarea
                            value={item.description}
                            onChange={(e) => updateItemInSection(index, itemIndex, { description: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            rows={2}
                          />
                        </div>
                        {section.type === 'steps' && (
                          <Input
                            label="URL da Imagem (opcional)"
                            value={item.image || ''}
                            onChange={(e) => updateItemInSection(index, itemIndex, { image: e.target.value })}
                            placeholder="https://..."
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                href="/dashboard/suporte"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Editar: {supportPage.title}</h1>
                <p className="text-sm text-gray-500">Manual Apple Guide /suporte/{supportPage.model_slug}</p>
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
                href={`/suporte/${supportPage.model_slug}`}
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Seções do Manual</h2>
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

              {sections.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Adicione seções para criar o conteúdo do manual</p>
                </div>
              ) : (
                <div>
                  {sections.map((section, index) => (
                    <SectionEditor key={section.id || index} section={section} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Dicas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Dicas
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong className="text-gray-900">Hero:</strong> Seção principal com título, subtítulo e busca
                </div>
                <div>
                  <strong className="text-gray-900">Feature Card:</strong> Cards com imagem alternando lados
                </div>
                <div>
                  <strong className="text-gray-900">Steps:</strong> Lista de passos com imagens
                </div>
                <div>
                  <strong className="text-gray-900">FAQ:</strong> Perguntas frequentes expansíveis
                </div>
                <div className="pt-3 border-t">
                  <strong className="text-gray-900">💡 Dica:</strong> Use as setas ↑↓ para reordenar as seções
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EditSupportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    }>
      <EditSupportContent />
    </Suspense>
  )
}


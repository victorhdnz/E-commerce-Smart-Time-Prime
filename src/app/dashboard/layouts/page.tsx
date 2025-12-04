'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { LandingLayout, LandingVersion } from '@/types'
import { Plus, Edit, Trash2, Eye, Palette, Link2, Check, ArrowLeft, Layers, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const AVAILABLE_FONTS = [
  'Inter',
  'Roboto',
  'Poppins',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Raleway',
  'Playfair Display',
  'Merriweather',
  'Oswald',
  'Source Sans Pro',
  'Nunito',
  'Ubuntu',
  'DM Sans',
  'Space Grotesk',
  'Sora',
  'Outfit',
  'Plus Jakarta Sans',
]

export default function DashboardLayoutsPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [layouts, setLayouts] = useState<LandingLayout[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLayout, setSelectedLayout] = useState<LandingLayout | null>(null)
  const [versions, setVersions] = useState<LandingVersion[]>([])
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false)
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false)
  const [editingVersion, setEditingVersion] = useState<LandingVersion | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [layoutName, setLayoutName] = useState('')
  const [layoutDescription, setLayoutDescription] = useState('')
  const supabase = createClient()

  const [versionFormData, setVersionFormData] = useState({
    name: '',
    slug: '',
    description: '',
    custom_styles: {
      fonts: { heading: '', body: '', button: '' },
      colors: {
        primary: '',
        secondary: '',
        accent: '',
        background: '',
        text: '',
        button: '',
        buttonText: '',
      },
    },
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !isEditor) {
      router.push('/dashboard')
      return
    }

    loadLayouts()
  }, [isAuthenticated, isEditor, authLoading, router])

  useEffect(() => {
    if (selectedLayout) {
      loadVersions(selectedLayout.id)
    }
  }, [selectedLayout])

  const loadLayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_layouts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) throw error
      setLayouts(data || [])
      
      // Selecionar o primeiro layout automaticamente
      if (data && data.length > 0 && !selectedLayout) {
        setSelectedLayout(data[0])
      }
    } catch (error: any) {
      console.error('Erro ao carregar layouts:', error)
      toast.error('Erro ao carregar layouts')
    } finally {
      setLoading(false)
    }
  }

  const loadVersions = async (layoutId: string) => {
    try {
      const { data, error } = await supabase
        .from('landing_versions')
        .select('*')
        .eq('layout_id', layoutId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVersions(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar versões:', error)
    }
  }

  const handleSaveVersion = async () => {
    if (!selectedLayout || !versionFormData.name || !versionFormData.slug) {
      toast.error('Preencha nome e slug')
      return
    }

    try {
      const versionData = {
        layout_id: selectedLayout.id,
        name: versionFormData.name,
        slug: versionFormData.slug.toLowerCase().replace(/\s+/g, '-'),
        description: versionFormData.description || null,
        custom_styles: versionFormData.custom_styles,
        sections_config: {},
        is_active: true,
      }

      if (editingVersion) {
        const { error } = await supabase
          .from('landing_versions')
          .update(versionData)
          .eq('id', editingVersion.id)

        if (error) throw error
        toast.success('Versão atualizada!')
      } else {
        const { error } = await supabase
          .from('landing_versions')
          .insert(versionData)

        if (error) throw error
        toast.success('Versão criada!')
      }

      setIsVersionModalOpen(false)
      setEditingVersion(null)
      resetVersionForm()
      loadVersions(selectedLayout.id)
    } catch (error: any) {
      console.error('Erro ao salvar versão:', error)
      toast.error(error.message || 'Erro ao salvar versão')
    }
  }

  const handleDeleteVersion = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta versão?')) return

    try {
      const { error } = await supabase
        .from('landing_versions')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Versão excluída!')
      if (selectedLayout) {
        loadVersions(selectedLayout.id)
      }
    } catch (error: any) {
      console.error('Erro ao excluir versão:', error)
      toast.error('Erro ao excluir versão')
    }
  }

  const resetVersionForm = () => {
    setVersionFormData({
      name: '',
      slug: '',
      description: '',
      custom_styles: {
        fonts: { heading: '', body: '', button: '' },
        colors: { primary: '', secondary: '', accent: '', background: '', text: '', button: '', buttonText: '' },
      },
    })
  }

  const openLayoutModal = () => {
    if (selectedLayout) {
      setLayoutName(selectedLayout.name)
      setLayoutDescription(selectedLayout.description || '')
      setIsLayoutModalOpen(true)
    }
  }

  const handleSaveLayout = async () => {
    if (!selectedLayout || !layoutName.trim()) {
      toast.error('Nome do layout é obrigatório')
      return
    }

    try {
      const { error } = await supabase
        .from('landing_layouts')
        .update({
          name: layoutName.trim(),
          description: layoutDescription.trim() || null,
        })
        .eq('id', selectedLayout.id)

      if (error) throw error

      toast.success('Layout atualizado!')
      setIsLayoutModalOpen(false)
      
      // Atualizar a lista de layouts
      const updatedLayouts = layouts.map(l => 
        l.id === selectedLayout.id 
          ? { ...l, name: layoutName.trim(), description: layoutDescription.trim() || null }
          : l
      )
      setLayouts(updatedLayouts)
      setSelectedLayout({ ...selectedLayout, name: layoutName.trim(), description: layoutDescription.trim() || null })
    } catch (error: any) {
      console.error('Erro ao atualizar layout:', error)
      toast.error('Erro ao atualizar layout')
    }
  }

  const copyToClipboard = async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(linkId)
      toast.success('Link copiado!')
      setTimeout(() => setCopiedLink(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar link')
    }
  }

  const getVersionUrl = (version: LandingVersion) => {
    if (!selectedLayout) return ''
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/lp/${selectedLayout.slug}/${version.slug}`
  }

  const getLayoutUrl = () => {
    if (!selectedLayout) return ''
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/lp/${selectedLayout.slug}`
  }

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
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Landing Pages</h1>
              <p className="text-gray-600">Gerencie versões e campanhas para cada layout</p>
            </div>
          </div>
        </div>

        {layouts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Layers size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum layout disponível</h3>
            <p className="text-gray-500">Execute o script SQL para criar os layouts padrão.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Sidebar - Lista de Layouts */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="font-semibold text-gray-900">Layouts Disponíveis</h2>
                  <p className="text-xs text-gray-500 mt-1">Selecione para gerenciar versões</p>
                </div>
                <div className="divide-y">
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => setSelectedLayout(layout)}
                      className={`w-full p-4 text-left transition-colors ${
                        selectedLayout?.id === layout.id
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedLayout?.id === layout.id ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                          <Palette size={20} className={selectedLayout?.id === layout.id ? 'text-white' : 'text-gray-600'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{layout.name}</h3>
                          <p className={`text-sm truncate ${
                            selectedLayout?.id === layout.id ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            /lp/{layout.slug}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info sobre layouts */}
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Layouts são templates fixos criados por desenvolvedores. 
                  Você pode criar múltiplas versões (campanhas) de cada layout.
                </p>
              </div>
            </div>

            {/* Main Content - Versões */}
            <div className="lg:col-span-8 xl:col-span-9">
              {selectedLayout ? (
                <div className="space-y-6">
                  {/* Layout Info Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedLayout.name}</h2>
                        {selectedLayout.description && (
                          <p className="text-gray-600 mt-1">{selectedLayout.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-4">
                          <span className="text-sm text-gray-500">URL base:</span>
                          <Link
                            href={`/lp/${selectedLayout.slug}`}
                            target="_blank"
                            className="text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors text-blue-600 hover:underline"
                          >
                            /lp/{selectedLayout.slug}
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={openLayoutModal}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit size={16} />
                          Renomear
                        </button>
                        <Link
                          href={`/lp/${selectedLayout.slug}`}
                          target="_blank"
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye size={16} />
                          Visualizar
                        </Link>
                      </div>
                    </div>

                    {/* Cores do Layout */}
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Cores do tema</h3>
                      <div className="flex gap-3">
                        {Object.entries((selectedLayout.theme_colors as any) || {}).slice(0, 5).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full border border-gray-200"
                              style={{ backgroundColor: value as string }}
                            />
                            <span className="text-xs text-gray-500 capitalize">{key}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Versões */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Versões / Campanhas</h3>
                        <p className="text-sm text-gray-500">{versions.length} versão(ões) criada(s)</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingVersion(null)
                          resetVersionForm()
                          setIsVersionModalOpen(true)
                        }}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Nova Versão
                      </button>
                    </div>

                    {versions.length === 0 ? (
                      <div className="p-12 text-center">
                        <Layers size={48} className="mx-auto text-gray-300 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma versão criada</h4>
                        <p className="text-gray-500 mb-6">Crie sua primeira versão para começar a personalizar</p>
                        <button
                          onClick={() => {
                            setEditingVersion(null)
                            resetVersionForm()
                            setIsVersionModalOpen(true)
                          }}
                          className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 inline-flex items-center gap-2"
                        >
                          <Plus size={18} />
                          Criar Versão
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {versions.map((version) => {
                          const versionUrl = getVersionUrl(version)
                          const linkId = `version-${version.id}`

                          return (
                            <div key={version.id} className="p-4 hover:bg-gray-50">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900">{version.name}</h4>
                                  <p className="text-sm text-gray-500 truncate">/lp/{selectedLayout.slug}/{version.slug}</p>
                                  {version.description && (
                                    <p className="text-sm text-gray-600 mt-1">{version.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/lp/${selectedLayout.slug}/${version.slug}`}
                                    target="_blank"
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Visualizar"
                                  >
                                    <Eye size={16} />
                                  </Link>
                                  <button
                                    onClick={() => copyToClipboard(versionUrl, linkId)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Copiar link"
                                  >
                                    {copiedLink === linkId ? (
                                      <Check size={16} className="text-green-600" />
                                    ) : (
                                      <Link2 size={16} />
                                    )}
                                  </button>
                                  <Link
                                    href={`/dashboard/landing?layout=${selectedLayout.id}&version=${version.id}`}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Editar conteúdo"
                                  >
                                    <Settings size={16} />
                                  </Link>
                                  <button
                                    onClick={() => {
                                      setEditingVersion(version)
                                      setVersionFormData({
                                        name: version.name,
                                        slug: version.slug,
                                        description: version.description || '',
                                        custom_styles: (version.custom_styles as any) || {
                                          fonts: { heading: '', body: '', button: '' },
                                          colors: { primary: '', secondary: '', accent: '', background: '', text: '', button: '', buttonText: '' },
                                        },
                                      })
                                      setIsVersionModalOpen(true)
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Editar versão"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVersion(version.id)}
                                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <ArrowLeft size={48} className="mx-auto text-gray-300 mb-4 rotate-180" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecione um layout</h3>
                  <p className="text-gray-500">Escolha um layout na lista ao lado para gerenciar suas versões</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de Versão - Apenas para criar/editar nome */}
        {isVersionModalOpen && selectedLayout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">
                  {editingVersion ? 'Renomear Versão' : 'Nova Versão'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Layout: {selectedLayout.name}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Versão *</label>
                  <input
                    type="text"
                    value={versionFormData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                      setVersionFormData({ ...versionFormData, name, slug: editingVersion ? versionFormData.slug : slug })
                    }}
                    className="w-full border rounded-lg px-4 py-2.5"
                    placeholder="Ex: Campanha Black Friday"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                  <input
                    type="text"
                    value={versionFormData.slug}
                    onChange={(e) => setVersionFormData({ ...versionFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                    className="w-full border rounded-lg px-4 py-2.5"
                    placeholder="campanha-black-friday"
                    disabled={!!editingVersion}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /lp/{selectedLayout.slug}/{versionFormData.slug || 'slug'}
                  </p>
                  {editingVersion && (
                    <p className="text-xs text-amber-600 mt-1">O slug não pode ser alterado após criação</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
                  <textarea
                    value={versionFormData.description}
                    onChange={(e) => setVersionFormData({ ...versionFormData, description: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 resize-none"
                    rows={2}
                    placeholder="Breve descrição da versão..."
                  />
                </div>

                {!editingVersion && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    <strong>Dica:</strong> Após criar, clique no ícone de engrenagem para editar o conteúdo completo (textos, cores, fontes, imagens, etc.)
                  </div>
                )}
              </div>
              <div className="p-6 border-t flex justify-end gap-4">
                <button
                  onClick={() => {
                    setIsVersionModalOpen(false)
                    setEditingVersion(null)
                    resetVersionForm()
                  }}
                  className="px-6 py-2.5 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveVersion}
                  className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  {editingVersion ? 'Salvar' : 'Criar Versão'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição do Layout */}
        {isLayoutModalOpen && selectedLayout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Renomear Layout</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Altere o nome e descrição do layout
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Layout *</label>
                  <input
                    type="text"
                    value={layoutName}
                    onChange={(e) => setLayoutName(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5"
                    placeholder="Nome do layout"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={layoutDescription}
                    onChange={(e) => setLayoutDescription(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 resize-none"
                    rows={3}
                    placeholder="Descrição opcional do layout"
                  />
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <strong>Slug:</strong> /lp/{selectedLayout.slug}
                  <br />
                  <span className="text-xs">O slug não pode ser alterado pois afetaria URLs existentes</span>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-4">
                <button
                  onClick={() => setIsLayoutModalOpen(false)}
                  className="px-6 py-2.5 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveLayout}
                  className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800"
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

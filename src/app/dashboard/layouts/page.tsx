'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { LandingLayout, LandingVersion } from '@/types'
import { Plus, Edit, Trash2, Eye, Palette, Link2, Check, ArrowLeft, Layers, Settings, Copy } from 'lucide-react'
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
  const [editingVersion, setEditingVersion] = useState<LandingVersion | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
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
        is_default: versions.length === 0, // Primeira versão é default
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

  const handleSetDefault = async (versionId: string) => {
    if (!selectedLayout) return

    try {
      // Remover default de todas as versões do layout
      await supabase
        .from('landing_versions')
        .update({ is_default: false })
        .eq('layout_id', selectedLayout.id)

      // Definir nova versão como default
      const { error } = await supabase
        .from('landing_versions')
        .update({ is_default: true })
        .eq('id', versionId)

      if (error) throw error
      toast.success('Versão definida como padrão!')
      loadVersions(selectedLayout.id)
    } catch (error: any) {
      console.error('Erro ao definir versão padrão:', error)
      toast.error('Erro ao definir versão padrão')
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
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">URL base:</span>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">/lp/{selectedLayout.slug}</code>
                          </div>
                          <button
                            onClick={() => copyToClipboard(getLayoutUrl(), 'layout')}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {copiedLink === 'layout' ? <Check size={14} /> : <Copy size={14} />}
                            Copiar
                          </button>
                        </div>
                      </div>
                      <Link
                        href={`/lp/${selectedLayout.slug}`}
                        target="_blank"
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye size={16} />
                        Visualizar
                      </Link>
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
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-900">{version.name}</h4>
                                    {version.is_default && (
                                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                        Padrão
                                      </span>
                                    )}
                                  </div>
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
                                  {!version.is_default && (
                                    <>
                                      <button
                                        onClick={() => handleSetDefault(version.id)}
                                        className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                                        title="Definir como padrão"
                                      >
                                        <Check size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteVersion(version.id)}
                                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                        title="Excluir"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </>
                                  )}
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

        {/* Modal de Versão */}
        {isVersionModalOpen && selectedLayout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold">
                  {editingVersion ? 'Editar Versão' : 'Nova Versão'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Layout: {selectedLayout.name}
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome da Versão *</label>
                    <input
                      type="text"
                      value={versionFormData.name}
                      onChange={(e) => setVersionFormData({ ...versionFormData, name: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="Ex: Campanha Black Friday"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <input
                      type="text"
                      value={versionFormData.slug}
                      onChange={(e) => setVersionFormData({ ...versionFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="black-friday"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL: /lp/{selectedLayout.slug}/{versionFormData.slug || 'slug'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={versionFormData.description}
                    onChange={(e) => setVersionFormData({ ...versionFormData, description: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5"
                    rows={2}
                    placeholder="Descrição opcional..."
                  />
                </div>

                {/* Cores Customizadas */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-2">Cores Customizadas</h3>
                  <p className="text-sm text-gray-500 mb-4">Deixe vazio para usar as cores do layout</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['primary', 'accent', 'background', 'text'].map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={(versionFormData.custom_styles.colors as any)[key] || '#000000'}
                            onChange={(e) => setVersionFormData({
                              ...versionFormData,
                              custom_styles: {
                                ...versionFormData.custom_styles,
                                colors: { ...versionFormData.custom_styles.colors, [key]: e.target.value }
                              }
                            })}
                            className="w-10 h-10 border rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={(versionFormData.custom_styles.colors as any)[key] || ''}
                            onChange={(e) => setVersionFormData({
                              ...versionFormData,
                              custom_styles: {
                                ...versionFormData.custom_styles,
                                colors: { ...versionFormData.custom_styles.colors, [key]: e.target.value }
                              }
                            })}
                            className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono"
                            placeholder="Padrão"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fontes Customizadas */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-2">Fontes Customizadas</h3>
                  <p className="text-sm text-gray-500 mb-4">Deixe vazio para usar as fontes do layout</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {['heading', 'body', 'button'].map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
                        <select
                          value={(versionFormData.custom_styles.fonts as any)[key] || ''}
                          onChange={(e) => setVersionFormData({
                            ...versionFormData,
                            custom_styles: {
                              ...versionFormData.custom_styles,
                              fonts: { ...versionFormData.custom_styles.fonts, [key]: e.target.value }
                            }
                          })}
                          className="w-full border rounded-lg px-4 py-2.5"
                        >
                          <option value="">Usar padrão do layout</option>
                          {AVAILABLE_FONTS.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-4 sticky bottom-0 bg-white">
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

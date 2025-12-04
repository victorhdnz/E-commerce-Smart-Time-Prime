'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { LandingLayout, LandingVersion } from '@/types'
import { Plus, Edit, Copy, Trash2, Eye, Settings, Palette, Type, Link2, Check } from 'lucide-react'
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
]

export default function AdminLayoutsPage() {
  const router = useRouter()
  const { isAuthenticated, profile, loading: authLoading } = useAuth()
  const [layouts, setLayouts] = useState<LandingLayout[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false)
  const [editingLayout, setEditingLayout] = useState<LandingLayout | null>(null)
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null)
  const [versions, setVersions] = useState<LandingVersion[]>([])
  const [editingVersion, setEditingVersion] = useState<LandingVersion | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    custom_url: '',
    theme_colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#FFD700',
      background: '#ffffff',
      text: '#000000',
      button: '#000000',
      buttonText: '#ffffff',
    },
    default_fonts: {
      heading: 'Inter',
      body: 'Inter',
      button: 'Inter',
    },
  })

  const [versionFormData, setVersionFormData] = useState({
    name: '',
    slug: '',
    description: '',
    custom_styles: {
      fonts: {
        heading: '',
        body: '',
        button: '',
      },
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
    sections_config: {},
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || (profile?.role !== 'admin' && profile?.role !== 'editor')) {
      router.push('/')
      return
    }

    loadLayouts()
  }, [isAuthenticated, profile, authLoading, router])

  useEffect(() => {
    if (selectedLayout) {
      loadVersions(selectedLayout)
    }
  }, [selectedLayout])

  const loadLayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_layouts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLayouts(data || [])
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

  const handleSaveLayout = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast.error('Preencha nome e slug')
        return
      }

      const layoutData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        custom_url: formData.custom_url || null,
        theme_colors: formData.theme_colors,
        default_fonts: formData.default_fonts,
        is_active: true,
      }

      if (editingLayout) {
        const { error } = await supabase
          .from('landing_layouts')
          .update(layoutData)
          .eq('id', editingLayout.id)

        if (error) throw error
        toast.success('Layout atualizado!')
      } else {
        const { error } = await supabase
          .from('landing_layouts')
          .insert(layoutData)

        if (error) throw error
        toast.success('Layout criado!')
      }

      setIsModalOpen(false)
      setEditingLayout(null)
      resetForm()
      loadLayouts()
    } catch (error: any) {
      console.error('Erro ao salvar layout:', error)
      toast.error(error.message || 'Erro ao salvar layout')
    }
  }

  const handleSaveVersion = async () => {
    if (!selectedLayout || !versionFormData.name || !versionFormData.slug) {
      toast.error('Preencha nome e slug')
      return
    }

    try {
      const versionData = {
        layout_id: selectedLayout,
        name: versionFormData.name,
        slug: versionFormData.slug,
        description: versionFormData.description || null,
        custom_styles: versionFormData.custom_styles,
        sections_config: versionFormData.sections_config,
        is_active: true,
        is_default: false,
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
      loadVersions(selectedLayout)
    } catch (error: any) {
      console.error('Erro ao salvar versão:', error)
      toast.error(error.message || 'Erro ao salvar versão')
    }
  }

  const handleDeleteLayout = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este layout?')) return

    try {
      const { error } = await supabase
        .from('landing_layouts')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Layout excluído!')
      loadLayouts()
    } catch (error: any) {
      console.error('Erro ao excluir layout:', error)
      toast.error('Erro ao excluir layout')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      custom_url: '',
      theme_colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#FFD700',
        background: '#ffffff',
        text: '#000000',
        button: '#000000',
        buttonText: '#ffffff',
      },
      default_fonts: {
        heading: 'Inter',
        body: 'Inter',
        button: 'Inter',
      },
    })
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
      sections_config: {},
    })
  }

  const copyToClipboard = async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(linkId)
      toast.success('Link copiado!')
      setTimeout(() => setCopiedLink(null), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
      toast.error('Erro ao copiar link')
    }
  }

  const getLayoutUrl = (layout: LandingLayout) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/lp/${layout.slug}`
  }

  const getVersionUrl = (layout: LandingLayout, version: LandingVersion) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/lp/${layout.slug}/${version.slug}`
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
            <h1 className="text-3xl font-bold mb-2">Gerenciar Layouts</h1>
            <p className="text-gray-600">Crie e gerencie layouts de landing pages</p>
          </div>
          <button
            onClick={() => {
              setEditingLayout(null)
              resetForm()
              setIsModalOpen(true)
            }}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Layout
          </button>
        </div>

        {/* Lista de Layouts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {layouts.map(layout => (
            <div key={layout.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{layout.name}</h3>
                  <p className="text-sm text-gray-500">/{layout.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/lp/${layout.slug}`}
                    target="_blank"
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Visualizar"
                  >
                    <Eye size={18} />
                  </Link>
                  <button
                    onClick={() => copyToClipboard(getLayoutUrl(layout), `layout-${layout.id}`)}
                    className="p-2 hover:bg-gray-100 rounded relative"
                    title="Copiar link"
                  >
                    {copiedLink === `layout-${layout.id}` ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Link2 size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingLayout(layout)
                      setFormData({
                        name: layout.name,
                        slug: layout.slug,
                        description: layout.description || '',
                        custom_url: layout.custom_url || '',
                        theme_colors: (layout.theme_colors as any) || formData.theme_colors,
                        default_fonts: (layout.default_fonts as any) || formData.default_fonts,
                      })
                      setIsModalOpen(true)
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLayout(layout.id)
                      setIsVersionModalOpen(true)
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Criar versão"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteLayout(layout.id)}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedLayout(layout.id)
                    loadVersions(layout.id)
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver versões ({versions.filter(v => v.layout_id === layout.id).length})
                </button>
                <p className="text-xs text-gray-400 truncate max-w-[200px]">
                  {getLayoutUrl(layout).replace(/^https?:\/\//, '')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Versões do Layout Selecionado */}
        {selectedLayout && versions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Versões</h2>
              <button
                onClick={() => {
                  setEditingVersion(null)
                  resetVersionForm()
                  setIsVersionModalOpen(true)
                }}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus size={18} />
                Nova Versão
              </button>
            </div>
            <div className="space-y-2">
              {versions.map(version => {
                const layout = layouts.find(l => l.id === selectedLayout)
                if (!layout) return null
                const versionUrl = getVersionUrl(layout, version)
                const linkId = `version-${version.id}`
                
                return (
                  <div key={version.id} className="flex justify-between items-center p-3 border rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{version.name}</p>
                      <p className="text-sm text-gray-500 truncate">/{version.slug}</p>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {versionUrl.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        href={`/lp/${layout.slug}/${version.slug}`}
                        target="_blank"
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => copyToClipboard(versionUrl, linkId)}
                        className="p-2 hover:bg-gray-100 rounded relative"
                        title="Copiar link"
                      >
                        {copiedLink === linkId ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Link2 size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingVersion(version)
                          setVersionFormData({
                            name: version.name,
                            slug: version.slug,
                            description: version.description || '',
                            custom_styles: (version.custom_styles as any) || versionFormData.custom_styles,
                            sections_config: (version.sections_config as any) || {},
                          })
                          setIsVersionModalOpen(true)
                        }}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Modal de Layout */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">
                  {editingLayout ? 'Editar Layout' : 'Novo Layout'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="Ex: Campanha Black Friday"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="campanha-black-friday"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL: /lp/{formData.slug || 'slug'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL Customizada (opcional)</label>
                  <input
                    type="text"
                    value={formData.custom_url}
                    onChange={(e) => setFormData({ ...formData, custom_url: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="/lp/campanha-especial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    rows={3}
                  />
                </div>

                {/* Cores do Tema */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Palette size={20} />
                    Cores do Tema
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            className="w-12 h-10 border rounded"
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
                </div>

                {/* Fontes Padrão */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Type size={20} />
                    Fontes Padrão
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(formData.default_fonts).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
                        <select
                          value={value}
                          onChange={(e) => setFormData({
                            ...formData,
                            default_fonts: { ...formData.default_fonts, [key]: e.target.value }
                          })}
                          className="w-full border rounded-lg px-4 py-2"
                        >
                          {AVAILABLE_FONTS.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingLayout(null)
                    resetForm()
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveLayout}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Versão */}
        {isVersionModalOpen && selectedLayout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">
                  {editingVersion ? 'Editar Versão' : 'Nova Versão'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <input
                    type="text"
                    value={versionFormData.name}
                    onChange={(e) => setVersionFormData({ ...versionFormData, name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="Ex: Versão A - Teste 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <input
                    type="text"
                    value={versionFormData.slug}
                    onChange={(e) => setVersionFormData({ ...versionFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="versao-a-teste-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /lp/{layouts.find(l => l.id === selectedLayout)?.slug}/{versionFormData.slug || 'slug'}
                  </p>
                </div>

                {/* Cores Customizadas */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Cores Customizadas (opcional)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(versionFormData.custom_styles.colors).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={value || '#000000'}
                            onChange={(e) => setVersionFormData({
                              ...versionFormData,
                              custom_styles: {
                                ...versionFormData.custom_styles,
                                colors: { ...versionFormData.custom_styles.colors, [key]: e.target.value }
                              }
                            })}
                            className="w-12 h-10 border rounded"
                          />
                          <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => setVersionFormData({
                              ...versionFormData,
                              custom_styles: {
                                ...versionFormData.custom_styles,
                                colors: { ...versionFormData.custom_styles.colors, [key]: e.target.value }
                              }
                            })}
                            className="flex-1 border rounded-lg px-3 py-2 text-sm"
                            placeholder="Deixe vazio para usar padrão"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fontes Customizadas */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Fontes Customizadas (opcional)</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(versionFormData.custom_styles.fonts).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
                        <select
                          value={value || ''}
                          onChange={(e) => setVersionFormData({
                            ...versionFormData,
                            custom_styles: {
                              ...versionFormData.custom_styles,
                              fonts: { ...versionFormData.custom_styles.fonts, [key]: e.target.value }
                            }
                          })}
                          className="w-full border rounded-lg px-4 py-2"
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
              <div className="p-6 border-t flex justify-end gap-4">
                <button
                  onClick={() => {
                    setIsVersionModalOpen(false)
                    setEditingVersion(null)
                    resetVersionForm()
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveVersion}
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


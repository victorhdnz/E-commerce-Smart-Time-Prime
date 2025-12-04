'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { LandingLayout, LandingVersion } from '@/types'
import { Plus, Edit, Copy, Trash2, Eye, Palette, Type, Link2, Check, ArrowLeft, Home } from 'lucide-react'
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
  'Bebas Neue',
  'DM Sans',
  'Space Grotesk',
  'Archivo',
  'Sora',
  'Outfit',
  'Plus Jakarta Sans',
]

export default function DashboardLayoutsPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
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

    if (!isAuthenticated || !isEditor) {
      router.push('/dashboard')
      return
    }

    loadLayouts()
  }, [isAuthenticated, isEditor, authLoading, router])

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
    if (!confirm('Tem certeza que deseja excluir este layout? Todas as versões também serão excluídas.')) return

    try {
      const { error } = await supabase
        .from('landing_layouts')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Layout excluído!')
      setSelectedLayout(null)
      setVersions([])
      loadLayouts()
    } catch (error: any) {
      console.error('Erro ao excluir layout:', error)
      toast.error('Erro ao excluir layout')
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
        loadVersions(selectedLayout)
      }
    } catch (error: any) {
      console.error('Erro ao excluir versão:', error)
      toast.error('Erro ao excluir versão')
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
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Layouts</h1>
              <p className="text-gray-600">Crie e gerencie layouts e versões de landing pages</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingLayout(null)
                resetForm()
                setIsModalOpen(true)
              }}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Novo Layout
            </button>
          </div>
        </div>

        {/* Lista de Layouts */}
        {layouts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum layout criado</h3>
            <p className="text-gray-500 mb-6">Crie seu primeiro layout de landing page para começar</p>
            <button
              onClick={() => {
                setEditingLayout(null)
                resetForm()
                setIsModalOpen(true)
              }}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Criar Layout
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Layouts */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Layouts ({layouts.length})</h2>
              {layouts.map(layout => (
                <div
                  key={layout.id}
                  className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer transition-all ${
                    selectedLayout === layout.id ? 'border-black ring-1 ring-black' : 'border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => setSelectedLayout(layout.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{layout.name}</h3>
                      <p className="text-sm text-gray-500">/lp/{layout.slug}</p>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        href={`/lp/${layout.slug}`}
                        target="_blank"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Visualizar"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(getLayoutUrl(layout), `layout-${layout.id}`)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copiar link"
                      >
                        {copiedLink === `layout-${layout.id}` ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Link2 size={16} />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
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
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLayout(layout.id)
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {layout.description && (
                    <p className="text-sm text-gray-600 mb-3">{layout.description}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: (layout.theme_colors as any)?.primary || '#000' }}
                      />
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: (layout.theme_colors as any)?.accent || '#FFD700' }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {(layout.default_fonts as any)?.heading || 'Inter'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Versões */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Versões {selectedLayout && `(${versions.length})`}
                </h2>
                {selectedLayout && (
                  <button
                    onClick={() => {
                      setEditingVersion(null)
                      resetVersionForm()
                      setIsVersionModalOpen(true)
                    }}
                    className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Nova Versão
                  </button>
                )}
              </div>

              {!selectedLayout ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <p className="text-gray-500">Selecione um layout para ver as versões</p>
                </div>
              ) : versions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <p className="text-gray-500 mb-4">Nenhuma versão criada para este layout</p>
                  <button
                    onClick={() => {
                      setEditingVersion(null)
                      resetVersionForm()
                      setIsVersionModalOpen(true)
                    }}
                    className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Criar Versão
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map(version => {
                    const layout = layouts.find(l => l.id === selectedLayout)
                    if (!layout) return null
                    const versionUrl = getVersionUrl(layout, version)
                    const linkId = `version-${version.id}`

                    return (
                      <div key={version.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900">{version.name}</h4>
                            <p className="text-sm text-gray-500 truncate">/lp/{layout.slug}/{version.slug}</p>
                            {version.is_default && (
                              <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Padrão
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Link
                              href={`/lp/${layout.slug}/${version.slug}`}
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
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar"
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
        )}

        {/* Modal de Layout */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold">
                  {editingLayout ? 'Editar Layout' : 'Novo Layout'}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="Ex: Campanha Black Friday"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="black-friday"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL: /lp/{formData.slug || 'slug'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5"
                    rows={2}
                    placeholder="Descrição do layout..."
                  />
                </div>

                {/* Cores do Tema */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Palette size={20} />
                    Cores do Tema
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(formData.theme_colors).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-2 capitalize">
                          {key === 'buttonText' ? 'Texto Botão' : key}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => setFormData({
                              ...formData,
                              theme_colors: { ...formData.theme_colors, [key]: e.target.value }
                            })}
                            className="w-12 h-10 border rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => setFormData({
                              ...formData,
                              theme_colors: { ...formData.theme_colors, [key]: e.target.value }
                            })}
                            className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fontes Padrão */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Type size={20} />
                    Fontes
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
                          className="w-full border rounded-lg px-4 py-2.5"
                        >
                          {AVAILABLE_FONTS.map(font => (
                            <option key={font} value={font} style={{ fontFamily: font }}>
                              {font}
                            </option>
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
                    setIsModalOpen(false)
                    setEditingLayout(null)
                    resetForm()
                  }}
                  className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveLayout}
                  className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
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
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold">
                  {editingVersion ? 'Editar Versão' : 'Nova Versão'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Layout: {layouts.find(l => l.id === selectedLayout)?.name}
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome *</label>
                    <input
                      type="text"
                      value={versionFormData.name}
                      onChange={(e) => setVersionFormData({ ...versionFormData, name: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="Ex: Versão A - Teste 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <input
                      type="text"
                      value={versionFormData.slug}
                      onChange={(e) => setVersionFormData({ ...versionFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full border rounded-lg px-4 py-2.5"
                      placeholder="versao-a"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL: /lp/{layouts.find(l => l.id === selectedLayout)?.slug}/{versionFormData.slug || 'slug'}
                    </p>
                  </div>
                </div>

                {/* Cores Customizadas */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-2">Cores Customizadas</h3>
                  <p className="text-sm text-gray-500 mb-4">Deixe vazio para usar as cores do layout</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(versionFormData.custom_styles.colors).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-2 capitalize">
                          {key === 'buttonText' ? 'Texto Botão' : key}
                        </label>
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
                            className="w-12 h-10 border rounded cursor-pointer"
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
                            className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono"
                            placeholder="Usar padrão"
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
                          className="w-full border rounded-lg px-4 py-2.5"
                        >
                          <option value="">Usar padrão do layout</option>
                          {AVAILABLE_FONTS.map(font => (
                            <option key={font} value={font} style={{ fontFamily: font }}>
                              {font}
                            </option>
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
                  className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveVersion}
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

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { SeasonalLayout } from '@/types'
import { Plus, Edit, Copy, Trash2, Calendar, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDateTime } from '@/lib/utils/format'

export default function DashboardLayoutsPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [layouts, setLayouts] = useState<SeasonalLayout[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLayout, setEditingLayout] = useState<SeasonalLayout | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scheduled_start: '',
    scheduled_end: '',
    hero_title: '',
    hero_subtitle: '',
    hero_cta_text: '',
    hero_bg_color: '#000000',
    hero_text_color: '#FFFFFF',
    timer_title: 'Oferta por Tempo Limitado!',
    timer_end_date: '',
    timer_bg_color: '#000000',
    timer_text_color: '#FFFFFF',
    theme_colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#FFD700',
      background: '#ffffff',
    },
  })

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isEditor)) {
      router.push('/')
    } else if (isAuthenticated && isEditor) {
      loadLayouts()
    }
  }, [isAuthenticated, isEditor, authLoading])

  const loadLayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('seasonal_layouts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLayouts(data as SeasonalLayout[])
    } catch (error) {
      toast.error('Erro ao carregar layouts')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (layout?: any) => {
    if (layout) {
      setEditingLayout(layout)
      const timerEndDate = layout.timer_end_date 
        ? new Date(layout.timer_end_date).toISOString().slice(0, 16)
        : ''
      
      setFormData({
        name: layout.name || '',
        description: layout.description || '',
        scheduled_start: layout.scheduled_start ? new Date(layout.scheduled_start).toISOString().slice(0, 16) : '',
        scheduled_end: layout.scheduled_end ? new Date(layout.scheduled_end).toISOString().slice(0, 16) : '',
        hero_title: layout.hero_title || '',
        hero_subtitle: layout.hero_subtitle || '',
        hero_cta_text: layout.hero_cta_text || '',
        hero_bg_color: layout.hero_bg_color || '#000000',
        hero_text_color: layout.hero_text_color || '#FFFFFF',
        timer_title: layout.timer_title || 'Oferta por Tempo Limitado!',
        timer_end_date: timerEndDate,
        timer_bg_color: layout.timer_bg_color || '#000000',
        timer_text_color: layout.timer_text_color || '#FFFFFF',
        theme_colors: (layout.theme_colors as any) || {
          primary: '#000000',
          secondary: '#ffffff',
          accent: '#FFD700',
          background: '#ffffff',
        },
      })
    } else {
      setEditingLayout(null)
      setFormData({
        name: '',
        description: '',
        scheduled_start: '',
        scheduled_end: '',
        hero_title: '',
        hero_subtitle: '',
        hero_cta_text: '',
        hero_bg_color: '#000000',
        hero_text_color: '#FFFFFF',
        timer_title: 'Oferta por Tempo Limitado!',
        timer_end_date: '',
        timer_bg_color: '#000000',
        timer_text_color: '#FFFFFF',
        theme_colors: {
          primary: '#000000',
          secondary: '#ffffff',
          accent: '#FFD700',
          background: '#ffffff',
        },
      })
    }
    setIsModalOpen(true)
  }

  const handleSaveLayout = async () => {
    if (!formData.name) {
      toast.error('Preencha o nome do layout')
      return
    }

    try {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')

      const layoutData: any = {
        ...formData,
        slug,
        scheduled_start: formData.scheduled_start || null,
        scheduled_end: formData.scheduled_end || null,
        timer_end_date: formData.timer_end_date || null,
      }

      if (editingLayout) {
        const { error } = await supabase
          .from('seasonal_layouts')
          .update(layoutData)
          .eq('id', editingLayout.id)

        if (error) throw error
        toast.success('Layout atualizado')
      } else {
        const { error } = await supabase
          .from('seasonal_layouts')
          .insert(layoutData)

        if (error) throw error
        toast.success('Layout criado')
      }

      setIsModalOpen(false)
      loadLayouts()
    } catch (error) {
      toast.error('Erro ao salvar layout')
    }
  }

  const toggleLayoutStatus = async (layoutId: string, currentStatus: boolean) => {
    try {
      // Se ativar este layout, aplicar as configurações ao site
      if (!currentStatus) {
        // Buscar dados do layout
        const { data: layout } = await supabase
          .from('seasonal_layouts')
          .select('*')
          .eq('id', layoutId)
          .single()

        if (layout) {
          // Atualizar site_settings com dados do layout
          const { data: existing } = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', 'general')
            .maybeSingle()

          const currentSettings = existing?.value || {}
          
          const newSettings = {
            ...currentSettings,
            hero_title: layout.hero_title || currentSettings.hero_title,
            hero_subtitle: layout.hero_subtitle || currentSettings.hero_subtitle,
            hero_cta_text: layout.hero_cta_text || currentSettings.hero_cta_text,
            hero_bg_color: layout.hero_bg_color || currentSettings.hero_bg_color,
            hero_text_color: layout.hero_text_color || currentSettings.hero_text_color,
            timer_title: layout.timer_title || currentSettings.timer_title,
            timer_end_date: layout.timer_end_date || currentSettings.timer_end_date,
            timer_bg_color: layout.timer_bg_color || currentSettings.timer_bg_color,
            timer_text_color: layout.timer_text_color || currentSettings.timer_text_color,
            // Aplicar cores do tema também
            site_theme_colors: layout.theme_colors || currentSettings.site_theme_colors,
          }

          if (existing) {
            await supabase
              .from('site_settings')
              .update({
                value: newSettings,
                updated_at: new Date().toISOString(),
              })
              .eq('key', 'general')
          }
        }

        // Desativar todos os outros layouts
        await supabase
          .from('seasonal_layouts')
          .update({ is_active: false })
          .neq('id', layoutId)
      }

      // Ativar/desativar o layout selecionado
      const { error } = await supabase
        .from('seasonal_layouts')
        .update({ is_active: !currentStatus })
        .eq('id', layoutId)

      if (error) throw error
      
      toast.success(!currentStatus ? 'Layout ativado e aplicado ao site!' : 'Layout desativado')
      loadLayouts()
    } catch (error) {
      console.error('Erro ao atualizar layout:', error)
      toast.error('Erro ao atualizar layout')
    }
  }

  const duplicateLayout = async (layout: SeasonalLayout) => {
    try {
      const { error } = await supabase.from('seasonal_layouts').insert({
        name: `${layout.name} (Cópia)`,
        slug: `${layout.slug}-copia-${Date.now()}`,
        description: layout.description,
        theme_colors: layout.theme_colors,
        is_active: false,
      })

      if (error) throw error
      toast.success('Layout duplicado')
      loadLayouts()
    } catch (error) {
      toast.error('Erro ao duplicar layout')
    }
  }

  const deleteLayout = async (layoutId: string) => {
    if (!confirm('Tem certeza que deseja excluir este layout?')) return

    try {
      const { error } = await supabase
        .from('seasonal_layouts')
        .delete()
        .eq('id', layoutId)

      if (error) throw error
      toast.success('Layout excluído')
      loadLayouts()
    } catch (error) {
      toast.error('Erro ao excluir layout')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Layouts Sazonais</h1>
            <p className="text-gray-600">
              Gerencie temas para datas especiais (Black Friday, Natal, etc.)
            </p>
          </div>
          <Button size="lg" onClick={() => handleOpenModal()}>
            <Plus size={20} className="mr-2" />
            Novo Layout
          </Button>
        </div>

        {/* Layouts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layouts.map((layout) => (
            <div
              key={layout.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                layout.is_active ? 'ring-4 ring-accent' : ''
              }`}
            >
              {/* Preview */}
              <div
                className="h-32 p-6 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${
                    (layout.theme_colors as any)?.primary || '#000'
                  }, ${(layout.theme_colors as any)?.accent || '#FFD700'})`,
                }}
              >
                <h3
                  className="text-2xl font-bold text-center"
                  style={{
                    color: (layout.theme_colors as any)?.secondary || '#fff',
                  }}
                >
                  {layout.name}
                </h3>
              </div>

              {/* Info */}
              <div className="p-6">
                {layout.is_active && (
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-accent text-black text-sm font-semibold rounded-full">
                      Layout Ativo
                    </span>
                  </div>
                )}

                {layout.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {layout.description}
                  </p>
                )}

                {(layout.scheduled_start || layout.scheduled_end) && (
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex items-center mb-1">
                      <Calendar size={14} className="mr-2" />
                      <span>Agendamento:</span>
                    </div>
                    {layout.scheduled_start && (
                      <div>Início: {formatDateTime(layout.scheduled_start)}</div>
                    )}
                    {layout.scheduled_end && (
                      <div>Fim: {formatDateTime(layout.scheduled_end)}</div>
                    )}
                  </div>
                )}

                {/* Colors */}
                <div className="flex gap-2 mb-4">
                  {Object.entries(layout.theme_colors as any).map(
                    ([key, color]) => (
                      <div
                        key={key}
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color as string }}
                        title={key}
                      />
                    )
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleLayoutStatus(layout.id, layout.is_active)}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                      layout.is_active
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {layout.is_active ? (
                      <>
                        <EyeOff size={16} className="inline mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Eye size={16} className="inline mr-2" />
                        Ativar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenModal(layout)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => duplicateLayout(layout)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => deleteLayout(layout.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {layouts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-semibold mb-2">
              Nenhum layout cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Crie layouts temáticos para campanhas especiais
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus size={20} className="mr-2" />
              Criar Layout
            </Button>
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingLayout ? 'Editar Layout' : 'Novo Layout'}
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Nome do Layout"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Black Friday 2025"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição opcional..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Hero Section</h3>
              <Input
                label="Título do Hero"
                value={formData.hero_title}
                onChange={(e) =>
                  setFormData({ ...formData, hero_title: e.target.value })
                }
                placeholder="Ex: Black Friday - 70% OFF"
              />
              <Input
                label="Subtítulo do Hero"
                value={formData.hero_subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, hero_subtitle: e.target.value })
                }
                placeholder="Ex: As maiores ofertas do ano"
              />
              <Input
                label="Texto do Botão CTA"
                value={formData.hero_cta_text}
                onChange={(e) =>
                  setFormData({ ...formData, hero_cta_text: e.target.value })
                }
                placeholder="Ex: Aproveitar Ofertas"
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Cor de Fundo
                  </label>
                  <input
                    type="color"
                    value={formData.hero_bg_color}
                    onChange={(e) =>
                      setFormData({ ...formData, hero_bg_color: e.target.value })
                    }
                    className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Cor do Texto
                  </label>
                  <input
                    type="color"
                    value={formData.hero_text_color}
                    onChange={(e) =>
                      setFormData({ ...formData, hero_text_color: e.target.value })
                    }
                    className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Timer (Cronômetro)</h3>
              <Input
                label="Título do Timer"
                value={formData.timer_title}
                onChange={(e) =>
                  setFormData({ ...formData, timer_title: e.target.value })
                }
                placeholder="Ex: ⚡ Black Friday - Tempo Limitado!"
              />
              <Input
                label="Data de Término do Timer"
                type="datetime-local"
                value={formData.timer_end_date}
                onChange={(e) =>
                  setFormData({ ...formData, timer_end_date: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Cor de Fundo do Timer
                  </label>
                  <input
                    type="color"
                    value={formData.timer_bg_color}
                    onChange={(e) =>
                      setFormData({ ...formData, timer_bg_color: e.target.value })
                    }
                    className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Cor do Texto do Timer
                  </label>
                  <input
                    type="color"
                    value={formData.timer_text_color}
                    onChange={(e) =>
                      setFormData({ ...formData, timer_text_color: e.target.value })
                    }
                    className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <Input
                label="Data de Início"
                type="datetime-local"
                value={formData.scheduled_start}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_start: e.target.value })
                }
              />

              <Input
                label="Data de Término"
                type="datetime-local"
                value={formData.scheduled_end}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_end: e.target.value })
                }
              />
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cores do Tema (Geral)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(formData.theme_colors).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-600 mb-1 capitalize">
                      {key}
                    </label>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme_colors: {
                            ...formData.theme_colors,
                            [key]: e.target.value,
                          },
                        })
                      }
                      className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveLayout} className="flex-1">
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}


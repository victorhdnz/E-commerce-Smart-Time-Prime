'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { VideoUploader } from '@/components/ui/VideoUploader'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import Link from 'next/link'
import { BackButton } from '@/components/ui/BackButton'
import { createClient } from '@/lib/supabase/client'
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation'

interface LandingSettings {
  hero_title: string
  hero_subtitle: string
  hero_cta_text: string
  about_title: string
  about_description: string
  about_image: string
  contact_title: string
  contact_description: string
  showcase_image_1: string
  showcase_image_2: string
  showcase_image_3: string
  showcase_image_4: string
  showcase_video_url: string
  timer_title: string
  timer_end_date: string
  timer_bg_color: string
  timer_text_color: string
  theme_colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
}

export default function EditLandingPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<LandingSettings>({
    hero_title: '',
    hero_subtitle: '',
    hero_cta_text: '',
    about_title: '',
    about_description: '',
    about_image: '',
    contact_title: '',
    contact_description: '',
    showcase_image_1: '',
    showcase_image_2: '',
    showcase_image_3: '',
    showcase_image_4: '',
    showcase_video_url: '',
    timer_title: '⚡ Black Friday - Tempo Limitado!',
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

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !isEditor) {
      router.push('/')
      return
    }

    loadSettings()
  }, [isAuthenticated, isEditor, authLoading])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'general')
        .maybeSingle()

      if (error) throw error

      if (data?.value) {
        const savedSettings = data.value as any
        // Usar valores padrão apenas se não houver no banco
        setSettings({
          hero_title: savedSettings.hero_title || 'Elegância e Precisão em Cada Instante',
          hero_subtitle: savedSettings.hero_subtitle || 'Descubra nossa coleção exclusiva de relógios premium',
          hero_cta_text: savedSettings.hero_cta_text || 'Ver Coleção',
          about_title: savedSettings.about_title || 'Sobre a Smart Time Prime',
          about_description: savedSettings.about_description || 'Somos uma loja especializada em relógios premium e produtos de qualidade. Nossa missão é oferecer produtos exclusivos com design moderno e elegante.',
          about_image: savedSettings.about_image || '',
          contact_title: savedSettings.contact_title || 'Entre em Contato',
          contact_description: savedSettings.contact_description || 'Estamos aqui para ajudar você!',
          // Imagens: usar o que está salvo no banco (pode ser string vazia)
          showcase_image_1: savedSettings.showcase_image_1 || '',
          showcase_image_2: savedSettings.showcase_image_2 || '',
          showcase_image_3: savedSettings.showcase_image_3 || '',
          showcase_image_4: savedSettings.showcase_image_4 || '',
          showcase_video_url: savedSettings.showcase_video_url || '',
          timer_title: savedSettings.timer_title || '⚡ Black Friday - Tempo Limitado!',
          timer_end_date: savedSettings.timer_end_date 
            ? new Date(savedSettings.timer_end_date).toISOString().slice(0, 16)
            : '',
          timer_bg_color: savedSettings.timer_bg_color || '#000000',
          timer_text_color: savedSettings.timer_text_color || '#FFFFFF',
          theme_colors: savedSettings.theme_colors || {
            primary: '#000000',
            secondary: '#666666',
            accent: '#FFD700',
            background: '#FFFFFF'
          }
        })
      } else {
        // Se não há dados no banco, usar padrões
        setSettings({
          hero_title: 'Elegância e Precisão em Cada Instante',
          hero_subtitle: 'Descubra nossa coleção exclusiva de relógios premium',
          hero_cta_text: 'Ver Coleção',
          about_title: 'Sobre a Smart Time Prime',
          about_description: 'Somos uma loja especializada em relógios premium e produtos de qualidade. Nossa missão é oferecer produtos exclusivos com design moderno e elegante.',
          about_image: '',
          contact_title: 'Entre em Contato',
          contact_description: 'Estamos aqui para ajudar você!',
          showcase_image_1: '',
          showcase_image_2: '',
          showcase_image_3: '',
          showcase_image_4: '',
          showcase_video_url: '',
          timer_title: '⚡ Black Friday - Tempo Limitado!',
          timer_end_date: '',
          timer_bg_color: '#000000',
          timer_text_color: '#FFFFFF',
          theme_colors: {
            primary: '#000000',
            secondary: '#666666',
            accent: '#FFD700',
            background: '#FFFFFF'
          }
        })
      }

    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Primeiro, verificar se existe
      const { data: existing, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'general')
        .maybeSingle()

      // Preparar configurações para salvar (converter timer_end_date para ISO string)
      // O input datetime-local retorna formato "YYYY-MM-DDTHH:mm" que precisa ser convertido
      let timerEndDateISO: string | null = null
      if (settings.timer_end_date) {
        try {
          // Se já está no formato ISO, usar diretamente
          if (settings.timer_end_date.includes('T') && settings.timer_end_date.includes('Z')) {
            timerEndDateISO = settings.timer_end_date
          } else {
            // Converter do formato datetime-local para ISO
            // datetime-local retorna "YYYY-MM-DDTHH:mm" sem timezone
            // Precisamos adicionar timezone ou assumir UTC
            const date = new Date(settings.timer_end_date)
            if (!isNaN(date.getTime())) {
              timerEndDateISO = date.toISOString()
            } else {
              console.error('Data inválida:', settings.timer_end_date)
              toast.error('Data de término do cronômetro inválida')
              setSaving(false)
              return
            }
          }
        } catch (error) {
          console.error('Erro ao converter data:', error)
          toast.error('Erro ao converter data do cronômetro')
          setSaving(false)
          return
        }
      }

      const settingsToSave = {
        ...settings,
        timer_end_date: timerEndDateISO,
      }

      if (existing) {
        // Atualizar existente
        const { error } = await supabase
          .from('site_settings')
          .update({
            value: settingsToSave,
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'general')

        if (error) throw error
      } else {
        // Inserir novo
        const { error } = await supabase
          .from('site_settings')
          .insert({
            key: 'general',
            value: settingsToSave,
            description: 'Configurações gerais do site',
          })

        if (error) throw error
      }

      toast.success('Configurações salvas! Recarregue a página inicial para ver as mudanças.')
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error)
      toast.error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`)
    } finally {
      setSaving(false)
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
        {/* Navigation */}
        <DashboardNavigation
          title="Editar Landing Page"
          subtitle="Personalize os textos da página inicial"
          backUrl="/dashboard"
          backLabel="Voltar ao Dashboard"
          actions={
            <Button onClick={handleSave} isLoading={saving}>
              <Save size={18} className="mr-2" />
              Salvar Alterações
            </Button>
          }
        />

        {/* Form */}
        <div className="max-w-4xl space-y-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Seção Principal (Hero)</h2>
            
            <div className="space-y-4">
              <Input
                label="Título Principal"
                value={settings.hero_title}
                onChange={(e) =>
                  setSettings({ ...settings, hero_title: e.target.value })
                }
                placeholder="Título que aparece em destaque"
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Subtítulo
                </label>
                <textarea
                  value={settings.hero_subtitle}
                  onChange={(e) =>
                    setSettings({ ...settings, hero_subtitle: e.target.value })
                  }
                  placeholder="Descrição ou subtítulo"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <Input
                label="Texto do Botão"
                value={settings.hero_cta_text}
                onChange={(e) =>
                  setSettings({ ...settings, hero_cta_text: e.target.value })
                }
                placeholder="Ex: Ver Coleção"
              />
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Seção Sobre</h2>
            
            <div className="space-y-4">
              <Input
                label="Título da Seção"
                value={settings.about_title}
                onChange={(e) =>
                  setSettings({ ...settings, about_title: e.target.value })
                }
                placeholder="Ex: Sobre a Smart Time Prime"
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição
                </label>
                <textarea
                  value={settings.about_description}
                  onChange={(e) =>
                    setSettings({ ...settings, about_description: e.target.value })
                  }
                  placeholder="Conte sobre sua empresa"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Imagem da Seção Sobre */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imagem da Seção (opcional)
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (Formato Instagram Post: 1080x1080px)
                  </span>
                </label>
                <ImageUploader
                  value={settings.about_image}
                  onChange={(url) => setSettings({ ...settings, about_image: url })}
                />
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Seção de Contato</h2>
            
            <div className="space-y-4">
              <Input
                label="Título da Seção"
                value={settings.contact_title}
                onChange={(e) =>
                  setSettings({ ...settings, contact_title: e.target.value })
                }
                placeholder="Ex: Entre em Contato"
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição
                </label>
                <textarea
                  value={settings.contact_description}
                  onChange={(e) =>
                    setSettings({ ...settings, contact_description: e.target.value })
                  }
                  placeholder="Mensagem de contato"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </motion.div>

          {/* Timer Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Cronômetro (Timer)</h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure o cronômetro de contagem regressiva que aparece na página inicial.
            </p>
            
            <div className="space-y-6">
              {/* Título do Timer */}
              <div>
                <Input
                  label="Título do Timer"
                  value={settings.timer_title}
                  onChange={(e) =>
                    setSettings({ ...settings, timer_title: e.target.value })
                  }
                  placeholder="Ex: ⚡ Black Friday - Tempo Limitado!"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este texto aparecerá acima do cronômetro
                </p>
              </div>

              {/* Data de Término */}
              <div>
                <Input
                  label="Data e Hora de Término"
                  type="datetime-local"
                  value={settings.timer_end_date}
                  onChange={(e) =>
                    setSettings({ ...settings, timer_end_date: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Defina quando o cronômetro deve terminar
                </p>
              </div>

              {/* Cores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor de Fundo
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.timer_bg_color}
                      onChange={(e) =>
                        setSettings({ ...settings, timer_bg_color: e.target.value })
                      }
                      className="w-20 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={settings.timer_bg_color}
                      onChange={(e) =>
                        setSettings({ ...settings, timer_bg_color: e.target.value })
                      }
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cor de fundo do cronômetro
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor do Texto
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.timer_text_color}
                      onChange={(e) =>
                        setSettings({ ...settings, timer_text_color: e.target.value })
                      }
                      className="w-20 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={settings.timer_text_color}
                      onChange={(e) =>
                        setSettings({ ...settings, timer_text_color: e.target.value })
                      }
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cor do texto e números do cronômetro
                  </p>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Media Showcase Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Galeria de Destaques</h2>
            <p className="text-sm text-gray-600 mb-6">
              📸 Envie imagens no formato Instagram Post (1080x1080px) para o carrossel + 1 vídeo vertical tipo Reels
            </p>
            
            <div className="space-y-6">
              {/* Imagem 1 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imagem 1
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (Formato Instagram Post: 1080x1080px)
                  </span>
                </label>
                <ImageUploader
                  value={settings.showcase_image_1}
                  onChange={(url) => setSettings({ ...settings, showcase_image_1: url })}
                />
              </div>

              {/* Imagem 2 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imagem 2
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (Formato Instagram Post: 1080x1080px)
                  </span>
                </label>
                <ImageUploader
                  value={settings.showcase_image_2}
                  onChange={(url) => setSettings({ ...settings, showcase_image_2: url })}
                />
              </div>

              {/* Imagem 3 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imagem 3
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (Formato Instagram Post: 1080x1080px)
                  </span>
                </label>
                <ImageUploader
                  value={settings.showcase_image_3}
                  onChange={(url) => setSettings({ ...settings, showcase_image_3: url })}
                />
              </div>

              {/* Imagem 4 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imagem 4
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (Formato Instagram Post: 1080x1080px)
                  </span>
                </label>
                <ImageUploader
                  value={settings.showcase_image_4}
                  onChange={(url) => setSettings({ ...settings, showcase_image_4: url })}
                />
              </div>

              {/* Vídeo */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium mb-2">
                  Vídeo Vertical (Reels/Stories)
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (Formato Instagram Reels: 1080x1920px, até 50MB)
                  </span>
                </label>
                <VideoUploader
                  value={settings.showcase_video_url}
                  onChange={(url) => setSettings({ ...settings, showcase_video_url: url })}
                  showMediaManager={false}
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}


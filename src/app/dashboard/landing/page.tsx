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
import { Save, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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
        .select('*')
        .eq('key', 'general')
        .limit(1)
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


      if (existing) {
        // Atualizar existente
        const { error } = await supabase
          .from('site_settings')
          .update({
            value: settings,
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
            value: settings,
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
            <div className="flex gap-3">
              <Link href="/" target="_blank">
                <Button variant="outline">
                  <Eye size={18} className="mr-2" />
                  Visualizar
                </Button>
              </Link>
              <Button onClick={handleSave} isLoading={saving}>
                <Save size={18} className="mr-2" />
                Salvar Alterações
              </Button>
            </div>
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
                  currentImage={settings.about_image}
                  onImageUploaded={(url) => setSettings({ ...settings, about_image: url })}
                  folder="banners/about"
                  aspectRatio={1}
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

          {/* Theme Colors Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Personalização de Cores</h2>
            <p className="text-sm text-gray-600 mb-6">
              Personalize as cores do seu site. Use o layout padrão (preto e branco) ou crie sua própria paleta.
            </p>
            
            <div className="space-y-6">
              {/* Botão para resetar para padrão */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Cores do Tema</h3>
                <Button
                  variant="outline"
                  onClick={() => setSettings({
                    ...settings,
                    theme_colors: {
                      primary: '#000000',
                      secondary: '#ffffff',
                      accent: '#FFD700',
                      background: '#ffffff',
                    }
                  })}
                >
                  Restaurar Padrão
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cor Primária */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cor Primária
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      (Botões, links, destaques)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.theme_colors.primary}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme_colors: {
                          ...settings.theme_colors,
                          primary: e.target.value
                        }
                      })}
                      className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={settings.theme_colors.primary}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme_colors: {
                          ...settings.theme_colors,
                          primary: e.target.value
                        }
                      })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Cor Secundária */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cor Secundária
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      (Textos, bordas)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.theme_colors.secondary}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme_colors: {
                          ...settings.theme_colors,
                          secondary: e.target.value
                        }
                      })}
                      className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={settings.theme_colors.secondary}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme_colors: {
                          ...settings.theme_colors,
                          secondary: e.target.value
                        }
                      })}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Cor de Destaque */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cor de Destaque
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      (Promoções, ofertas especiais)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.theme_colors.accent}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme_colors: {
                          ...settings.theme_colors,
                          accent: e.target.value
                        }
                      })}
                      className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={settings.theme_colors.accent}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme_colors: {
                          ...settings.theme_colors,
                          accent: e.target.value
                        }
                      })}
                      placeholder="#FFD700"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Cor de Fundo */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cor de Fundo
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      (Fundo principal do site)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.theme_colors.background}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme_colors: {
                          ...settings.theme_colors,
                          background: e.target.value
                        }
                      })}
                      className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={settings.theme_colors.background}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme_colors: {
                          ...settings.theme_colors,
                          background: e.target.value
                        }
                      })}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Preview das cores */}
              <div className="mt-6 p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-3">Preview das Cores</h4>
                <div className="flex gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: settings.theme_colors.primary }}
                    title="Primária"
                  ></div>
                  <div 
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: settings.theme_colors.secondary }}
                    title="Secundária"
                  ></div>
                  <div 
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: settings.theme_colors.accent }}
                    title="Destaque"
                  ></div>
                  <div 
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: settings.theme_colors.background }}
                    title="Fundo"
                  ></div>
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
                  currentImage={settings.showcase_image_1}
                  onImageUploaded={(url) => setSettings({ ...settings, showcase_image_1: url })}
                  folder="banners/showcase"
                  aspectRatio={1}
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
                  currentImage={settings.showcase_image_2}
                  onImageUploaded={(url) => setSettings({ ...settings, showcase_image_2: url })}
                  folder="banners/showcase"
                  aspectRatio={1}
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
                  currentImage={settings.showcase_image_3}
                  onImageUploaded={(url) => setSettings({ ...settings, showcase_image_3: url })}
                  folder="banners/showcase"
                  aspectRatio={1}
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
                  currentImage={settings.showcase_image_4}
                  onImageUploaded={(url) => setSettings({ ...settings, showcase_image_4: url })}
                  folder="banners/showcase"
                  aspectRatio={1}
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
                  currentVideo={settings.showcase_video_url}
                  onVideoUploaded={(url) => setSettings({ ...settings, showcase_video_url: url })}
                  folder="banners/videos"
                  maxSizeMB={50}
                />
              </div>
            </div>
          </motion.div>

          {/* Save Button (Mobile) */}
          <div className="lg:hidden">
            <Button onClick={handleSave} isLoading={saving} className="w-full" size="lg">
              <Save size={18} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { VideoUploader } from '@/components/ui/VideoUploader'
import { ArrayImageManager } from '@/components/ui/ArrayImageManager'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Save, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { BackButton } from '@/components/ui/BackButton'
import { createClient } from '@/lib/supabase/client'
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation'

interface LandingSettings {
  // Hero Section (expandido)
  hero_title: string
  hero_subtitle: string
  hero_badge_text: string
  hero_cta_text: string
  hero_cta_link: string
  hero_bg_color: string
  hero_text_color: string
  hero_images: string[]
  hero_banner: string
  hero_banners: string[] // Array de banners para carrossel
  
  // Timer Section
  timer_title: string
  timer_end_date: string
  timer_bg_color: string
  timer_text_color: string
  
  // Fixed Timer
  fixed_timer_bg_color: string
  fixed_timer_text_color: string
  
  // Exit Popup
  exit_popup_title: string
  exit_popup_message: string
  exit_popup_button_text: string
  exit_popup_whatsapp_number: string
  
  // Media Showcase (expandido)
  media_showcase_title: string
  media_showcase_features: Array<{icon: string, text: string}>
  showcase_images: string[] // Array de imagens
  showcase_image_1: string // Mantido para compatibilidade
  showcase_image_2: string
  showcase_image_3: string
  showcase_image_4: string
  showcase_video_url: string
  
  // Value Package
  value_package_title: string
  value_package_image: string
  value_package_items: Array<{name: string, price: string}>
  value_package_total_price: string
  value_package_sale_price: string
  value_package_delivery_text: string
  value_package_button_text: string
  value_package_whatsapp_group_link: string
  value_package_whatsapp_number: string
  value_package_stock_text: string
  value_package_discount_text: string
  value_package_promotion_text: string
  
  // Story Section
  story_title: string
  story_content: string
  story_image: string
  story_founders_names: string
  
  // About Us Section
  about_us_title: string
  about_us_description: string
  about_us_store_image: string
  about_us_founders_image: string
  about_us_founders_names: string
  about_us_location: string
  
  // Social Proof
  social_proof_title: string
  social_proof_google_icon: boolean
  social_proof_allow_photos: boolean
  social_proof_testimonial_count: string
  
  // Contact Section
  contact_title: string
  contact_description: string
  
  // About antigo (compatibilidade)
  about_title: string
  about_description: string
  about_image: string
  
  // Theme Colors (manter por enquanto)
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
    // Hero
    hero_title: '',
    hero_subtitle: '',
    hero_badge_text: '',
    hero_cta_text: '',
    hero_cta_link: '',
    hero_bg_color: '#000000',
    hero_text_color: '#FFFFFF',
    hero_images: [],
    hero_banner: '',
    hero_banners: [],
    // Timer
    timer_title: '⚡ Black Friday - Tempo Limitado!',
    timer_end_date: '',
    timer_bg_color: '#000000',
    timer_text_color: '#FFFFFF',
    // Fixed Timer
    fixed_timer_bg_color: '#000000',
    fixed_timer_text_color: '#FFFFFF',
    // Exit Popup
    exit_popup_title: '⚠️ Espere!',
    exit_popup_message: 'Ainda dá tempo de garantir seu Smartwatch Série 11 com 4 brindes grátis.',
    exit_popup_button_text: '💬 FALAR AGORA NO WHATSAPP',
    exit_popup_whatsapp_number: '5534984136291',
    // Media Showcase
    media_showcase_title: '💡 TECNOLOGIA, ESTILO E PRATICIDADE — TUDO NO SEU PULSO',
    media_showcase_features: [
      { icon: '📱', text: 'Responda mensagens e chamadas direto do relógio' },
      { icon: '❤️', text: 'Monitore batimentos, sono e pressão arterial' },
      { icon: '🔋', text: 'Bateria que dura até 5 dias' },
      { icon: '💧', text: 'Resistente à água e suor' },
      { icon: '🎨', text: 'Troque pulseiras em segundos' },
      { icon: '📲', text: 'Compatível com Android e iPhone' },
    ],
    showcase_images: [],
    showcase_image_1: '', // Mantido para compatibilidade
    showcase_image_2: '',
    showcase_image_3: '',
    showcase_image_4: '',
    showcase_video_url: '',
    // Value Package
    value_package_title: '🎁 VOCÊ LEVA TUDO ISSO',
    value_package_image: '',
    value_package_items: [
      { name: 'Smartwatch Série 11', price: '' },
      { name: '2 Pulseiras extras', price: 'R$ 79' },
      { name: '1 Case protetor', price: 'R$ 39' },
      { name: '1 Película premium', price: 'R$ 29' },
    ],
    value_package_total_price: 'R$ 447',
    value_package_sale_price: 'R$ 299',
    value_package_delivery_text: '📍 Entrega em até 24h para Uberlândia',
    value_package_button_text: '💬 GARANTIR MEU DESCONTO AGORA!',
    value_package_whatsapp_group_link: '',
    value_package_whatsapp_number: '5534984136291',
    value_package_stock_text: '📦 Estoque limitado',
    value_package_discount_text: '🎯 De R$ 499 → por R$ 299 + 4 brindes grátis!',
    value_package_promotion_text: '🕒 Promoção válida enquanto durar o estoque.',
    // Story
    story_title: '✍️ NOSSA HISTÓRIA',
    story_content: 'A Smart Time Prime nasceu em Uberlândia com o propósito de unir estilo e tecnologia no dia a dia das pessoas.\n\nHoje somos uma das lojas mais lembradas quando o assunto é smartwatch e confiança.',
    story_image: '',
    story_founders_names: 'Guilherme e Letícia',
    // About Us
    about_us_title: '🏪 SOBRE A SMART TIME PRIME',
    about_us_description: 'A Smart Time Prime é uma loja de tecnologia localizada em Uberlândia/MG, dentro do Shopping Planalto.\n\nSomos referência em smartwatches e acessórios tecnológicos, com atendimento humano, entrega rápida e garantia total.',
    about_us_store_image: '',
    about_us_founders_image: '',
    about_us_founders_names: 'Guilherme e Letícia',
    about_us_location: 'Shopping Planalto, Uberlândia/MG',
    // Social Proof
    social_proof_title: '⭐ CLIENTES DE UBERLÂNDIA QUE JÁ ESTÃO USANDO',
    social_proof_google_icon: true,
    social_proof_allow_photos: true,
    social_proof_testimonial_count: '💬 Mais de 1.000 smartwatches entregues em Uberlândia.',
    // Contact
    contact_title: 'Entre em Contato',
    contact_description: 'Estamos aqui para ajudar você!',
    // About antigo
    about_title: '',
    about_description: '',
    about_image: '',
    // Theme
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
          // Hero
          hero_title: savedSettings.hero_title || '',
          hero_subtitle: savedSettings.hero_subtitle || '',
          hero_badge_text: savedSettings.hero_badge_text || '',
          hero_cta_text: savedSettings.hero_cta_text || '',
          hero_cta_link: savedSettings.hero_cta_link || '',
          hero_bg_color: savedSettings.hero_bg_color || '#000000',
          hero_text_color: savedSettings.hero_text_color || '#FFFFFF',
          hero_images: Array.isArray(savedSettings.hero_images) ? savedSettings.hero_images : [],
          hero_banner: savedSettings.hero_banner || '',
          hero_banners: Array.isArray(savedSettings.hero_banners) ? savedSettings.hero_banners : [],
          // Timer
          timer_title: savedSettings.timer_title || '⚡ Black Friday - Tempo Limitado!',
          timer_end_date: savedSettings.timer_end_date 
            ? new Date(savedSettings.timer_end_date).toISOString().slice(0, 16)
            : '',
          timer_bg_color: savedSettings.timer_bg_color || '#000000',
          timer_text_color: savedSettings.timer_text_color || '#FFFFFF',
          // Fixed Timer
          fixed_timer_bg_color: savedSettings.fixed_timer_bg_color || '#000000',
          fixed_timer_text_color: savedSettings.fixed_timer_text_color || '#FFFFFF',
          // Exit Popup
          exit_popup_title: savedSettings.exit_popup_title || '⚠️ Espere!',
          exit_popup_message: savedSettings.exit_popup_message || 'Ainda dá tempo de garantir seu Smartwatch Série 11 com 4 brindes grátis.',
          exit_popup_button_text: savedSettings.exit_popup_button_text || '💬 FALAR AGORA NO WHATSAPP',
          exit_popup_whatsapp_number: savedSettings.exit_popup_whatsapp_number || '5534984136291',
          // Media Showcase
          media_showcase_title: savedSettings.media_showcase_title || '💡 TECNOLOGIA, ESTILO E PRATICIDADE — TUDO NO SEU PULSO',
          media_showcase_features: Array.isArray(savedSettings.media_showcase_features) 
            ? savedSettings.media_showcase_features 
            : [
                { icon: '📱', text: 'Responda mensagens e chamadas direto do relógio' },
                { icon: '❤️', text: 'Monitore batimentos, sono e pressão arterial' },
                { icon: '🔋', text: 'Bateria que dura até 5 dias' },
                { icon: '💧', text: 'Resistente à água e suor' },
                { icon: '🎨', text: 'Troque pulseiras em segundos' },
                { icon: '📲', text: 'Compatível com Android e iPhone' },
              ],
          // Converter showcase_image_1-4 para showcase_images se não existir
          showcase_images: Array.isArray(savedSettings.showcase_images) && savedSettings.showcase_images.length > 0
            ? savedSettings.showcase_images 
            : [
                savedSettings.showcase_image_1 || '',
                savedSettings.showcase_image_2 || '',
                savedSettings.showcase_image_3 || '',
                savedSettings.showcase_image_4 || '',
              ].filter(Boolean), // Remove strings vazias
          showcase_image_1: savedSettings.showcase_image_1 || '',
          showcase_image_2: savedSettings.showcase_image_2 || '',
          showcase_image_3: savedSettings.showcase_image_3 || '',
          showcase_image_4: savedSettings.showcase_image_4 || '',
          showcase_video_url: savedSettings.showcase_video_url || '',
          // Value Package
          value_package_title: savedSettings.value_package_title || '🎁 VOCÊ LEVA TUDO ISSO',
          value_package_image: savedSettings.value_package_image || '',
          value_package_items: Array.isArray(savedSettings.value_package_items)
            ? savedSettings.value_package_items
            : [
                { name: 'Smartwatch Série 11', price: '' },
                { name: '2 Pulseiras extras', price: 'R$ 79' },
                { name: '1 Case protetor', price: 'R$ 39' },
                { name: '1 Película premium', price: 'R$ 29' },
              ],
          value_package_total_price: savedSettings.value_package_total_price || 'R$ 447',
          value_package_sale_price: savedSettings.value_package_sale_price || 'R$ 299',
          value_package_delivery_text: savedSettings.value_package_delivery_text || '📍 Entrega em até 24h para Uberlândia',
          value_package_button_text: savedSettings.value_package_button_text || '💬 GARANTIR MEU DESCONTO AGORA!',
          value_package_whatsapp_group_link: savedSettings.value_package_whatsapp_group_link || '',
          value_package_whatsapp_number: savedSettings.value_package_whatsapp_number || '5534984136291',
          value_package_stock_text: savedSettings.value_package_stock_text || '📦 Estoque limitado',
          value_package_discount_text: savedSettings.value_package_discount_text || '🎯 De R$ 499 → por R$ 299 + 4 brindes grátis!',
          value_package_promotion_text: savedSettings.value_package_promotion_text || '🕒 Promoção válida enquanto durar o estoque.',
          // Story
          story_title: savedSettings.story_title || '✍️ NOSSA HISTÓRIA',
          story_content: savedSettings.story_content || 'A Smart Time Prime nasceu em Uberlândia com o propósito de unir estilo e tecnologia no dia a dia das pessoas.\n\nHoje somos uma das lojas mais lembradas quando o assunto é smartwatch e confiança.',
          story_image: savedSettings.story_image || '',
          story_founders_names: savedSettings.story_founders_names || 'Guilherme e Letícia',
          // About Us
          about_us_title: savedSettings.about_us_title || '🏪 SOBRE A SMART TIME PRIME',
          about_us_description: savedSettings.about_us_description || 'A Smart Time Prime é uma loja de tecnologia localizada em Uberlândia/MG, dentro do Shopping Planalto.\n\nSomos referência em smartwatches e acessórios tecnológicos, com atendimento humano, entrega rápida e garantia total.',
          about_us_store_image: savedSettings.about_us_store_image || '',
          about_us_founders_image: savedSettings.about_us_founders_image || '',
          about_us_founders_names: savedSettings.about_us_founders_names || 'Guilherme e Letícia',
          about_us_location: savedSettings.about_us_location || 'Shopping Planalto, Uberlândia/MG',
          // Social Proof
          social_proof_title: savedSettings.social_proof_title || '⭐ CLIENTES DE UBERLÂNDIA QUE JÁ ESTÃO USANDO',
          social_proof_google_icon: savedSettings.social_proof_google_icon !== undefined ? savedSettings.social_proof_google_icon : true,
          social_proof_allow_photos: savedSettings.social_proof_allow_photos !== undefined ? savedSettings.social_proof_allow_photos : true,
          social_proof_testimonial_count: savedSettings.social_proof_testimonial_count || '💬 Mais de 1.000 smartwatches entregues em Uberlândia.',
          // Contact
          contact_title: savedSettings.contact_title || 'Entre em Contato',
          contact_description: savedSettings.contact_description || 'Estamos aqui para ajudar você!',
          // About antigo (compatibilidade)
          about_title: savedSettings.about_title || savedSettings.about_us_title || '',
          about_description: savedSettings.about_description || savedSettings.about_us_description || '',
          about_image: savedSettings.about_image || savedSettings.about_us_store_image || '',
          // Theme
          theme_colors: savedSettings.theme_colors || {
            primary: '#000000',
            secondary: '#666666',
            accent: '#FFD700',
            background: '#FFFFFF'
          }
        })
      } else {
        // Se não há dados no banco, os valores padrão já estão no useState inicial
        // Não precisa duplicar aqui
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

        {/* Logo do Site */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-2xl font-bold mb-6">Logo do Site</h2>
          <div>
            <label className="block text-sm font-medium mb-2">
              Logo da Loja
            </label>
            <p className="text-xs text-gray-500 mb-4">
              📸 Logo que aparece no lugar de "Smart Time Prime" no header. Dimensões recomendadas: 120x48px.
            </p>
            <ImageUploader
              value={(settings as any).site_logo || ''}
              onChange={(url) => {
                // Salvar logo separadamente em site_settings
                const updateLogo = async () => {
                  const supabase = createClient()
                  const { data: existing } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'general')
                    .single()

                  if (existing?.value) {
                    const currentValue = existing.value as any
                    await supabase
                      .from('site_settings')
                      .update({
                        value: { ...currentValue, site_logo: url },
                        updated_at: new Date().toISOString(),
                      })
                      .eq('key', 'general')
                  } else {
                    await supabase
                      .from('site_settings')
                      .insert({
                        key: 'general',
                        value: { site_logo: url },
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      })
                  }
                  toast.success('Logo atualizada!')
                }
                updateLogo()
              }}
              placeholder="Clique para fazer upload da logo"
            />
          </div>
        </motion.div>

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
                placeholder="🖤 SMART TIME PRIME — BLACK FRIDAY UBERLÂNDIA"
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Subtítulo (use \n para quebras de linha)
                </label>
                <textarea
                  value={settings.hero_subtitle}
                  onChange={(e) =>
                    setSettings({ ...settings, hero_subtitle: e.target.value })
                  }
                  placeholder="🚨 A BLACK FRIDAY CHEGOU!..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <Input
                label="Texto do Badge (opcional)"
                value={settings.hero_badge_text}
                onChange={(e) =>
                  setSettings({ ...settings, hero_badge_text: e.target.value })
                }
                placeholder="🚨 A BLACK FRIDAY CHEGOU!"
              />

              <Input
                label="Texto do Botão Principal"
                value={settings.hero_cta_text}
                onChange={(e) =>
                  setSettings({ ...settings, hero_cta_text: e.target.value })
                }
                placeholder="💬 QUERO MEU SÉRIE 11 AGORA!"
              />

              <Input
                label="Link do Botão (WhatsApp ou grupo)"
                value={settings.hero_cta_link}
                onChange={(e) =>
                  setSettings({ ...settings, hero_cta_link: e.target.value })
                }
                placeholder="https://wa.me/5534984136291 ou link do grupo"
              />

              {/* Banners Carrossel (1920x650) */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium mb-2">
                  Banners Carrossel (1920x650)
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  📸 Banners que aparecem acima do texto do início. Dimensões recomendadas: 1920x650px.
                  <br />• 1 banner = estático
                  <br />• Múltiplos banners = carrossel automático
                </p>
                <ArrayImageManager
                  value={settings.hero_banners || []}
                  onChange={(images: string[]) => setSettings({ ...settings, hero_banners: images })}
                  label="Banners"
                  placeholder="Clique para fazer upload de um banner (1920x650)"
                />
              </div>

              {/* Hero Images */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium mb-2">
                  Imagens de Fundo
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  📸 Faça upload das imagens diretamente (Cloudinary). Recomendado: 1080x1080px
                </p>
                <ArrayImageManager
                  value={settings.hero_images || []}
                  onChange={(images: string[]) => setSettings({ ...settings, hero_images: images })}
                  label="Imagens de Fundo"
                  maxImages={4}
                  placeholder="Clique para fazer upload de uma imagem"
                />
              </div>
            </div>
          </motion.div>

          {/* Contact Section (Footer) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Seção de Contato (Footer)</h2>
            
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
            
            <div className="space-y-4 mb-6">
              <Input
                label="Título da Seção"
                value={settings.media_showcase_title}
                onChange={(e) =>
                  setSettings({ ...settings, media_showcase_title: e.target.value })
                }
                placeholder="💡 TECNOLOGIA, ESTILO E PRATICIDADE — TUDO NO SEU PULSO"
              />

              {/* Features Editor */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recursos/Features (editar lista)
                </label>
                <div className="space-y-2">
                  {settings.media_showcase_features.map((feature, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={feature.icon}
                        onChange={(e) => {
                          const features = [...settings.media_showcase_features]
                          features[idx].icon = e.target.value
                          setSettings({ ...settings, media_showcase_features: features })
                        }}
                        placeholder="📱"
                        className="w-20"
                      />
                      <Input
                        value={feature.text}
                        onChange={(e) => {
                          const features = [...settings.media_showcase_features]
                          features[idx].text = e.target.value
                          setSettings({ ...settings, media_showcase_features: features })
                        }}
                        placeholder="Responda mensagens..."
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const features = settings.media_showcase_features.filter((_, i) => i !== idx)
                          setSettings({ ...settings, media_showcase_features: features })
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        media_showcase_features: [...settings.media_showcase_features, { icon: '', text: '' }]
                      })
                    }}
                  >
                    + Adicionar Feature
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Imagens do Carrossel */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imagens do Carrossel
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (Formato Instagram Post: 1080x1080px)
                  </span>
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  📸 Imagens que aparecem no carrossel ao lado do vídeo. Adicione quantas imagens quiser.
                </p>
                <ArrayImageManager
                  value={settings.showcase_images || []}
                  onChange={(images: string[]) => {
                    // Atualizar showcase_images e manter compatibilidade com showcase_image_1-4
                    const updatedSettings: LandingSettings = { 
                      ...settings, 
                      showcase_images: images,
                      showcase_image_1: images[0] || '',
                      showcase_image_2: images[1] || '',
                      showcase_image_3: images[2] || '',
                      showcase_image_4: images[3] || '',
                    }
                    setSettings(updatedSettings)
                  }}
                  label="Imagens do Carrossel"
                  placeholder="Clique para fazer upload de uma imagem"
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

          {/* Value Package Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Pacote de Valor</h2>
            
            <div className="space-y-4">
              <Input
                label="Título"
                value={settings.value_package_title}
                onChange={(e) =>
                  setSettings({ ...settings, value_package_title: e.target.value })
                }
                placeholder="🎁 VOCÊ LEVA TUDO ISSO"
              />

              <div>
                <label className="block text-sm font-medium mb-2">Imagem do Pacote</label>
                <ImageUploader
                  value={settings.value_package_image}
                  onChange={(url) => setSettings({ ...settings, value_package_image: url })}
                />
              </div>

              {/* Items Array */}
              <div>
                <label className="block text-sm font-medium mb-2">Itens do Pacote</label>
                <div className="space-y-2">
                  {settings.value_package_items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={item.name}
                        onChange={(e) => {
                          const items = [...settings.value_package_items]
                          items[idx].name = e.target.value
                          setSettings({ ...settings, value_package_items: items })
                        }}
                        placeholder="Nome do item"
                        className="flex-1"
                      />
                      <Input
                        value={item.price}
                        onChange={(e) => {
                          const items = [...settings.value_package_items]
                          items[idx].price = e.target.value
                          setSettings({ ...settings, value_package_items: items })
                        }}
                        placeholder="R$ 79"
                        className="w-32"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const items = settings.value_package_items.filter((_, i) => i !== idx)
                          setSettings({ ...settings, value_package_items: items })
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        value_package_items: [...settings.value_package_items, { name: '', price: '' }]
                      })
                    }}
                  >
                    + Adicionar Item
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Preço Total"
                  value={settings.value_package_total_price}
                  onChange={(e) =>
                    setSettings({ ...settings, value_package_total_price: e.target.value })
                  }
                  placeholder="R$ 447"
                />

                <Input
                  label="Preço de Venda"
                  value={settings.value_package_sale_price}
                  onChange={(e) =>
                    setSettings({ ...settings, value_package_sale_price: e.target.value })
                  }
                  placeholder="R$ 299"
                />
              </div>

              <Input
                label="Texto de Entrega"
                value={settings.value_package_delivery_text}
                onChange={(e) =>
                  setSettings({ ...settings, value_package_delivery_text: e.target.value })
                }
                placeholder="📍 Entrega em até 24h para Uberlândia"
              />

              <Input
                label="Texto do Botão"
                value={settings.value_package_button_text}
                onChange={(e) =>
                  setSettings({ ...settings, value_package_button_text: e.target.value })
                }
                placeholder="💬 GARANTIR MEU DESCONTO AGORA!"
              />

              <Input
                label="Link do Grupo WhatsApp (opcional)"
                value={settings.value_package_whatsapp_group_link}
                onChange={(e) =>
                  setSettings({ ...settings, value_package_whatsapp_group_link: e.target.value })
                }
                placeholder="https://chat.whatsapp.com/..."
              />

              <Input
                label="Número WhatsApp (fallback)"
                value={settings.value_package_whatsapp_number}
                onChange={(e) =>
                  setSettings({ ...settings, value_package_whatsapp_number: e.target.value })
                }
                placeholder="5534984136291"
              />

              <Input
                label="Texto de Estoque"
                value={settings.value_package_stock_text}
                onChange={(e) =>
                  setSettings({ ...settings, value_package_stock_text: e.target.value })
                }
                placeholder="📦 Estoque limitado"
              />

              <Input
                label="Texto de Desconto"
                value={settings.value_package_discount_text}
                onChange={(e) =>
                  setSettings({ ...settings, value_package_discount_text: e.target.value })
                }
                placeholder="🎯 De R$ 499 → por R$ 299 + 4 brindes grátis!"
              />

              <Input
                label="Texto de Promoção"
                value={settings.value_package_promotion_text}
                onChange={(e) =>
                  setSettings({ ...settings, value_package_promotion_text: e.target.value })
                }
                placeholder="🕒 Promoção válida enquanto durar o estoque."
              />
            </div>
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">História (Story)</h2>
            
            <div className="space-y-4">
              <Input
                label="Título"
                value={settings.story_title}
                onChange={(e) =>
                  setSettings({ ...settings, story_title: e.target.value })
                }
                placeholder="✍️ NOSSA HISTÓRIA"
              />

              <div>
                <label className="block text-sm font-medium mb-2">Conteúdo (use \n para quebras de linha)</label>
                <textarea
                  value={settings.story_content}
                  onChange={(e) =>
                    setSettings({ ...settings, story_content: e.target.value })
                  }
                  placeholder="A Smart Time Prime nasceu em Uberlândia..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <Input
                label="Nomes dos Donos/Fundadores"
                value={settings.story_founders_names}
                onChange={(e) =>
                  setSettings({ ...settings, story_founders_names: e.target.value })
                }
                placeholder="Guilherme e Letícia"
              />

              <div>
                <label className="block text-sm font-medium mb-2">Foto dos Donos na Loja</label>
                <ImageUploader
                  value={settings.story_image}
                  onChange={(url) => setSettings({ ...settings, story_image: url })}
                />
              </div>
            </div>
          </motion.div>

          {/* About Us Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Quem Somos (Fundadores)</h2>
            
            <div className="space-y-4">
              <Input
                label="Título"
                value={settings.about_us_title}
                onChange={(e) =>
                  setSettings({ ...settings, about_us_title: e.target.value })
                }
                placeholder="🏪 SOBRE A SMART TIME PRIME"
              />

              <div>
                <label className="block text-sm font-medium mb-2">Descrição (use \n para quebras de linha)</label>
                <textarea
                  value={settings.about_us_description}
                  onChange={(e) =>
                    setSettings({ ...settings, about_us_description: e.target.value })
                  }
                  placeholder="A Smart Time Prime é uma loja..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Foto da Loja</label>
                <ImageUploader
                  value={settings.about_us_store_image}
                  onChange={(url) => setSettings({ ...settings, about_us_store_image: url })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Foto dos Fundadores</label>
                <ImageUploader
                  value={settings.about_us_founders_image}
                  onChange={(url) => setSettings({ ...settings, about_us_founders_image: url })}
                />
              </div>

              <Input
                label="Nomes dos Fundadores/Donos"
                value={settings.about_us_founders_names}
                onChange={(e) =>
                  setSettings({ ...settings, about_us_founders_names: e.target.value })
                }
                placeholder="Guilherme e Letícia"
              />

              <Input
                label="Localização"
                value={settings.about_us_location}
                onChange={(e) =>
                  setSettings({ ...settings, about_us_location: e.target.value })
                }
                placeholder="Shopping Planalto, Uberlândia/MG"
              />
            </div>
          </motion.div>

          {/* Social Proof Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Avaliações (Social Proof)</h2>
            
            <div className="space-y-4">
              <Input
                label="Título"
                value={settings.social_proof_title}
                onChange={(e) =>
                  setSettings({ ...settings, social_proof_title: e.target.value })
                }
                placeholder="⭐ CLIENTES DE UBERLÂNDIA QUE JÁ ESTÃO USANDO"
              />

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.social_proof_google_icon}
                    onChange={(e) =>
                      setSettings({ ...settings, social_proof_google_icon: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Mostrar ícone do Google</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.social_proof_allow_photos}
                    onChange={(e) =>
                      setSettings({ ...settings, social_proof_allow_photos: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Permitir fotos nas avaliações</span>
                </label>
              </div>

              <Input
                label="Texto de Contagem de Testimonials"
                value={settings.social_proof_testimonial_count}
                onChange={(e) =>
                  setSettings({ ...settings, social_proof_testimonial_count: e.target.value })
                }
                placeholder="💬 Mais de 1.000 smartwatches entregues em Uberlândia."
              />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}


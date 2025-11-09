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
import { Save, Plus, Trash2, GripVertical } from 'lucide-react'
import Link from 'next/link'
import { BackButton } from '@/components/ui/BackButton'
import { createClient } from '@/lib/supabase/client'
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

interface LandingSettings {
  // Hero Section (expandido)
  hero_title: string
  hero_subtitle: string
  hero_badge_text: string
  hero_cta_text: string
  hero_button_text: string
  hero_button_link: string
  hero_bg_color: string
  hero_text_color: string
  hero_images: string[]
  hero_banner: string
  hero_banners: string[] // Array de banners para carrossel
  
  // Timer Section (Centralizado - controla todos os cronômetros)
  timer_enabled: boolean // Controla se os cronômetros estão ativos
  timer_end_date: string // Data/hora de finalização (controla todos os cronômetros)
  timer_title: string
  timer_bg_color: string
  timer_text_color: string
  
  // Fixed Timer
  fixed_timer_bg_color: string
  fixed_timer_text_color: string
  
  // Exit Popup
  exit_popup_enabled: boolean // Controla se o pop-up está ativo
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
  value_package_button_link: string // Novo campo para link de redirecionamento
  value_package_whatsapp_number: string
  value_package_discount_text: string
  value_package_promotion_text: string
  
  // Story Section
  story_title: string
  story_content: string
  story_images: string[] // Array de imagens
  story_image: string // Mantido para compatibilidade
  story_founders_names: string
  
  // About Us Section
  about_us_title: string
  about_us_description: string
  about_us_store_images: string[] // Array de imagens
  about_us_store_image: string // Mantido para compatibilidade
  about_us_founders_image: string // Removido do dashboard mas mantido para compatibilidade
  about_us_founders_names: string // Removido do dashboard mas mantido para compatibilidade
  about_us_location: string
  
  // Social Proof
  social_proof_title: string
  social_proof_google_icon: boolean
  social_proof_allow_photos: boolean
  social_proof_testimonial_count: string
  social_proof_reviews: Array<{
    id: string
    customer_name: string
    comment: string
    rating: number
    photo?: string
    google_review_link?: string
  }>
  
  // WhatsApp Fixo (Botão Flutuante)
  whatsapp_float_number: string
  whatsapp_float_message: string
  
  // Contact Section
  contact_title: string
  contact_description: string
  
    // Controles de visibilidade das seções
  section_hero_visible: boolean
  section_media_showcase_visible: boolean
  section_value_package_visible: boolean
  section_social_proof_visible: boolean
  section_story_visible: boolean
  section_whatsapp_vip_visible: boolean
  section_about_us_visible: boolean
  section_contact_visible: boolean
  
  // Controles de visibilidade de elementos individuais
  // Hero Section
  hero_badge_visible: boolean
  hero_title_visible: boolean
  hero_subtitle_visible: boolean
  hero_cta_visible: boolean
  hero_button_visible: boolean
  hero_timer_visible: boolean
  hero_banner_visible: boolean
  
  // Media Showcase Section
  media_showcase_title_visible: boolean
  media_showcase_features_visible: boolean
  media_showcase_images_visible: boolean
  media_showcase_video_visible: boolean
  
  // Value Package Section
  value_package_title_visible: boolean
  value_package_image_visible: boolean
  value_package_items_visible: boolean
  value_package_prices_visible: boolean
  value_package_button_visible: boolean
  value_package_timer_visible: boolean
  
  // Social Proof Section
  social_proof_title_visible: boolean
  social_proof_reviews_visible: boolean
  
  // Story Section
  story_title_visible: boolean
  story_content_visible: boolean
  story_images_visible: boolean
  
  // About Us Section
  about_us_title_visible: boolean
  about_us_description_visible: boolean
  about_us_images_visible: boolean
  about_us_location_visible: boolean
  
  // Section visibility defaults (novos campos)
  section_hero_visible_default: boolean
  section_media_showcase_visible_default: boolean
  section_value_package_visible_default: boolean
  section_social_proof_visible_default: boolean
  section_story_visible_default: boolean
  section_whatsapp_vip_visible_default: boolean
  section_about_us_visible_default: boolean
  section_contact_visible_default: boolean
  
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
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'hero',
    'media_showcase',
    'value_package',
    'social_proof',
    'story',
    'whatsapp_vip',
    'about_us',
    'contact'
  ])
  const [settings, setSettings] = useState<LandingSettings>({
    // Hero
    hero_title: '',
    hero_subtitle: '',
    hero_badge_text: '',
    hero_cta_text: '',
    hero_button_text: '',
    hero_button_link: '',
    hero_bg_color: '#000000',
    hero_text_color: '#FFFFFF',
    hero_images: [],
    hero_banner: '',
    hero_banners: [],
    // Timer (Centralizado)
    timer_enabled: true,
    timer_title: '⚡ Black Friday - Tempo Limitado!',
    timer_end_date: '',
    timer_bg_color: '#000000',
    timer_text_color: '#FFFFFF',
    // Fixed Timer
    fixed_timer_bg_color: '#000000',
    fixed_timer_text_color: '#FFFFFF',
    // Exit Popup
    exit_popup_enabled: true,
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
          value_package_button_link: 'https://chat.whatsapp.com/EVPNbUpwsjW7FMlerVRDqo?mode=wwt', // Link padrão do WhatsApp VIP
          value_package_whatsapp_number: '5534984136291',
    value_package_discount_text: '🎯 De R$ 499 → por R$ 299 + 4 brindes grátis!',
    value_package_promotion_text: '🕒 Promoção válida enquanto durar o estoque.',
    // Story
    story_title: '✍️ NOSSA HISTÓRIA',
    story_content: 'A Smart Time Prime nasceu em Uberlândia com o propósito de unir estilo e tecnologia no dia a dia das pessoas.\n\nHoje somos uma das lojas mais lembradas quando o assunto é smartwatch e confiança.',
    story_images: [],
    story_image: '',
    story_founders_names: 'Guilherme e Letícia',
    // About Us
    about_us_title: '🏪 SOBRE A SMART TIME PRIME',
    about_us_description: 'A Smart Time Prime é uma loja de tecnologia localizada em Uberlândia/MG, dentro do Shopping Planalto.\n\nSomos referência em smartwatches e acessórios tecnológicos, com atendimento humano, entrega rápida e garantia total.',
    about_us_store_images: [],
    about_us_store_image: '',
    about_us_founders_image: '',
    about_us_founders_names: 'Guilherme e Letícia',
    about_us_location: 'Shopping Planalto, Uberlândia/MG',
    // Social Proof
    social_proof_title: '⭐ CLIENTES DE UBERLÂNDIA QUE JÁ ESTÃO USANDO',
    social_proof_google_icon: true,
    social_proof_allow_photos: true,
    social_proof_testimonial_count: '💬 Mais de 1.000 smartwatches entregues em Uberlândia.',
    social_proof_reviews: [
      {
        id: '1',
        customer_name: 'Maria C., Planalto',
        comment: 'Chegou em menos de 1 dia! Atendimento excelente.',
        rating: 5,
        photo: '',
        google_review_link: '',
      },
      {
        id: '2',
        customer_name: 'Juliana R., Santa Mônica',
        comment: 'Comprei pro meu marido, ele amou.',
        rating: 5,
        photo: '',
        google_review_link: '',
      },
      {
        id: '3',
        customer_name: 'Carlos S., Tibery',
        comment: 'Produto top e suporte pelo WhatsApp super rápido.',
        rating: 5,
        photo: '',
        google_review_link: '',
      },
    ],
    // WhatsApp Fixo
    whatsapp_float_number: '5534984136291',
    whatsapp_float_message: 'Olá! Gostaria de saber mais sobre os produtos.',
    // Contact
    contact_title: 'Entre em Contato',
    contact_description: 'Estamos aqui para ajudar você!',
    // Controles de visibilidade das seções (padrão: todas visíveis)
    section_hero_visible: true,
    section_media_showcase_visible: true,
    section_value_package_visible: true,
    section_social_proof_visible: true,
    section_story_visible: true,
    section_whatsapp_vip_visible: true,
    section_about_us_visible: true,
    section_contact_visible: true,
    // Section visibility defaults (novos campos)
    section_hero_visible_default: true,
    section_media_showcase_visible_default: true,
    section_value_package_visible_default: true,
    section_social_proof_visible_default: true,
    section_story_visible_default: true,
    section_whatsapp_vip_visible_default: true,
    section_about_us_visible_default: true,
    section_contact_visible_default: true,
    // Controles de visibilidade de elementos individuais (padrão: todos visíveis)
    // Hero Section
    hero_badge_visible: true,
    hero_title_visible: true,
    hero_subtitle_visible: true,
    hero_cta_visible: true,
    hero_button_visible: true,
    hero_timer_visible: true,
    hero_banner_visible: true,
    // Media Showcase Section
    media_showcase_title_visible: true,
    media_showcase_features_visible: true,
    media_showcase_images_visible: true,
    media_showcase_video_visible: true,
    // Value Package Section
    value_package_title_visible: true,
    value_package_image_visible: true,
    value_package_items_visible: true,
    value_package_prices_visible: true,
    value_package_button_visible: true,
    value_package_timer_visible: true,
    // Social Proof Section
    social_proof_title_visible: true,
    social_proof_reviews_visible: true,
    // Story Section
    story_title_visible: true,
    story_content_visible: true,
    story_images_visible: true,
    // About Us Section
    about_us_title_visible: true,
    about_us_description_visible: true,
    about_us_images_visible: true,
    about_us_location_visible: true,
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
    loadSectionOrder()
  }, [isAuthenticated, isEditor, authLoading])

  const loadSectionOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'landing_section_order')
        .maybeSingle()

      if (error) throw error

      if (data?.value && Array.isArray(data.value)) {
        setSectionOrder(data.value)
      }
    } catch (error) {
      console.error('Erro ao carregar ordem das seções:', error)
    }
  }

  const saveSectionOrder = async (newOrder: string[]) => {
    try {
      await supabase
        .from('site_settings')
        .upsert({
          key: 'landing_section_order',
          value: newOrder,
          description: 'Ordem das seções da landing page',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key'
        })
    } catch (error) {
      console.error('Erro ao salvar ordem das seções:', error)
      toast.error('Erro ao salvar ordem das seções')
    }
  }

  // Mapeamento de seções
  const sectionMap: Record<string, { label: string; key: string; elements: Array<{ key: string; label: string }> }> = {
    hero: {
      label: 'Hero (Banner de Abertura)',
      key: 'section_hero_visible',
      elements: [
        { key: 'hero_banner_visible', label: 'Banner' },
        { key: 'hero_badge_visible', label: 'Badge' },
        { key: 'hero_title_visible', label: 'Título' },
        { key: 'hero_subtitle_visible', label: 'Subtítulo' },
        { key: 'hero_timer_visible', label: 'Cronômetro' },
        { key: 'hero_cta_visible', label: 'Botão CTA' },
        { key: 'hero_button_visible', label: 'Botão Secundário' },
      ]
    },
    media_showcase: {
      label: 'Fotos e Vídeo do Produto',
      key: 'section_media_showcase_visible',
      elements: [
        { key: 'media_showcase_title_visible', label: 'Título' },
        { key: 'media_showcase_features_visible', label: 'Características' },
        { key: 'media_showcase_images_visible', label: 'Imagens' },
        { key: 'media_showcase_video_visible', label: 'Vídeo' },
      ]
    },
    value_package: {
      label: 'Você Leva Tudo Isso',
      key: 'section_value_package_visible',
      elements: [
        { key: 'value_package_title_visible', label: 'Título' },
        { key: 'value_package_image_visible', label: 'Imagem' },
        { key: 'value_package_items_visible', label: 'Lista de Itens' },
        { key: 'value_package_prices_visible', label: 'Preços' },
        { key: 'value_package_timer_visible', label: 'Cronômetro' },
        { key: 'value_package_button_visible', label: 'Botão' },
      ]
    },
    social_proof: {
      label: 'Avaliações de Clientes',
      key: 'section_social_proof_visible',
      elements: [
        { key: 'social_proof_title_visible', label: 'Título' },
        { key: 'social_proof_reviews_visible', label: 'Avaliações' },
      ]
    },
    story: {
      label: 'Nossa História',
      key: 'section_story_visible',
      elements: [
        { key: 'story_title_visible', label: 'Título' },
        { key: 'story_content_visible', label: 'Conteúdo' },
        { key: 'story_images_visible', label: 'Imagens' },
      ]
    },
    about_us: {
      label: 'Sobre a Smart Time Prime',
      key: 'section_about_us_visible',
      elements: [
        { key: 'about_us_title_visible', label: 'Título' },
        { key: 'about_us_description_visible', label: 'Descrição' },
        { key: 'about_us_images_visible', label: 'Imagens' },
        { key: 'about_us_location_visible', label: 'Localização' },
      ]
    },
    whatsapp_vip: {
      label: 'Grupo VIP do WhatsApp',
      key: 'section_whatsapp_vip_visible',
      elements: []
    },
    contact: {
      label: 'Contato',
      key: 'section_contact_visible',
      elements: []
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(sectionOrder)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSectionOrder(items)
    saveSectionOrder(items)
    toast.success('Ordem das seções atualizada!')
  }

  const loadSettings = async () => {
    try {
      // Buscar configurações gerais e link do WhatsApp VIP
      const [generalResult, whatsappResult] = await Promise.all([
        supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'general')
          .maybeSingle(),
        supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'whatsapp_vip_group_link')
          .maybeSingle()
      ])

      const { data: generalData, error: generalError } = generalResult
      const { data: whatsappData, error: whatsappError } = whatsappResult

      if (generalError) throw generalError

      // Extrair link do WhatsApp VIP
      let whatsappVipLink = 'https://chat.whatsapp.com/EVPNbUpwsjW7FMlerVRDqo?mode=wwt' // Link padrão
      if (whatsappData?.value) {
        if (typeof whatsappData.value === 'string') {
          try {
            const parsed = JSON.parse(whatsappData.value)
            whatsappVipLink = typeof parsed === 'string' ? parsed : whatsappVipLink
          } catch {
            whatsappVipLink = whatsappData.value
          }
        } else if (typeof whatsappData.value === 'object') {
          whatsappVipLink = String(whatsappData.value)
        }
      }

      if (generalData?.value) {
        const savedSettings = generalData.value as any
        // Usar valores padrão apenas se não houver no banco
        setSettings({
          // Hero
          hero_title: savedSettings.hero_title || '',
          hero_subtitle: savedSettings.hero_subtitle || '',
          hero_badge_text: savedSettings.hero_badge_text || '',
          hero_cta_text: savedSettings.hero_cta_text || '',
          hero_button_text: savedSettings.hero_button_text || '',
          hero_button_link: savedSettings.hero_button_link || '',
          hero_bg_color: savedSettings.hero_bg_color || '#000000',
          hero_text_color: savedSettings.hero_text_color || '#FFFFFF',
          hero_images: Array.isArray(savedSettings.hero_images) ? savedSettings.hero_images : [],
          hero_banner: savedSettings.hero_banner || '',
          hero_banners: Array.isArray(savedSettings.hero_banners) ? savedSettings.hero_banners : [],
          // Timer (Centralizado)
          timer_enabled: savedSettings.timer_enabled !== undefined ? savedSettings.timer_enabled : true,
          timer_title: savedSettings.timer_title || '⚡ Black Friday - Tempo Limitado!',
          timer_end_date: savedSettings.timer_end_date 
            ? (() => {
                // Converter ISO string do banco para formato datetime-local (sem timezone)
                const date = new Date(savedSettings.timer_end_date)
                // Obter componentes no timezone local
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                const hours = String(date.getHours()).padStart(2, '0')
                const minutes = String(date.getMinutes()).padStart(2, '0')
                return `${year}-${month}-${day}T${hours}:${minutes}`
              })()
            : '',
          timer_bg_color: savedSettings.timer_bg_color || '#000000',
          timer_text_color: savedSettings.timer_text_color || '#FFFFFF',
          // Fixed Timer
          fixed_timer_bg_color: savedSettings.fixed_timer_bg_color || '#000000',
          fixed_timer_text_color: savedSettings.fixed_timer_text_color || '#FFFFFF',
          // Exit Popup
          exit_popup_enabled: savedSettings.exit_popup_enabled !== undefined ? savedSettings.exit_popup_enabled : true,
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
          // Preencher com link do WhatsApp VIP se estiver vazio
          value_package_button_link: savedSettings.value_package_button_link || whatsappVipLink,
          value_package_whatsapp_number: savedSettings.value_package_whatsapp_number || '5534984136291',
          value_package_discount_text: savedSettings.value_package_discount_text || '🎯 De R$ 499 → por R$ 299 + 4 brindes grátis!',
          value_package_promotion_text: savedSettings.value_package_promotion_text || '🕒 Promoção válida enquanto durar o estoque.',
          // Story
          story_title: savedSettings.story_title || '✍️ NOSSA HISTÓRIA',
          story_content: savedSettings.story_content || 'A Smart Time Prime nasceu em Uberlândia com o propósito de unir estilo e tecnologia no dia a dia das pessoas.\n\nHoje somos uma das lojas mais lembradas quando o assunto é smartwatch e confiança.',
          story_images: Array.isArray(savedSettings.story_images) ? savedSettings.story_images : (savedSettings.story_image ? [savedSettings.story_image] : []),
          story_image: savedSettings.story_image || '',
          story_founders_names: savedSettings.story_founders_names || 'Guilherme e Letícia',
          // About Us
          about_us_title: savedSettings.about_us_title || '🏪 SOBRE A SMART TIME PRIME',
          about_us_description: savedSettings.about_us_description || 'A Smart Time Prime é uma loja de tecnologia localizada em Uberlândia/MG, dentro do Shopping Planalto.\n\nSomos referência em smartwatches e acessórios tecnológicos, com atendimento humano, entrega rápida e garantia total.',
          about_us_store_images: Array.isArray(savedSettings.about_us_store_images) ? savedSettings.about_us_store_images : (savedSettings.about_us_store_image ? [savedSettings.about_us_store_image] : []),
          about_us_store_image: savedSettings.about_us_store_image || '',
          about_us_founders_image: savedSettings.about_us_founders_image || '',
          about_us_founders_names: savedSettings.about_us_founders_names || 'Guilherme e Letícia',
          about_us_location: savedSettings.about_us_location || 'Shopping Planalto, Uberlândia/MG',
          // Social Proof
          social_proof_title: savedSettings.social_proof_title || '⭐ CLIENTES DE UBERLÂNDIA QUE JÁ ESTÃO USANDO',
          social_proof_google_icon: savedSettings.social_proof_google_icon !== undefined ? savedSettings.social_proof_google_icon : true,
          social_proof_allow_photos: savedSettings.social_proof_allow_photos !== undefined ? savedSettings.social_proof_allow_photos : true,
          social_proof_testimonial_count: savedSettings.social_proof_testimonial_count || '💬 Mais de 1.000 smartwatches entregues em Uberlândia.',
          social_proof_reviews: Array.isArray(savedSettings.social_proof_reviews) && savedSettings.social_proof_reviews.length > 0
            ? savedSettings.social_proof_reviews
            : [
                {
                  id: '1',
                  customer_name: 'Maria C., Planalto',
                  comment: 'Chegou em menos de 1 dia! Atendimento excelente.',
                  rating: 5,
                  photo: '',
                  google_review_link: '',
                },
                {
                  id: '2',
                  customer_name: 'Juliana R., Santa Mônica',
                  comment: 'Comprei pro meu marido, ele amou.',
                  rating: 5,
                  photo: '',
                  google_review_link: '',
                },
                {
                  id: '3',
                  customer_name: 'Carlos S., Tibery',
                  comment: 'Produto top e suporte pelo WhatsApp super rápido.',
                  rating: 5,
                  photo: '',
                  google_review_link: '',
                },
              ],
          // WhatsApp Fixo
          whatsapp_float_number: savedSettings.whatsapp_float_number || '5534984136291',
          whatsapp_float_message: savedSettings.whatsapp_float_message || 'Olá! Gostaria de saber mais sobre os produtos.',
          // Contact
          contact_title: savedSettings.contact_title || 'Entre em Contato',
          contact_description: savedSettings.contact_description || 'Estamos aqui para ajudar você!',
          // Controles de visibilidade das seções
          section_hero_visible: savedSettings.section_hero_visible !== undefined ? savedSettings.section_hero_visible : true,
          section_media_showcase_visible: savedSettings.section_media_showcase_visible !== undefined ? savedSettings.section_media_showcase_visible : true,
          section_value_package_visible: savedSettings.section_value_package_visible !== undefined ? savedSettings.section_value_package_visible : true,
          section_social_proof_visible: savedSettings.section_social_proof_visible !== undefined ? savedSettings.section_social_proof_visible : true,
          section_story_visible: savedSettings.section_story_visible !== undefined ? savedSettings.section_story_visible : true,
          section_whatsapp_vip_visible: savedSettings.section_whatsapp_vip_visible !== undefined ? savedSettings.section_whatsapp_vip_visible : true,
          section_about_us_visible: savedSettings.section_about_us_visible !== undefined ? savedSettings.section_about_us_visible : true,
          section_contact_visible: savedSettings.section_contact_visible !== undefined ? savedSettings.section_contact_visible : true,
          // Section visibility defaults (novos campos)
          section_hero_visible_default: savedSettings.section_hero_visible_default !== undefined ? savedSettings.section_hero_visible_default : true,
          section_media_showcase_visible_default: savedSettings.section_media_showcase_visible_default !== undefined ? savedSettings.section_media_showcase_visible_default : true,
          section_value_package_visible_default: savedSettings.section_value_package_visible_default !== undefined ? savedSettings.section_value_package_visible_default : true,
          section_social_proof_visible_default: savedSettings.section_social_proof_visible_default !== undefined ? savedSettings.section_social_proof_visible_default : true,
          section_story_visible_default: savedSettings.section_story_visible_default !== undefined ? savedSettings.section_story_visible_default : true,
          section_whatsapp_vip_visible_default: savedSettings.section_whatsapp_vip_visible_default !== undefined ? savedSettings.section_whatsapp_vip_visible_default : true,
          section_about_us_visible_default: savedSettings.section_about_us_visible_default !== undefined ? savedSettings.section_about_us_visible_default : true,
          section_contact_visible_default: savedSettings.section_contact_visible_default !== undefined ? savedSettings.section_contact_visible_default : true,
          // Controles de visibilidade de elementos individuais
          // Hero Section
          hero_badge_visible: savedSettings.hero_badge_visible !== undefined ? savedSettings.hero_badge_visible : true,
          hero_title_visible: savedSettings.hero_title_visible !== undefined ? savedSettings.hero_title_visible : true,
          hero_subtitle_visible: savedSettings.hero_subtitle_visible !== undefined ? savedSettings.hero_subtitle_visible : true,
          hero_cta_visible: savedSettings.hero_cta_visible !== undefined ? savedSettings.hero_cta_visible : true,
          hero_button_visible: savedSettings.hero_button_visible !== undefined ? savedSettings.hero_button_visible : true,
          hero_timer_visible: savedSettings.hero_timer_visible !== undefined ? savedSettings.hero_timer_visible : true,
          hero_banner_visible: savedSettings.hero_banner_visible !== undefined ? savedSettings.hero_banner_visible : true,
          // Media Showcase Section
          media_showcase_title_visible: savedSettings.media_showcase_title_visible !== undefined ? savedSettings.media_showcase_title_visible : true,
          media_showcase_features_visible: savedSettings.media_showcase_features_visible !== undefined ? savedSettings.media_showcase_features_visible : true,
          media_showcase_images_visible: savedSettings.media_showcase_images_visible !== undefined ? savedSettings.media_showcase_images_visible : true,
          media_showcase_video_visible: savedSettings.media_showcase_video_visible !== undefined ? savedSettings.media_showcase_video_visible : true,
          // Value Package Section
          value_package_title_visible: savedSettings.value_package_title_visible !== undefined ? savedSettings.value_package_title_visible : true,
          value_package_image_visible: savedSettings.value_package_image_visible !== undefined ? savedSettings.value_package_image_visible : true,
          value_package_items_visible: savedSettings.value_package_items_visible !== undefined ? savedSettings.value_package_items_visible : true,
          value_package_prices_visible: savedSettings.value_package_prices_visible !== undefined ? savedSettings.value_package_prices_visible : true,
          value_package_button_visible: savedSettings.value_package_button_visible !== undefined ? savedSettings.value_package_button_visible : true,
          value_package_timer_visible: savedSettings.value_package_timer_visible !== undefined ? savedSettings.value_package_timer_visible : true,
          // Social Proof Section
          social_proof_title_visible: savedSettings.social_proof_title_visible !== undefined ? savedSettings.social_proof_title_visible : true,
          social_proof_reviews_visible: savedSettings.social_proof_reviews_visible !== undefined ? savedSettings.social_proof_reviews_visible : true,
          // Story Section
          story_title_visible: savedSettings.story_title_visible !== undefined ? savedSettings.story_title_visible : true,
          story_content_visible: savedSettings.story_content_visible !== undefined ? savedSettings.story_content_visible : true,
          story_images_visible: savedSettings.story_images_visible !== undefined ? savedSettings.story_images_visible : true,
          // About Us Section
          about_us_title_visible: savedSettings.about_us_title_visible !== undefined ? savedSettings.about_us_title_visible : true,
          about_us_description_visible: savedSettings.about_us_description_visible !== undefined ? savedSettings.about_us_description_visible : true,
          about_us_images_visible: savedSettings.about_us_images_visible !== undefined ? savedSettings.about_us_images_visible : true,
          about_us_location_visible: savedSettings.about_us_location_visible !== undefined ? savedSettings.about_us_location_visible : true,
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
      // O input datetime-local retorna formato "YYYY-MM-DDTHH:mm" sem timezone (horário local)
      let timerEndDateISO: string | null = null
      if (settings.timer_end_date) {
        try {
          // Se já está no formato ISO completo, usar diretamente
          if (settings.timer_end_date.includes('T') && settings.timer_end_date.includes('Z')) {
            timerEndDateISO = settings.timer_end_date
          } else {
            // Converter do formato datetime-local para ISO
            // datetime-local retorna "YYYY-MM-DDTHH:mm" no horário local do navegador
            // Parsear manualmente para garantir precisão
            const localDateStr = settings.timer_end_date
            const [datePart, timePart] = localDateStr.split('T')
            const [year, month, day] = datePart.split('-').map(Number)
            const [hours, minutes] = timePart.split(':').map(Number)
            
            // Criar Date no horário local (JavaScript interpreta isso corretamente)
            const localDate = new Date(year, month - 1, day, hours, minutes)
            
            // Converter para ISO string (UTC)
            // O JavaScript automaticamente ajusta para UTC ao converter
            timerEndDateISO = localDate.toISOString()
            
            if (isNaN(localDate.getTime())) {
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
          {/* Cronômetros Centralizados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">⏰ Cronômetros (Centralizado)</h2>
            <p className="text-sm text-gray-600 mb-6">
              Esta configuração controla TODOS os cronômetros da página (Fixed Timer, Hero Section, Value Package e Exit Popup).
            </p>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.timer_enabled}
                  onChange={(e) => setSettings({ ...settings, timer_enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="font-semibold">Ativar Cronômetros</span>
                <span className="text-sm text-gray-500">(Quando desativado, todos os cronômetros desaparecem da página)</span>
              </label>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Data e Hora de Finalização *
                </label>
                <input
                  type="datetime-local"
                  value={settings.timer_end_date}
                  onChange={(e) => setSettings({ ...settings, timer_end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta data será usada em todos os cronômetros da página (Fixed Timer, Hero Section, Value Package e Exit Popup).
                </p>
              </div>
            </div>
          </motion.div>

          {/* Exit Popup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">⚠️ Pop-up de Saída (Exit Popup)</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.exit_popup_enabled}
                  onChange={(e) => setSettings({ ...settings, exit_popup_enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="font-semibold">Ativar Pop-up de Saída</span>
                <span className="text-sm text-gray-500">(Aparece ao chegar no final da página ou tentar sair)</span>
              </label>

              <Input
                label="Título do Pop-up"
                value={settings.exit_popup_title}
                onChange={(e) => setSettings({ ...settings, exit_popup_title: e.target.value })}
                placeholder="⚠️ Espere!"
              />

              <div>
                <label className="block text-sm font-medium mb-2">Mensagem do Pop-up</label>
                <textarea
                  value={settings.exit_popup_message}
                  onChange={(e) => setSettings({ ...settings, exit_popup_message: e.target.value })}
                  placeholder="Ainda dá tempo de garantir seu Smartwatch Série 11 com 4 brindes grátis."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <Input
                label="Texto do Botão"
                value={settings.exit_popup_button_text}
                onChange={(e) => setSettings({ ...settings, exit_popup_button_text: e.target.value })}
                placeholder="💬 FALAR AGORA NO WHATSAPP"
              />

              <Input
                label="Número WhatsApp"
                value={settings.exit_popup_whatsapp_number}
                onChange={(e) => setSettings({ ...settings, exit_popup_whatsapp_number: e.target.value })}
                placeholder="5534984136291"
              />
              <p className="text-xs text-gray-500 -mt-2">
                Formato: 5534984136291 (sem espaços, com código do país e DDD)
              </p>
            </div>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Seção Principal (Hero)</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.section_hero_visible ?? true}
                  onChange={(e) =>
                    setSettings({ ...settings, section_hero_visible: e.target.checked })
                  }
                  className="w-5 h-5 text-black focus:ring-black border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Ativar Seção</span>
              </label>
            </div>
            
            <div className="space-y-4">
              {/* Checkboxes de visibilidade de elementos individuais */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium mb-3">Visibilidade de elementos:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'hero_banner_visible', label: 'Banner' },
                    { key: 'hero_badge_visible', label: 'Badge' },
                    { key: 'hero_title_visible', label: 'Título' },
                    { key: 'hero_subtitle_visible', label: 'Subtítulo' },
                    { key: 'hero_timer_visible', label: 'Cronômetro' },
                    { key: 'hero_cta_visible', label: 'Botão CTA' },
                    { key: 'hero_button_visible', label: 'Botão Secundário' },
                  ].map((element) => (
                    <label key={element.key} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={(settings as any)[element.key] ?? true}
                        onChange={(e) =>
                          setSettings({ ...settings, [element.key]: e.target.checked } as any)
                        }
                        className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <span>{element.label}</span>
                    </label>
                  ))}
                </div>
              </div>

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
                label="Texto do Botão (Hero)"
                value={settings.hero_button_text}
                onChange={(e) =>
                  setSettings({ ...settings, hero_button_text: e.target.value })
                }
                placeholder="Ex: Saiba Mais"
              />

              <Input
                label="Link do Botão (Hero)"
                value={settings.hero_button_link}
                onChange={(e) =>
                  setSettings({ ...settings, hero_button_link: e.target.value })
                }
                placeholder="Ex: /produtos ou https://exemplo.com"
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
                  cropType="banner"
                  aspectRatio={1920/650}
                  targetSize={{ width: 1920, height: 650 }}
                  recommendedDimensions="Banners: 1920 x 650px (Formato Horizontal/Banner)"
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Seção de Contato (Footer)</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.section_contact_visible ?? true}
                  onChange={(e) =>
                    setSettings({ ...settings, section_contact_visible: e.target.checked })
                  }
                  className="w-5 h-5 text-black focus:ring-black border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Ativar Seção</span>
              </label>
            </div>
            
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Galeria de Destaques</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.section_media_showcase_visible ?? true}
                  onChange={(e) =>
                    setSettings({ ...settings, section_media_showcase_visible: e.target.checked })
                  }
                  className="w-5 h-5 text-black focus:ring-black border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Ativar Seção</span>
              </label>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              📸 Envie imagens no formato Instagram Post (1080x1080px) para o carrossel + 1 vídeo vertical tipo Reels
            </p>
            
            <div className="space-y-4 mb-6">
              {/* Checkboxes de visibilidade de elementos individuais */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium mb-3">Visibilidade de elementos:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'media_showcase_title_visible', label: 'Título' },
                    { key: 'media_showcase_features_visible', label: 'Características' },
                    { key: 'media_showcase_images_visible', label: 'Imagens' },
                    { key: 'media_showcase_video_visible', label: 'Vídeo' },
                  ].map((element) => (
                    <label key={element.key} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={(settings as any)[element.key] ?? true}
                        onChange={(e) =>
                          setSettings({ ...settings, [element.key]: e.target.checked } as any)
                        }
                        className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <span>{element.label}</span>
                    </label>
                  ))}
                </div>
              </div>

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
                  cropType="square"
                  aspectRatio={1}
                  targetSize={{ width: 1080, height: 1080 }}
                  recommendedDimensions="Imagens: 1080 x 1080px (Formato Instagram Post)"
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
                  onChange={async (url) => {
                    console.log('VideoUploader onChange:', url)
                    // Salvar vídeo diretamente no banco ao mudar
                    try {
                      const supabase = createClient()
                      const { data: existing } = await supabase
                        .from('site_settings')
                        .select('value')
                        .eq('key', 'general')
                        .single()

                      if (existing?.value) {
                        let currentValue = existing.value
                        if (typeof existing.value === 'string') {
                          try {
                            currentValue = JSON.parse(existing.value)
                          } catch (e) {
                            currentValue = {}
                          }
                        }
                        
                        const updatedValue = typeof currentValue === 'object' && currentValue !== null
                          ? { ...currentValue, showcase_video_url: url }
                          : { showcase_video_url: url }
                        
                        const { error } = await supabase
                          .from('site_settings')
                          .update({
                            value: updatedValue,
                            updated_at: new Date().toISOString(),
                          })
                          .eq('key', 'general')
                        
                        if (error) {
                          console.error('Erro ao salvar vídeo:', error)
                          toast.error('Erro ao salvar vídeo')
                        } else {
                          toast.success('Vídeo salvo!')
                        }
                      } else {
                        const { error } = await supabase
                          .from('site_settings')
                          .insert({
                            key: 'general',
                            value: { showcase_video_url: url },
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          })
                        
                        if (error) {
                          console.error('Erro ao salvar vídeo:', error)
                          toast.error('Erro ao salvar vídeo')
                        } else {
                          toast.success('Vídeo salvo!')
                        }
                      }
                    } catch (error) {
                      console.error('Erro ao salvar vídeo:', error)
                      toast.error('Erro ao salvar vídeo')
                    }
                    
                    setSettings((prev) => ({ ...prev, showcase_video_url: url }))
                  }}
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Pacote de Valor</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.section_value_package_visible ?? true}
                  onChange={(e) =>
                    setSettings({ ...settings, section_value_package_visible: e.target.checked })
                  }
                  className="w-5 h-5 text-black focus:ring-black border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Ativar Seção</span>
              </label>
            </div>
            
            <div className="space-y-4">
              {/* Checkboxes de visibilidade de elementos individuais */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium mb-3">Visibilidade de elementos:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'value_package_title_visible', label: 'Título' },
                    { key: 'value_package_image_visible', label: 'Imagem' },
                    { key: 'value_package_items_visible', label: 'Lista de Itens' },
                    { key: 'value_package_prices_visible', label: 'Preços' },
                    { key: 'value_package_timer_visible', label: 'Cronômetro' },
                    { key: 'value_package_button_visible', label: 'Botão' },
                  ].map((element) => (
                    <label key={element.key} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={(settings as any)[element.key] ?? true}
                        onChange={(e) =>
                          setSettings({ ...settings, [element.key]: e.target.checked } as any)
                        }
                        className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <span>{element.label}</span>
                    </label>
                  ))}
                </div>
              </div>

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
                label="Link de Redirecionamento do Botão (opcional)"
                value={settings.value_package_button_link}
                onChange={(e) =>
                  setSettings({ ...settings, value_package_button_link: e.target.value })
                }
                placeholder="Ex: /produtos ou /produtos/relogio-smartwatch"
              />
              <p className="text-xs text-gray-500 -mt-2">
                Link padrão: WhatsApp VIP. Pode ser um link interno (ex: /produtos) ou externo (ex: https://chat.whatsapp.com/...)
              </p>
            </div>
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Nossa História</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.section_story_visible ?? true}
                  onChange={(e) =>
                    setSettings({ ...settings, section_story_visible: e.target.checked })
                  }
                  className="w-5 h-5 text-black focus:ring-black border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Ativar Seção</span>
              </label>
            </div>
            
            <div className="space-y-4">
              {/* Checkboxes de visibilidade de elementos individuais */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium mb-3">Visibilidade de elementos:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'story_title_visible', label: 'Título' },
                    { key: 'story_content_visible', label: 'Conteúdo' },
                    { key: 'story_images_visible', label: 'Imagens' },
                  ].map((element) => (
                    <label key={element.key} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={(settings as any)[element.key] ?? true}
                        onChange={(e) =>
                          setSettings({ ...settings, [element.key]: e.target.checked } as any)
                        }
                        className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <span>{element.label}</span>
                    </label>
                  ))}
                </div>
              </div>

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
                <label className="block text-sm font-medium mb-2">Fotos dos Donos na Loja</label>
                <ArrayImageManager
                  value={settings.story_images}
                  onChange={(images) => setSettings({ ...settings, story_images: images })}
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Quem Somos</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.section_about_us_visible ?? true}
                  onChange={(e) =>
                    setSettings({ ...settings, section_about_us_visible: e.target.checked })
                  }
                  className="w-5 h-5 text-black focus:ring-black border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Ativar Seção</span>
              </label>
            </div>
            
            <div className="space-y-4">
              {/* Checkboxes de visibilidade de elementos individuais */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium mb-3">Visibilidade de elementos:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'about_us_title_visible', label: 'Título' },
                    { key: 'about_us_description_visible', label: 'Descrição' },
                    { key: 'about_us_images_visible', label: 'Imagens' },
                    { key: 'about_us_location_visible', label: 'Localização' },
                  ].map((element) => (
                    <label key={element.key} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={(settings as any)[element.key] ?? true}
                        onChange={(e) =>
                          setSettings({ ...settings, [element.key]: e.target.checked } as any)
                        }
                        className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <span>{element.label}</span>
                    </label>
                  ))}
                </div>
              </div>

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
                <label className="block text-sm font-medium mb-2">Fotos da Loja</label>
                <ArrayImageManager
                  value={settings.about_us_store_images}
                  onChange={(images) => setSettings({ ...settings, about_us_store_images: images })}
                />
              </div>

              <Input
                label="Localização"
                value={settings.about_us_location}
                onChange={(e) =>
                  setSettings({ ...settings, about_us_location: e.target.value })
                }
                placeholder="Shopping Planalto, Uberlândia/MG"
              />
              <p className="text-xs text-gray-500 -mt-2">
                Localização que aparecerá no botão de endereço da loja
              </p>
            </div>
          </motion.div>

          {/* WhatsApp Fixo (Botão Flutuante) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">💬 WhatsApp Fixo (Botão Flutuante)</h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure o botão flutuante do WhatsApp que aparece fixo na tela.
            </p>
            
            <div className="space-y-4">
              <Input
                label="Número do WhatsApp"
                value={settings.whatsapp_float_number}
                onChange={(e) =>
                  setSettings({ ...settings, whatsapp_float_number: e.target.value })
                }
                placeholder="5534984136291"
              />
              <p className="text-xs text-gray-500 -mt-2">
                Formato: 5534984136291 (sem espaços, com código do país e DDD)
              </p>

              <Input
                label="Mensagem Padrão"
                value={settings.whatsapp_float_message}
                onChange={(e) =>
                  setSettings({ ...settings, whatsapp_float_message: e.target.value })
                }
                placeholder="Olá! Gostaria de saber mais sobre os produtos."
              />
            </div>
          </motion.div>

          {/* Controles de Visibilidade das Seções */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">👁️ Visibilidade e Ordem das Seções</h2>
            <p className="text-sm text-gray-600 mb-6">
              Controle quais seções da página inicial devem ser exibidas e arraste para reordenar.
            </p>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {sectionOrder.map((sectionId, index) => {
                      const section = sectionMap[sectionId]
                      if (!section) return null
                      
                      return (
                        <Draggable key={sectionId} draggableId={sectionId} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border rounded-lg p-4 ${snapshot.isDragging ? 'bg-gray-100 shadow-lg' : 'bg-white'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                  <GripVertical size={20} className="text-gray-400" />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 mb-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={(settings as any)[section.key] ?? true}
                                    onChange={(e) =>
                                      setSettings({ ...settings, [section.key]: e.target.checked } as any)
                                    }
                                    className="w-5 h-5 text-black focus:ring-black border-gray-300 rounded"
                                  />
                                  <span className="text-sm font-bold">{section.label}</span>
                                </label>
                              </div>
                              {(settings as any)[section.key] && section.elements.length > 0 && (
                                <div className="ml-8 space-y-2 pl-4 border-l-2 border-gray-200 mt-2">
                                  {section.elements.map((element) => (
                                    <label key={element.key} className="flex items-center gap-2 cursor-pointer text-sm">
                                      <input
                                        type="checkbox"
                                        checked={(settings as any)[element.key] ?? true}
                                        onChange={(e) =>
                                          setSettings({ ...settings, [element.key]: e.target.checked } as any)
                                        }
                                        className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                                      />
                                      <span>{element.label}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </motion.div>

          {/* Social Proof Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">⭐ Avaliações (Social Proof)</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.section_social_proof_visible ?? true}
                  onChange={(e) =>
                    setSettings({ ...settings, section_social_proof_visible: e.target.checked })
                  }
                  className="w-5 h-5 text-black focus:ring-black border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Ativar Seção</span>
              </label>
            </div>
            
            <div className="space-y-4">
              {/* Checkboxes de visibilidade de elementos individuais */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium mb-3">Visibilidade de elementos:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'social_proof_title_visible', label: 'Título' },
                    { key: 'social_proof_reviews_visible', label: 'Avaliações' },
                  ].map((element) => (
                    <label key={element.key} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={(settings as any)[element.key] ?? true}
                        onChange={(e) =>
                          setSettings({ ...settings, [element.key]: e.target.checked } as any)
                        }
                        className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <span>{element.label}</span>
                    </label>
                  ))}
                </div>
              </div>

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

              {/* Lista de Avaliações */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Avaliações dos Clientes
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newReview = {
                        id: Date.now().toString(),
                        customer_name: '',
                        comment: '',
                        rating: 5,
                        photo: '',
                        google_review_link: '',
                      }
                      setSettings({
                        ...settings,
                        social_proof_reviews: [...(settings.social_proof_reviews || []), newReview]
                      })
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar Avaliação
                  </Button>
                </div>

                <div className="space-y-4">
                  {(settings.social_proof_reviews || []).map((review, index) => (
                    <div key={review.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Avaliação {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newReviews = settings.social_proof_reviews?.filter((_, i) => i !== index) || []
                            setSettings({ ...settings, social_proof_reviews: newReviews })
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Nome do Cliente"
                          value={review.customer_name}
                          onChange={(e) => {
                            const newReviews = [...(settings.social_proof_reviews || [])]
                            newReviews[index].customer_name = e.target.value
                            setSettings({ ...settings, social_proof_reviews: newReviews })
                          }}
                          placeholder="Maria C., Planalto"
                        />

                        <div>
                          <label className="block text-sm font-medium mb-2">Avaliação (1-5)</label>
                          <select
                            value={review.rating}
                            onChange={(e) => {
                              const newReviews = [...(settings.social_proof_reviews || [])]
                              newReviews[index].rating = parseInt(e.target.value)
                              setSettings({ ...settings, social_proof_reviews: newReviews })
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                            <option value={4}>4 ⭐⭐⭐⭐</option>
                            <option value={3}>3 ⭐⭐⭐</option>
                            <option value={2}>2 ⭐⭐</option>
                            <option value={1}>1 ⭐</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Comentário</label>
                        <textarea
                          value={review.comment}
                          onChange={(e) => {
                            const newReviews = [...(settings.social_proof_reviews || [])]
                            newReviews[index].comment = e.target.value
                            setSettings({ ...settings, social_proof_reviews: newReviews })
                          }}
                          placeholder="Chegou em menos de 1 dia! Atendimento excelente."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Foto do Cliente (opcional)</label>
                          <ImageUploader
                            value={review.photo || ''}
                            onChange={(url) => {
                              const newReviews = [...(settings.social_proof_reviews || [])]
                              newReviews[index].photo = url
                              setSettings({ ...settings, social_proof_reviews: newReviews })
                            }}
                            placeholder="Clique para fazer upload da foto"
                          />
                        </div>

                        <Input
                          label="Link da Avaliação no Google (opcional)"
                          value={review.google_review_link || ''}
                          onChange={(e) => {
                            const newReviews = [...(settings.social_proof_reviews || [])]
                            newReviews[index].google_review_link = e.target.value
                            setSettings({ ...settings, social_proof_reviews: newReviews })
                          }}
                          placeholder="https://g.page/r/..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}


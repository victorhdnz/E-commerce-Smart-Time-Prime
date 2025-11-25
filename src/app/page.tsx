import { HeroSection } from '@/components/landing/HeroSection'
import { MediaShowcase } from '@/components/landing/MediaShowcase'
import { SocialProof } from '@/components/landing/SocialProof'
import { FAQSection } from '@/components/landing/FAQSection'
import { AuthRedirect } from '@/components/landing/AuthRedirect'
import { WhatsAppVipRegistration } from '@/components/landing/WhatsAppVipRegistration'
import { FixedTimer } from '@/components/landing/FixedTimer'
import { ExitPopup } from '@/components/landing/ExitPopup'
import { ValuePackage } from '@/components/landing/ValuePackage'
import { StorySection } from '@/components/landing/StorySection'
import { AboutUsSection } from '@/components/landing/AboutUsSection'
import { ContactSection } from '@/components/landing/ContactSection'
import { SectionTransition } from '@/components/landing/SectionTransition'
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat'
import { createServerClient } from '@/lib/supabase/server'

export const revalidate = 10 // Revalidar a cada 10 segundos para atualizações mais rápidas
export const dynamic = 'force-dynamic' // Forçar renderização dinâmica

async function getPageData() {
  const supabase = createServerClient()

  try {
    // Buscar tudo em paralelo (sem timeout para não causar lentidão)
    const results = await Promise.allSettled([
      supabase.from('site_settings').select('*').eq('key', 'general').maybeSingle(),
      supabase.from('products').select('*, colors:product_colors(*)').eq('is_featured', true).eq('is_active', true).limit(8),
      supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(6),
      supabase.from('faqs').select('*').eq('is_active', true).order('order_position', { ascending: true }),
      supabase.from('seasonal_layouts').select('*').eq('is_active', true).maybeSingle(),
      supabase.from('product_combos').select(`
        *,
        combo_items (
          id,
          product_id,
          quantity,
          product:products (id, name, local_price, national_price, images)
        )
      `).eq('is_featured', true).eq('is_active', true).limit(6),
      supabase.from('site_settings').select('value').eq('key', 'whatsapp_vip_group_link').maybeSingle(),
      supabase.from('site_settings').select('value').eq('key', 'whatsapp_vip_require_registration').maybeSingle(),
      supabase.from('site_settings').select('value').eq('key', 'landing_section_order').maybeSingle(),
    ])

    const [settingsResult, productsResult, reviewsResult, faqsResult, layoutResult, combosResult, whatsappLinkResult, requireRegistrationResult, sectionOrderResult] = results

    // Extrair link do WhatsApp (pode vir do banco ou usar o padrão do código)
    const whatsappLinkData = whatsappLinkResult.status === 'fulfilled' ? whatsappLinkResult.value.data : null
    let whatsappLink: string | undefined = undefined
    
    if (whatsappLinkData?.value) {
      // Se o value é uma string JSON, fazer parse
      if (typeof whatsappLinkData.value === 'string') {
        try {
          const parsed = JSON.parse(whatsappLinkData.value)
          whatsappLink = typeof parsed === 'string' ? parsed : undefined
        } catch {
          whatsappLink = whatsappLinkData.value
        }
      } else if (typeof whatsappLinkData.value === 'object') {
        // Se já é um objeto, tentar extrair como string
        whatsappLink = String(whatsappLinkData.value)
      }
    }
    
    // Se não tiver link no banco, usar o padrão do componente
    // O componente já tem o link hardcoded como fallback

    // Extrair link do Google Maps e WhatsApp das configurações gerais
    const settingsData = settingsResult.status === 'fulfilled' ? settingsResult.value.data : null
    const generalSettings = settingsData?.value || {}
    const mapsLink = generalSettings.contact_maps_link || 'https://maps.app.goo.gl/sj7F35h9fJ86T7By6'
    const contactWhatsApp = generalSettings.contact_whatsapp || '+55 34 8413-6291'

    // Extrair configuração de cadastro obrigatório
    const requireRegistrationData = requireRegistrationResult.status === 'fulfilled' ? requireRegistrationResult.value.data : null
    let requireRegistration: boolean = true // Padrão: exigir cadastro
    if (requireRegistrationData?.value !== undefined) {
      requireRegistration = typeof requireRegistrationData.value === 'boolean' 
        ? requireRegistrationData.value 
        : requireRegistrationData.value === 'true' || requireRegistrationData.value === true
    }

    // Extrair ordem das seções
    const sectionOrderData = sectionOrderResult.status === 'fulfilled' ? sectionOrderResult.value.data : null
    let sectionOrder: string[] = ['hero', 'media_showcase', 'value_package', 'social_proof', 'story', 'whatsapp_vip', 'about_us', 'contact', 'faq']
    if (sectionOrderData?.value && Array.isArray(sectionOrderData.value)) {
      sectionOrder = sectionOrderData.value
    }

    return {
      siteSettings: settingsResult.status === 'fulfilled' ? settingsResult.value.data : null,
      products: productsResult.status === 'fulfilled' ? productsResult.value.data || [] : [],
      reviews: reviewsResult.status === 'fulfilled' ? reviewsResult.value.data || [] : [],
      faqs: faqsResult.status === 'fulfilled' ? faqsResult.value.data || [] : [],
      activeLayout: layoutResult.status === 'fulfilled' ? layoutResult.value.data : null,
      combos: combosResult.status === 'fulfilled' ? combosResult.value.data || [] : [],
      whatsappVipLink: whatsappLink,
      whatsappVipRequireRegistration: requireRegistration,
      sectionOrder: sectionOrder,
      mapsLink: mapsLink,
      contactWhatsApp: contactWhatsApp,
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    // Retornar dados padrão mesmo com erro
    return {
      siteSettings: null,
      whatsappVipRequireRegistration: true,
      sectionOrder: ['hero', 'media_showcase', 'value_package', 'social_proof', 'story', 'whatsapp_vip', 'about_us', 'contact', 'faq'],
      products: [],
      reviews: [],
      faqs: [],
      activeLayout: null,
      combos: [],
      mapsLink: 'https://maps.app.goo.gl/sj7F35h9fJ86T7By6',
      contactWhatsApp: '+55 34 8413-6291',
    }
  }
}

export default async function Home() {
  const { siteSettings, products, reviews, faqs, activeLayout, combos, whatsappVipLink, whatsappVipRequireRegistration, sectionOrder, mapsLink, contactWhatsApp } = await getPageData()

  // Extrair configurações do formato key-value
  const settings = siteSettings?.value || {}

  // FAQs padrão caso não haja no banco
  const defaultFaqs = [
    {
      id: '1',
      question: 'Como faço para comprar um produto?',
      answer: 'Navegue por nossa página de produtos, escolha o item desejado e clique em "Adicionar ao Carrinho". Depois, finalize o pedido na página de checkout.',
      is_active: true,
      order_position: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      question: 'Quais são as formas de pagamento aceitas?',
      answer: 'Aceitamos cartões de crédito (em até 12x), débito, PIX e boleto bancário. Todos os pagamentos são processados de forma segura.',
      is_active: true,
      order_position: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      question: 'Qual o prazo de entrega?',
      answer: 'O prazo de entrega varia conforme sua localização. Para grandes centros urbanos, geralmente entre 3 a 7 dias úteis. Você receberá um código de rastreamento por e-mail após a postagem.',
      is_active: true,
      order_position: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      question: 'Posso trocar ou devolver um produto?',
      answer: 'Sim! Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução. O produto deve estar na embalagem original e sem uso. Consulte nossa política completa na página "Trocas e Devoluções".',
      is_active: true,
      order_position: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      question: 'Os produtos têm garantia?',
      answer: 'Sim, todos os nossos produtos possuem garantia do fabricante. O prazo e condições variam conforme o produto e estão especificados na descrição de cada item.',
      is_active: true,
      order_position: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '6',
      question: 'Como entro em contato com o suporte?',
      answer: 'Você pode entrar em contato conosco pelo WhatsApp (34) 98413-6291, pelo e-mail contato@smarttimeprime.com.br ou através da página de contato no site. Nossos horários de atendimento são: Segunda a Sexta das 09:00 às 20:00 e Sábado das 09:00 às 19:00.',
      is_active: true,
      order_position: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Usar FAQs do banco ou padrão
  const faqsToShow = faqs && faqs.length > 0 ? faqs : defaultFaqs

  // Usar configurações do layout ativo ou padrão
  const layout = activeLayout as any
  const timerEnabled = settings.timer_enabled !== undefined ? settings.timer_enabled : true
  const timerTitle = settings.timer_title || layout?.timer_title || '⚡ Black Friday - Tempo Limitado!'
  const timerEndDate = settings.timer_end_date 
    ? new Date(settings.timer_end_date as string) 
    : layout?.timer_end_date
      ? new Date(layout.timer_end_date)
      : new Date('2025-11-29T23:59:59')
  const timerBgColor = settings.timer_bg_color || layout?.timer_bg_color || '#000000'
  const timerTextColor = settings.timer_text_color || layout?.timer_text_color || '#FFFFFF'
  
  const exitPopupEnabled = settings.exit_popup_enabled !== undefined ? settings.exit_popup_enabled : true

  // Imagens do carrossel do banco de dados - usar showcase_images se disponível, senão usar showcase_image_1-4
  const showcaseImages = Array.isArray(settings.showcase_images) && settings.showcase_images.length > 0
    ? settings.showcase_images.filter(Boolean)
    : [
        settings.showcase_image_1,
        settings.showcase_image_2,
        settings.showcase_image_3,
        settings.showcase_image_4,
      ].filter(Boolean) // Remove strings vazias, mantém apenas URLs válidas
  
  // Hero Banners - usar hero_banners se disponível, senão usar hero_banner
  const heroBanners = Array.isArray(settings.hero_banners) && settings.hero_banners.length > 0
    ? settings.hero_banners.filter(Boolean)
    : settings.hero_banner
      ? [settings.hero_banner]
      : []

  // Hero Images
  const heroImages = Array.isArray(settings.hero_images) 
    ? settings.hero_images.filter(Boolean) 
    : []

  // Media Showcase Features
  const mediaFeatures = Array.isArray(settings.media_showcase_features)
    ? settings.media_showcase_features
    : []

  // Value Package Items
  const valuePackageItems = Array.isArray(settings.value_package_items)
    ? settings.value_package_items
    : []

  // Converter avaliações do dashboard para o formato Review
  const dashboardReviews = Array.isArray(settings.social_proof_reviews) && settings.social_proof_reviews.length > 0
    ? settings.social_proof_reviews.map((r: any) => ({
        id: r.id || Date.now().toString(),
        customer_name: r.customer_name || '',
        comment: r.comment || '',
        rating: r.rating || 5,
        product_id: '',
        user_id: null,
        is_approved: true,
        created_at: new Date().toISOString(),
        photo: r.photo || '',
        google_review_link: r.google_review_link || '',
      }))
    : []

  // Usar avaliações do dashboard se existirem, senão usar reviews do banco
  const reviewsToUse = dashboardReviews.length > 0 ? dashboardReviews : (reviews || [])

  // Mapeamento de seções para componentes
  const sectionComponents: Record<string, JSX.Element | null> = {
    hero: settings.section_hero_visible !== false ? (
      <HeroSection 
        key="hero"
        title={settings.hero_title || '🖤 SMART TIME PRIME — BLACK FRIDAY UBERLÂNDIA'}
        subtitle={settings.hero_subtitle || '🚨 A BLACK FRIDAY CHEGOU!\nSmartwatch Série 11 com até 50% OFF + 4 BRINDES EXCLUSIVOS\n📦 Entrega em até 24h direto do Shopping Planalto – Uberlândia/MG'}
        badgeText={settings.hero_badge_text}
        ctaText={settings.hero_cta_text || '💬 QUERO MEU SÉRIE 11 AGORA!'}
        heroButtonText={settings.hero_button_text}
        heroButtonLink={settings.hero_button_link}
        viewerCountText={settings.hero_viewer_count_text}
        viewerCountEnabled={settings.hero_viewer_count_enabled !== false}
        timerText={settings.hero_timer_text}
        backgroundColor="transparent"
        textColor={settings.hero_text_color || '#FFFFFF'}
        heroImages={heroImages}
        heroBanner={settings.hero_banner}
        heroBanners={heroBanners}
        timerEndDate={timerEnabled ? timerEndDate : undefined}
        elementOrder={Array.isArray(settings.hero_element_order) ? settings.hero_element_order : ['hero_banner_visible', 'hero_badge_visible', 'hero_title_visible', 'hero_subtitle_visible', 'hero_viewer_count', 'hero_timer_visible', 'hero_button_visible']}
        elementVisibility={{
          banner: settings.hero_banner_visible !== false,
          badge: settings.hero_badge_visible !== false,
          title: settings.hero_title_visible !== false,
          subtitle: settings.hero_subtitle_visible !== false,
          timer: settings.hero_timer_visible !== false,
          cta: settings.hero_cta_visible !== false,
          heroButton: settings.hero_button_visible !== false,
          viewerCount: true,
        }}
      />
    ) : null,
    media_showcase: settings.section_media_showcase_visible !== false ? (
      <MediaShowcase 
        key="media_showcase"
        title={settings.media_showcase_title || '💡 TECNOLOGIA, ESTILO E PRATICIDADE — TUDO NO SEU PULSO'}
        images={showcaseImages}
        videoUrl={settings.showcase_video_url || ""}
        videoCaption={settings.showcase_video_caption}
        features={mediaFeatures}
        elementVisibility={{
          title: settings.media_showcase_title_visible !== false,
          features: settings.media_showcase_features_visible !== false,
          images: settings.media_showcase_images_visible !== false,
          video: settings.media_showcase_video_visible !== false,
        }}
      />
    ) : null,
    value_package: settings.section_value_package_visible !== false ? (
      <ValuePackage
        key="value_package"
        title={settings.value_package_title}
        image={settings.value_package_image}
        items={valuePackageItems}
        totalPrice={settings.value_package_total_price}
        salePrice={settings.value_package_sale_price}
        deliveryText={settings.value_package_delivery_text}
        buttonText={settings.value_package_button_text}
        useCustomLink={settings.value_package_use_custom_link}
        buttonLink={settings.value_package_button_link}
        endDate={timerEnabled ? timerEndDate : undefined}
        elementVisibility={{
          title: settings.value_package_title_visible !== false,
          image: settings.value_package_image_visible !== false,
          items: settings.value_package_items_visible !== false,
          prices: settings.value_package_prices_visible !== false,
          timer: settings.value_package_timer_visible !== false,
          button: settings.value_package_button_visible !== false,
        }}
      />
    ) : null,
    social_proof: settings.section_social_proof_visible !== false ? (
      <SocialProof
        key="social_proof"
        reviews={reviewsToUse as any}
        title={settings.social_proof_title}
        googleIcon={settings.social_proof_google_icon !== undefined ? settings.social_proof_google_icon : true}
        allowPhotos={settings.social_proof_allow_photos !== undefined ? settings.social_proof_allow_photos : true}
        testimonialCount={settings.social_proof_testimonial_count}
        elementVisibility={{
          title: settings.social_proof_title_visible !== false,
          reviews: settings.social_proof_reviews_visible !== false,
        }}
      />
    ) : null,
    story: settings.section_story_visible !== false ? (
      <StorySection
        key="story"
        title={settings.story_title}
        content={settings.story_content}
        images={settings.story_images}
        image={settings.story_image}
        foundersNames={settings.story_founders_names}
        elementVisibility={{
          title: settings.story_title_visible !== false,
          content: settings.story_content_visible !== false,
          images: settings.story_images_visible !== false,
        }}
      />
    ) : null,
    whatsapp_vip: settings.section_whatsapp_vip_visible !== false ? (
      <WhatsAppVipRegistration 
        key="whatsapp_vip"
        whatsappGroupLink={whatsappVipLink} 
        requireRegistration={whatsappVipRequireRegistration}
      />
    ) : null,
    about_us: settings.section_about_us_visible !== false ? (
      <AboutUsSection
        key="about_us"
        title={settings.about_us_title}
        description={settings.about_us_description}
        storeImages={settings.about_us_store_images}
        storeImage={settings.about_us_store_image}
        foundersNames={settings.about_us_founders_names}
        location={settings.about_us_location}
        elementVisibility={{
          title: settings.about_us_title_visible !== false,
          description: settings.about_us_description_visible !== false,
          images: settings.about_us_images_visible !== false,
          location: settings.about_us_location_visible !== false,
        }}
      />
    ) : null,
    contact: settings.section_contact_visible !== false ? (
      <ContactSection
        key="contact"
        title={settings.contact_title}
        description={settings.contact_description}
        mapsLink={settings.contact_maps_link || mapsLink}
        whatsapp={settings.contact_whatsapp || contactWhatsApp}
        email={settings.contact_email}
        scheduleWeekdays={settings.contact_schedule_weekdays}
        scheduleSaturday={settings.contact_schedule_saturday}
        scheduleSunday={settings.contact_schedule_sunday}
        locationStreet={settings.contact_location_street}
        locationNeighborhood={settings.contact_location_neighborhood}
        locationCityState={settings.contact_location_city_state}
        locationZip={settings.contact_location_zip}
        elementVisibility={{
          title: settings.contact_title_visible !== false,
          description: settings.contact_description_visible !== false,
          whatsapp: settings.contact_whatsapp_visible !== false,
          email: settings.contact_email_visible !== false,
          schedule: settings.contact_schedule_visible !== false,
          location: settings.contact_location_visible !== false,
        }}
      />
    ) : null,
    faq: (settings.section_faq_visible !== false) && faqsToShow && faqsToShow.length > 0 ? (
      <FAQSection
        key="faq"
        faqs={faqsToShow as any}
        title={settings.faq_title || 'Perguntas Frequentes'}
        backgroundColor="transparent"
        elementVisibility={{
          title: settings.faq_title_visible !== false,
        }}
      />
    ) : null,
  }

  return (
    <>
      {/* Global Background - Apenas na página inicial */}
      
      {/* Conteúdo com z-index acima do background */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Auth Redirect Handler */}
        <AuthRedirect />
      
      {/* Botão Fixo do WhatsApp */}
      <WhatsAppFloat 
        phoneNumber={settings.whatsapp_float_number || '5534984136291'}
        message={settings.whatsapp_float_message || 'Olá! Gostaria de saber mais sobre os produtos.'}
      />
      
      {/* 1. Fixed Timer + Exit Popup (Elementos Persistentes) */}
      {timerEnabled && timerEndDate && (
        <FixedTimer
          endDate={timerEndDate}
          backgroundColor={settings.fixed_timer_bg_color || '#000000'}
          textColor={settings.fixed_timer_text_color || '#FFFFFF'}
        />
      )}
      {exitPopupEnabled && timerEnabled && timerEndDate && (
        <ExitPopup
          endDate={timerEndDate}
          title={settings.exit_popup_title}
          message={settings.exit_popup_message}
          buttonText={settings.exit_popup_button_text}
          whatsappNumber={settings.exit_popup_whatsapp_number}
        />
      )}

      {/* Renderizar seções na ordem definida com transições */}
      {(() => {
        // Filtrar apenas seções visíveis
        const visibleSections = sectionOrder.filter(id => sectionComponents[id] !== null)
        
        // Obter cores de fundo das seções
        const getSectionBgColor = (id: string): string => {
          const colorMap: Record<string, string> = {
            hero: '#000000', // Preto para hero (texto branco)
            media_showcase: '#ffffff',
            value_package: '#ffffff',
            social_proof: '#000000', // Preto para social proof (texto branco)
            story: '#ffffff',
            whatsapp_vip: '#10b981', // Verde para WhatsApp VIP
            about_us: '#ffffff',
            contact: '#ffffff',
            faq: '#000000', // Preto para FAQ (texto branco)
          }
          return colorMap[id] || '#ffffff'
        }

        return visibleSections.map((sectionId, index) => {
          const section = sectionComponents[sectionId]
          if (!section) return null

          const isFirst = index === 0
          const isLast = index === visibleSections.length - 1
          const previousSectionId = index > 0 ? visibleSections[index - 1] : null
          const nextSectionId = index < visibleSections.length - 1 ? visibleSections[index + 1] : null

          return (
            <SectionTransition
              key={sectionId}
              backgroundColor={getSectionBgColor(sectionId)}
              previousBgColor={previousSectionId ? getSectionBgColor(previousSectionId) : undefined}
              nextBgColor={nextSectionId ? getSectionBgColor(nextSectionId) : undefined}
              isFirst={isFirst}
              isLast={isLast}
            >
              {section}
            </SectionTransition>
          )
        })
      })()}

      {/* CTA Section */}
      <SectionTransition
        backgroundColor="transparent"
        previousBgColor="#ffffff"
        isLast={true}
      >
        <section className="py-20 text-white mb-0" style={{ backgroundColor: 'transparent' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Encontre o Produto Perfeito para Você
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Explore nossa coleção completa com produtos exclusivos e de qualidade premium.
            </p>
            <a
              href="/produtos"
              className="inline-block bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Ver Todos os Produtos
            </a>
          </div>
        </section>
      </SectionTransition>
      </div>
    </>
  )
}
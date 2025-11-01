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
import { createServerClient } from '@/lib/supabase/server'

export const revalidate = 60 // Revalidar a cada 60 segundos

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
          product:products (id, name, local_price, images)
        )
      `).eq('is_featured', true).eq('is_active', true).limit(6),
      supabase.from('site_settings').select('value').eq('key', 'whatsapp_vip_group_link').maybeSingle(),
    ])

    const [settingsResult, productsResult, reviewsResult, faqsResult, layoutResult, combosResult, whatsappLinkResult] = results

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

    return {
      siteSettings: settingsResult.status === 'fulfilled' ? settingsResult.value.data : null,
      products: productsResult.status === 'fulfilled' ? productsResult.value.data || [] : [],
      reviews: reviewsResult.status === 'fulfilled' ? reviewsResult.value.data || [] : [],
      faqs: faqsResult.status === 'fulfilled' ? faqsResult.value.data || [] : [],
      activeLayout: layoutResult.status === 'fulfilled' ? layoutResult.value.data : null,
      combos: combosResult.status === 'fulfilled' ? combosResult.value.data || [] : [],
      whatsappVipLink: whatsappLink,
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    // Retornar dados padrão mesmo com erro
    return {
      siteSettings: null,
      products: [],
      reviews: [],
      faqs: [],
      activeLayout: null,
      combos: [],
    }
  }
}

export default async function Home() {
  const { siteSettings, products, reviews, faqs, activeLayout, combos, whatsappVipLink } = await getPageData()

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
  const timerTitle = settings.timer_title || layout?.timer_title || '⚡ Black Friday - Tempo Limitado!'
  const timerEndDate = settings.timer_end_date 
    ? new Date(settings.timer_end_date as string) 
    : layout?.timer_end_date
      ? new Date(layout.timer_end_date)
      : new Date('2025-11-29T23:59:59')
  const timerBgColor = settings.timer_bg_color || layout?.timer_bg_color || '#000000'
  const timerTextColor = settings.timer_text_color || layout?.timer_text_color || '#FFFFFF'

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

  return (
    <div>
      {/* Auth Redirect Handler */}
      <AuthRedirect />
      
      {/* 1. Fixed Timer + Exit Popup (Elementos Persistentes) */}
      {timerEndDate && (
        <>
          <FixedTimer
            endDate={timerEndDate}
            backgroundColor={settings.fixed_timer_bg_color || '#000000'}
            textColor={settings.fixed_timer_text_color || '#FFFFFF'}
          />
          <ExitPopup
            endDate={timerEndDate}
            title={settings.exit_popup_title}
            message={settings.exit_popup_message}
            buttonText={settings.exit_popup_button_text}
            whatsappNumber={settings.exit_popup_whatsapp_number}
          />
        </>
      )}

      {/* 2. Hero Section (Banner de Abertura) */}
      <HeroSection 
        title={settings.hero_title || '🖤 SMART TIME PRIME — BLACK FRIDAY UBERLÂNDIA'}
        subtitle={settings.hero_subtitle || '🚨 A BLACK FRIDAY CHEGOU!\nSmartwatch Série 11 com até 50% OFF + 4 BRINDES EXCLUSIVOS\n📦 Entrega em até 24h direto do Shopping Planalto – Uberlândia/MG'}
        badgeText={settings.hero_badge_text}
        ctaText={settings.hero_cta_text || '💬 QUERO MEU SÉRIE 11 AGORA!'}
        ctaLink={settings.hero_cta_link}
        backgroundColor={settings.hero_bg_color || '#000000'}
        textColor={settings.hero_text_color || '#FFFFFF'}
        heroImages={heroImages}
        heroBanner={settings.hero_banner}
        heroBanners={heroBanners}
        timerEndDate={timerEndDate}
      />

      {/* 3. Product Photos and Video (Fotos e Vídeo do Produto) */}
      <MediaShowcase 
        title={settings.media_showcase_title || '💡 TECNOLOGIA, ESTILO E PRATICIDADE — TUDO NO SEU PULSO'}
        images={showcaseImages}
        videoUrl={settings.showcase_video_url || ""}
        features={mediaFeatures}
      />

      {/* 4. Value Package (Pacote de Valor - Oferta + Benefícios) */}
      <ValuePackage
        title={settings.value_package_title}
        image={settings.value_package_image}
        items={valuePackageItems}
        totalPrice={settings.value_package_total_price}
        salePrice={settings.value_package_sale_price}
        deliveryText={settings.value_package_delivery_text}
        buttonText={settings.value_package_button_text}
        whatsappGroupLink={settings.value_package_whatsapp_group_link}
        whatsappNumber={settings.value_package_whatsapp_number}
        stockText={settings.value_package_stock_text}
        discountText={settings.value_package_discount_text}
        promotionText={settings.value_package_promotion_text}
        endDate={timerEndDate}
      />

      {/* 5. Customer Reviews (Avaliações de Clientes) */}
      <SocialProof
        reviews={reviews as any || []}
        title={settings.social_proof_title}
        googleIcon={settings.social_proof_google_icon !== undefined ? settings.social_proof_google_icon : true}
        allowPhotos={settings.social_proof_allow_photos !== undefined ? settings.social_proof_allow_photos : true}
        testimonialCount={settings.social_proof_testimonial_count}
      />

      {/* 6. Story (História) */}
      <StorySection
        title={settings.story_title}
        content={settings.story_content}
        images={settings.story_images}
        image={settings.story_image} // Fallback para compatibilidade
        foundersNames={settings.story_founders_names}
      />

      {/* 7. WhatsApp Group (Grupo do WhatsApp) */}
      <WhatsAppVipRegistration whatsappGroupLink={whatsappVipLink} />

      {/* 8. About Us (Quem Somos - apresentação da loja) */}
      <AboutUsSection
        title={settings.about_us_title}
        description={settings.about_us_description}
        storeImages={settings.about_us_store_images}
        storeImage={settings.about_us_store_image} // Fallback para compatibilidade
        foundersNames={settings.about_us_founders_names}
        location={settings.about_us_location}
      />

      {/* 9. Footer (Rodapé) - Manter seção de contato existente */}
      <section id="contato" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {settings.contact_title || 'Entre em Contato'}
            </h2>
            <p className="text-xl text-gray-600">
              {settings.contact_description || 'Estamos aqui para ajudar você!'}
            </p>
            <div className="w-24 h-1 bg-black mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* WhatsApp */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-4">Fale conosco agora</p>
              <a href="https://wa.me/5534984136291" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600 font-semibold">
                (34) 98413-6291
              </a>
            </div>

            {/* Email */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-gray-600 mb-4">Envie uma mensagem</p>
              <a href="mailto:contato@smarttimeprime.com.br" className="text-blue-500 hover:text-blue-600 font-semibold text-xs block">
                contato@smarttimeprime.com.br
              </a>
            </div>

            {/* Horário */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Horário</h3>
              <p className="text-gray-600 text-sm mb-1">Segunda a Sexta</p>
              <p className="font-semibold">09:00 - 20:00</p>
              <p className="text-gray-600 text-sm mt-2">Sábado</p>
              <p className="font-semibold">09:00 - 19:00</p>
              <p className="text-gray-600 text-sm mt-2">Domingo</p>
              <p className="font-semibold text-red-600">Fechado</p>
            </div>

            {/* Localização */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Localização</h3>
              <p className="text-gray-700 text-sm font-medium mb-1">Av. Imbaúba, 1676</p>
              <p className="text-gray-600 text-xs mb-1">Chácaras Tubalina e Quartel</p>
              <p className="text-gray-700 text-sm font-medium">Uberlândia - MG</p>
              <p className="text-gray-600 text-xs">CEP: 38413-108</p>
              <a 
                href="https://maps.app.goo.gl/sj7F35h9fJ86T7By6" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-3 text-red-500 hover:text-red-600 font-semibold text-xs"
              >
                Ver no Mapa →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection faqs={faqsToShow as any} />


      {/* CTA Section */}
      <section className="py-20 bg-black text-white mb-0">
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
    </div>
  )
}
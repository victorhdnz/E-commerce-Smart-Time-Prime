import { HeroSection } from '@/components/landing/HeroSection'
import { MediaShowcase } from '@/components/landing/MediaShowcase'
import { TimerSection } from '@/components/landing/TimerSection'
import { FeaturedProducts } from '@/components/landing/FeaturedProducts'
import { FeaturedCombos } from '@/components/landing/FeaturedCombos'
import { SocialProof } from '@/components/landing/SocialProof'
import { FAQSection } from '@/components/landing/FAQSection'
import { AuthRedirect } from '@/components/landing/AuthRedirect'
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
    ])

    const [settingsResult, productsResult, reviewsResult, faqsResult, layoutResult, combosResult] = results

    return {
      siteSettings: settingsResult.status === 'fulfilled' ? settingsResult.value.data : null,
      products: productsResult.status === 'fulfilled' ? productsResult.value.data || [] : [],
      reviews: reviewsResult.status === 'fulfilled' ? reviewsResult.value.data || [] : [],
      faqs: faqsResult.status === 'fulfilled' ? faqsResult.value.data || [] : [],
      activeLayout: layoutResult.status === 'fulfilled' ? layoutResult.value.data : null,
      combos: combosResult.status === 'fulfilled' ? combosResult.value.data || [] : [],
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
  const { siteSettings, products, reviews, faqs, activeLayout, combos } = await getPageData()

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

  // Imagens do carrossel do banco de dados - apenas imagens do Cloudinary
  const showcaseImages = [
    settings.showcase_image_1,
    settings.showcase_image_2,
    settings.showcase_image_3,
    settings.showcase_image_4,
  ].filter(Boolean) // Remove strings vazias, mantém apenas URLs válidas

  return (
    <div>
      {/* Auth Redirect Handler */}
      <AuthRedirect />
      
      {/* Hero Section */}
      <HeroSection 
        title={settings.hero_title || 'Elegância e Precisão em Cada Instante'}
        subtitle={settings.hero_subtitle || 'Descubra nossa coleção exclusiva de relógios premium'}
        ctaText={settings.hero_cta_text || 'Ver Coleção'}
        backgroundColor={settings.hero_bg_color || '#000000'}
        textColor={settings.hero_text_color || '#FFFFFF'}
      />

      {/* Media Showcase - Carrossel e Reels */}
      <MediaShowcase 
        images={showcaseImages}
        videoUrl={settings.showcase_video_url || ""}
      />

      {/* Timer Section */}
      {timerEndDate && (
        <TimerSection
          title={timerTitle}
          endDate={timerEndDate}
          backgroundColor={timerBgColor}
          textColor={timerTextColor}
        />
      )}

      {/* Featured Products */}
      {products && products.length > 0 && (
        <FeaturedProducts
          products={products as any}
          title="Produtos em Destaque"
          subtitle="Descubra nossa coleção exclusiva de relógios premium"
        />
      )}

      {/* Featured Combos */}
      {combos && combos.length > 0 && (
        <FeaturedCombos
          combos={combos as any}
          title="Combos Promocionais"
          subtitle="Economize mais comprando nossos kits exclusivos com desconto especial"
        />
      )}

      {/* Social Proof */}
      <SocialProof reviews={reviews as any || []} />

      {/* About Section */}
      <section id="sobre" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {settings.about_title || 'Sobre a Smart Time Prime'}
              </h2>
              <p className="text-lg text-gray-700 mb-6 whitespace-pre-line">
                {settings.about_description || 'Somos especialistas em relógios premium, oferecendo as melhores marcas e modelos com design moderno e tecnologia de ponta.'}
              </p>
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-2">10+</div>
                  <div className="text-sm text-gray-600">Anos no Mercado</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-2">50k+</div>
                  <div className="text-sm text-gray-600">Clientes Felizes</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-2">100%</div>
                  <div className="text-sm text-gray-600">Garantia Original</div>
                </div>
              </div>
            </div>
            {settings.about_image ? (
              <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={settings.about_image}
                  alt="Sobre nós"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-8xl mb-4">⌚</div>
                    <p className="text-2xl font-semibold">Elegância Atemporal</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection faqs={faqsToShow as any} />

      {/* Contact Section */}
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
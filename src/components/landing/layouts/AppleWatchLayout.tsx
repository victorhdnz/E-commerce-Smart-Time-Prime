'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import Image from 'next/image'
import { trackClick } from '@/lib/utils/analytics'

// Cores por seção
interface SectionColors {
  backgroundColor: string
  textColor: string
  buttonColor: string
  buttonTextColor: string
}

interface AllSectionColors {
  hero: SectionColors
  products: SectionColors
  reasons: SectionColors
  features: SectionColors
  accessories: SectionColors
  faq: SectionColors
  cta: SectionColors
}

interface AppleWatchLayoutProps {
  content?: AppleWatchContent
  isEditing?: boolean
  sectionOrder?: string[]
  sectionVisibility?: Record<string, boolean>
  sectionColors?: AllSectionColors
  showWhatsAppButton?: boolean
  layoutId?: string
  versionId?: string | null
}

const defaultSectionColors: AllSectionColors = {
  hero: { backgroundColor: '#ffffff', textColor: '#111827', buttonColor: '#0071e3', buttonTextColor: '#ffffff' },
  products: { backgroundColor: '#f9fafb', textColor: '#111827', buttonColor: '#0071e3', buttonTextColor: '#ffffff' },
  reasons: { backgroundColor: '#ffffff', textColor: '#111827', buttonColor: '#0071e3', buttonTextColor: '#ffffff' },
  features: { backgroundColor: '#ffffff', textColor: '#111827', buttonColor: '#0071e3', buttonTextColor: '#ffffff' },
  accessories: { backgroundColor: '#ffffff', textColor: '#111827', buttonColor: '#0071e3', buttonTextColor: '#ffffff' },
  faq: { backgroundColor: '#f9fafb', textColor: '#111827', buttonColor: '#0071e3', buttonTextColor: '#ffffff' },
  cta: { backgroundColor: '#ffffff', textColor: '#111827', buttonColor: '#0071e3', buttonTextColor: '#ffffff' },
}

export interface AppleWatchContent {
  // Hero
  hero: {
    title: string
    subtitle: string
    badge?: string
  }
  // Produtos em destaque
  products: Array<{
    id: string
    name: string
    description: string
    price: string
    monthlyPrice?: string
    image: string
    colors: string[]
    badge?: string
    learnMoreLink?: string
    buyLink?: string
    learnMoreText?: string
    buyText?: string
  }>
  // Seção "Motivos para comprar"
  reasons: {
    title: string
    link: { text: string; url: string }
    items: Array<{
      title: string
      subtitle: string
      description: string
      image: string
    }>
  }
  // Seção "Conheça melhor"
  features: {
    title: string
    items: Array<{
      category: string
      title: string
      image: string
      textColor?: string
    }>
  }
  // Seção de acessórios
  accessories: {
    title: string
    link: { text: string; url: string }
    banner: {
      title: string
      description: string
      link: { text: string; url: string }
      image: string
    }
  }
  // Seção FAQ/Accordion
  faq: {
    title: string
    items: Array<{
      question: string
      answer: string
    }>
  }
  // CTA final
  cta: {
    title: string
    buttonText: string
    buttonLink: string
  }
  // Configurações gerais
  settings: {
    primaryColor: string
    accentColor: string
    backgroundColor: string
    whatsappNumber?: string
  }
}

// Conteúdo padrão para o layout Apple Watch
export const defaultAppleWatchContent: AppleWatchContent = {
  hero: {
    title: 'Smart Watch',
    subtitle: 'O mais poderoso de todos os tempos.',
    badge: 'Novo',
  },
  products: [
    {
      id: '1',
      name: 'Smart Watch Series 11',
      description: 'O parceiro ideal para cuidar da sua saúde.',
      price: 'R$ 5.499',
      monthlyPrice: 'R$ 458,25/mês',
      image: '',
      colors: ['#f5e6d8', '#e8e8e8', '#1a1a1a', '#3b82f6', '#22c55e'],
      badge: 'Novo',
      learnMoreLink: '#',
      buyLink: '#',
      learnMoreText: 'Saiba mais',
      buyText: 'Comprar',
    },
    {
      id: '2',
      name: 'Smart Watch SE 3',
      description: 'Recursos essenciais para a saúde ao seu alcance.',
      price: 'R$ 3.299',
      monthlyPrice: 'R$ 274,92/mês',
      image: '',
      colors: ['#1a1a1a', '#e8e8e8'],
      badge: 'Novo',
      learnMoreLink: '#',
      buyLink: '#',
      learnMoreText: 'Saiba mais',
      buyText: 'Comprar',
    },
  ],
  reasons: {
    title: 'Motivos para comprar seu Smart Watch aqui.',
    link: { text: 'Comprar Smart Watch', url: '#' },
    items: [
      {
        title: 'Opções de pagamento',
        subtitle: 'Compre em até 12 meses.',
        description: 'Aproveite e parcele com facilidade e conveniência.',
        image: '',
      },
      {
        title: 'Frete',
        subtitle: 'Envio por nossa conta.',
        description: 'Em todo o Brasil. Em algumas regiões, os pedidos qualificados têm envio no dia seguinte.',
        image: '',
      },
    ],
  },
  features: {
    title: 'Conheça melhor o Smart Watch.',
    items: [
      {
        category: 'Saúde',
        title: 'Sabe muito de você.\nE usa isso a seu favor.',
        image: '',
        textColor: '#ffffff',
      },
      {
        category: 'Fitness',
        title: 'Motivação inclusa.',
        image: '',
        textColor: '#ffffff',
      },
      {
        category: 'Conectividade',
        title: 'Ligado em tudo.',
        image: '',
        textColor: '#ffffff',
      },
      {
        category: 'Segurança',
        title: 'Ajuda quando você mais precisa.',
        image: '',
        textColor: '#ffffff',
      },
    ],
  },
  accessories: {
    title: 'Essenciais para o Smart Watch.',
    link: { text: 'Todos os acessórios para Smart Watch', url: '#' },
    banner: {
      title: 'Hora de mudar de ares.',
      description: 'Explore as novas pulseiras em novos materiais, estilos e cores.',
      link: { text: 'Comprar pulseiras para Smart Watch', url: '#' },
      image: '',
    },
  },
  faq: {
    title: 'Feitos um para o outro.',
    items: [
      {
        question: 'Smart Watch e iPhone',
        answer: 'Usar o Smart Watch com o iPhone abre um mundo de recursos que deixa os dois aparelhos ainda melhores. Crie uma rota personalizada com o Mapas no iPhone e baixe no relógio para usar a qualquer momento. Ou inicie um exercício de bicicleta no Smart Watch e ele aparecerá automaticamente como Atividade ao Vivo no iPhone.',
      },
      {
        question: 'Qual Smart Watch é ideal para mim?',
        answer: 'O Smart Watch Series 11 é perfeito para quem busca recursos avançados de saúde e performance. O Smart Watch SE 3 oferece os recursos essenciais com um ótimo custo-benefício.',
      },
    ],
  },
  cta: {
    title: 'Pronto para ter o seu?',
    buttonText: 'Comprar agora',
    buttonLink: '#',
  },
  settings: {
    primaryColor: '#0071e3',
    accentColor: '#f56300',
    backgroundColor: '#ffffff',
    whatsappNumber: '',
  },
}

export function AppleWatchLayout({ 
  content = defaultAppleWatchContent, 
  isEditing = false,
  sectionOrder = ['hero', 'products', 'reasons', 'features', 'accessories', 'faq', 'cta'],
  sectionVisibility = { hero: true, products: true, reasons: true, features: true, accessories: true, faq: true, cta: true },
  sectionColors = defaultSectionColors,
  showWhatsAppButton = false, // Padrão desativado - só aparece se explicitamente ativado
  layoutId,
  versionId,
}: AppleWatchLayoutProps) {
  
  // Debug WhatsApp Button
  console.log('🔍 AppleWatchLayout - WhatsApp:', {
    showWhatsAppButton,
    hasNumber: !!content.settings.whatsappNumber,
    number: content.settings.whatsappNumber,
    willShow: showWhatsAppButton === true && !!content.settings.whatsappNumber,
  })

  // Função para rastrear cliques
  const handleClick = (element: string, text?: string, url?: string) => {
    if (layoutId) {
      trackClick({
        layoutId,
        versionId,
        element,
        text,
        url,
      })
    }
  }
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)
  const featuresRef = useRef<HTMLDivElement>(null)
  
  // Merge das cores com defaults
  const colors: AllSectionColors = {
    hero: { ...defaultSectionColors.hero, ...sectionColors?.hero },
    products: { ...defaultSectionColors.products, ...sectionColors?.products },
    reasons: { ...defaultSectionColors.reasons, ...sectionColors?.reasons },
    features: { ...defaultSectionColors.features, ...sectionColors?.features },
    accessories: { ...defaultSectionColors.accessories, ...sectionColors?.accessories },
    faq: { ...defaultSectionColors.faq, ...sectionColors?.faq },
    cta: { ...defaultSectionColors.cta, ...sectionColors?.cta },
  }

  const scrollFeatures = (direction: 'left' | 'right') => {
    if (featuresRef.current) {
      const scrollAmount = 300
      featuresRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: content.settings.backgroundColor || '#ffffff' }}>
      {/* Navigation Pills - Estilo Apple */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-8 py-3 overflow-x-auto scrollbar-hide">
            {content.products.map((product, index) => (
              <a
                key={product.id}
                href={`#product-${product.id}`}
                className="flex flex-col items-center min-w-fit group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden mb-2 bg-gray-100 flex items-center justify-center">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} width={64} height={64} className="object-contain" />
                  ) : (
                    <span className="text-2xl">⌚</span>
                  )}
                </div>
                <span className="text-xs text-center whitespace-nowrap text-gray-900 group-hover:text-[var(--primary-color)]">
                  {product.name.split(' ').slice(0, 2).join(' ')}
                </span>
                {product.badge && (
                  <span className="text-[10px] text-[var(--accent-color)]">{product.badge}</span>
                )}
              </a>
            ))}
            <a href="#comparar" className="flex flex-col items-center min-w-fit group">
              <div className="w-16 h-16 rounded-lg overflow-hidden mb-2 bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">⚖️</span>
              </div>
              <span className="text-xs text-center whitespace-nowrap text-gray-900">Comparar</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {sectionVisibility.hero && (
        <section 
          className="pt-16 pb-20 px-4 text-center"
          style={{ backgroundColor: colors.hero.backgroundColor }}
        >
          <h1 
            className="text-[56px] md:text-[80px] font-semibold tracking-tight leading-none mb-2"
            style={{ color: colors.hero.textColor }}
          >
            {content.hero.title}
          </h1>
          {content.hero.subtitle && (
            <p 
              className="text-xl md:text-2xl max-w-2xl mx-auto"
              style={{ color: colors.hero.textColor, opacity: 0.7 }}
            >
              {content.hero.subtitle}
            </p>
          )}
        </section>
      )}

      {/* Products Grid */}
      {sectionVisibility.products && (
        <section className="py-8 px-4" style={{ backgroundColor: colors.products.backgroundColor }}>
          <div className="max-w-[1200px] mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {content.products.map((product) => (
                <div
                  key={product.id}
                  id={`product-${product.id}`}
                  className="rounded-3xl p-8 flex flex-col items-center text-center"
                  style={{ backgroundColor: colors.products.backgroundColor === '#f9fafb' ? '#ffffff' : 'rgba(0,0,0,0.02)' }}
                >
                {/* Product Image */}
                <div className="w-full aspect-square max-w-[300px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} width={300} height={300} className="object-contain" />
                  ) : (
                    <span className="text-8xl">⌚</span>
                  )}
                </div>

                {/* Color Options */}
                <div className="flex gap-2 mb-4">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className="w-4 h-4 rounded-full border border-gray-300 hover:scale-125 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Product Info */}
                {product.badge && (
                  <span className="text-sm text-[var(--accent-color)] font-medium mb-1">
                    {product.badge}
                  </span>
                )}
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4 max-w-xs">
                  {product.description}
                </p>
                <p className="text-gray-900 mb-1">
                  {product.monthlyPrice && (
                    <span>A partir de {product.monthlyPrice}<br /></span>
                  )}
                  <span className="text-gray-500">ou {product.price}</span>
                </p>

                {/* CTA Buttons */}
                <div className="flex gap-4 mt-6">
                  <a
                    href={product.learnMoreLink || '#'}
                    onClick={() => handleClick('product_learn_more', product.learnMoreText || 'Saiba mais', product.learnMoreLink)}
                    className="px-6 py-2.5 rounded-full text-sm font-medium transition-colors hover:opacity-90"
                    style={{ 
                      backgroundColor: colors.products.buttonColor, 
                      color: colors.products.buttonTextColor 
                    }}
                  >
                    {product.learnMoreText || 'Saiba mais'}
                  </a>
                  <a
                    href={product.buyLink || '#'}
                    onClick={() => handleClick('product_buy', product.buyText || 'Comprar', product.buyLink)}
                    className="px-6 py-2.5 text-sm font-medium transition-colors hover:opacity-70"
                    style={{ color: colors.products.buttonColor }}
                  >
                    {product.buyText || 'Comprar'} &gt;
                  </a>
                </div>
              </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reasons to Buy Section */}
      {sectionVisibility.reasons && (
        <section className="py-20 px-4" style={{ backgroundColor: colors.reasons.backgroundColor }}>
          <div className="max-w-[980px] mx-auto">
            <h2 
              className="text-[40px] md:text-[48px] font-semibold text-center mb-4 tracking-tight"
              style={{ color: colors.reasons.textColor }}
            >
              {content.reasons.title}
            </h2>
            <a
              href={content.reasons.link.url}
              onClick={() => handleClick('reasons_link', content.reasons.link.text, content.reasons.link.url)}
              className="block text-center mb-16 text-lg"
              style={{ color: colors.reasons.buttonColor }}
            >
              {content.reasons.link.text} &gt;
            </a>

            <div className="grid md:grid-cols-2 gap-6">
              {content.reasons.items.map((item, index) => (
                <div key={index} className="bg-white/50 rounded-3xl p-8">
                  <p className="text-sm mb-1" style={{ color: colors.reasons.textColor, opacity: 0.6 }}>{item.title}</p>
                  <h3 
                    className="text-2xl md:text-3xl font-semibold mb-3"
                    style={{ color: colors.reasons.textColor }}
                  >
                    {item.subtitle}
                  </h3>
                  <p className="mb-8" style={{ color: colors.reasons.textColor, opacity: 0.7 }}>
                    {item.description}
                  </p>
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} width={400} height={225} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-400/50 flex items-center justify-center">
                        <Plus className="text-gray-500" size={32} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Carousel Section */}
      {sectionVisibility.features && (
        <section className="py-20 px-4" style={{ backgroundColor: colors.features.backgroundColor }}>
          <div className="max-w-[980px] mx-auto">
            <h2 
              className="text-[40px] md:text-[48px] font-semibold text-center mb-16 tracking-tight"
              style={{ color: colors.features.textColor }}
            >
              {content.features.title}
            </h2>

            <div className="relative">
              {/* Carousel Container */}
              <div
                ref={featuresRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {content.features.items.map((feature, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[280px] h-[400px] rounded-3xl overflow-hidden relative snap-start"
                    style={{
                      backgroundColor: feature.image ? 'transparent' : '#1a1a1a',
                    }}
                  >
                    {feature.image ? (
                      <Image src={feature.image} alt={feature.title} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-b from-red-900/80 to-black" />
                    )}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-medium mb-2" style={{ color: feature.textColor || '#fff' }}>
                          {feature.category}
                        </p>
                        <h3
                          className="text-xl font-semibold whitespace-pre-line"
                          style={{ color: feature.textColor || '#fff' }}
                        >
                          {feature.title}
                        </h3>
                      </div>
                      <button className="self-end w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Plus size={20} style={{ color: feature.textColor || '#fff' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => scrollFeatures('left')}
                  className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                  style={{ borderColor: colors.features.textColor + '30' }}
                >
                  <ChevronLeft size={20} style={{ color: colors.features.textColor }} />
                </button>
                <button
                  onClick={() => scrollFeatures('right')}
                  className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                  style={{ borderColor: colors.features.textColor + '30' }}
                >
                  <ChevronRight size={20} style={{ color: colors.features.textColor }} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Accessories Section */}
      {sectionVisibility.accessories && (
        <section className="py-20 px-4" style={{ backgroundColor: colors.accessories.backgroundColor }}>
          <div className="max-w-[980px] mx-auto">
            <h2 
              className="text-[40px] md:text-[48px] font-semibold text-center mb-4 tracking-tight"
              style={{ color: colors.accessories.textColor }}
            >
              {content.accessories.title}
            </h2>
            <a
              href={content.accessories.link.url}
              onClick={() => handleClick('accessories_link', content.accessories.link.text, content.accessories.link.url)}
              className="block text-center mb-16 text-lg"
              style={{ color: colors.accessories.buttonColor }}
            >
              {content.accessories.link.text} &gt;
            </a>

            {/* Banner */}
            <div className="bg-white/50 rounded-3xl p-8 text-center">
              <h3 
                className="text-2xl md:text-3xl font-semibold mb-3"
                style={{ color: colors.accessories.textColor }}
              >
                {content.accessories.banner.title}
              </h3>
              <p className="mb-4 max-w-md mx-auto" style={{ color: colors.accessories.textColor, opacity: 0.7 }}>
                {content.accessories.banner.description}
              </p>
              <a
                href={content.accessories.banner.link.url}
                onClick={() => handleClick('accessories_banner_link', content.accessories.banner.link.text, content.accessories.banner.link.url)}
                className="inline-block mb-8"
                style={{ color: colors.accessories.buttonColor }}
              >
                {content.accessories.banner.link.text} &gt;
              </a>
              <div className="h-32 bg-gradient-to-r from-yellow-400 via-orange-500 to-blue-500 rounded-xl flex items-center justify-center">
                {content.accessories.banner.image ? (
                  <Image src={content.accessories.banner.image} alt="Pulseiras" width={400} height={128} className="object-contain h-full" />
                ) : (
                  <div className="flex gap-2">
                    {['#facc15', '#f97316', '#3b82f6', '#22c55e', '#8b5cf6'].map((color, i) => (
                      <div key={i} className="w-4 h-24 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ/Accordion Section */}
      {sectionVisibility.faq && (
        <section className="py-20 px-4" style={{ backgroundColor: colors.faq.backgroundColor }}>
          <div className="max-w-[980px] mx-auto">
            <h2 
              className="text-[40px] md:text-[48px] font-semibold text-center mb-16 tracking-tight"
              style={{ color: colors.faq.textColor }}
            >
              {content.faq.title}
            </h2>

            <div className="space-y-4">
              {content.faq.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between"
                  >
                    <span className="text-xl font-semibold" style={{ color: colors.faq.textColor }}>
                      {item.question}
                    </span>
                    <ChevronRight
                      className={`transition-transform duration-300 ${
                        expandedFaq === index ? 'rotate-90' : ''
                      }`}
                      style={{ color: colors.faq.textColor + '60' }}
                      size={24}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-8 pb-8">
                      <p className="leading-relaxed" style={{ color: colors.faq.textColor, opacity: 0.7 }}>
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      {sectionVisibility.cta && (
        <section className="py-24 px-4 text-center" style={{ backgroundColor: colors.cta.backgroundColor }}>
          <h2 
            className="text-[40px] md:text-[56px] font-semibold mb-8 tracking-tight"
            style={{ color: colors.cta.textColor }}
          >
            {content.cta.title}
          </h2>
          <a
            href={content.cta.buttonLink}
            onClick={() => handleClick('cta_button', content.cta.buttonText, content.cta.buttonLink)}
            className="inline-block px-10 py-4 rounded-full text-lg font-medium transition-all hover:scale-105"
            style={{ 
              backgroundColor: colors.cta.buttonColor,
              color: colors.cta.buttonTextColor 
            }}
          >
            {content.cta.buttonText}
          </a>
        </section>
      )}

      {/* WhatsApp Float Button - só aparece se showWhatsAppButton for explicitamente true */}
      {showWhatsAppButton === true && content.settings.whatsappNumber && (
        <a
          href={`https://wa.me/${content.settings.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick('whatsapp_button', 'WhatsApp', `https://wa.me/${content.settings.whatsappNumber}`)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}

      {/* Styles */}
      <style jsx>{`
        :root {
          --primary-color: ${content.settings.primaryColor};
          --accent-color: ${content.settings.accentColor};
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}


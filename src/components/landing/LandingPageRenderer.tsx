'use client'

import { LandingLayout, LandingVersion } from '@/types'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LandingPageRendererProps {
  layout: LandingLayout
  version: LandingVersion | null
}

export function LandingPageRenderer({ layout, version }: LandingPageRendererProps) {
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    
    // Registrar page_view no analytics
    const sessionId = typeof window !== 'undefined' 
      ? sessionStorage.getItem('session_id') || `session_${Date.now()}_${Math.random()}`
      : null

    if (sessionId && typeof window !== 'undefined') {
      sessionStorage.setItem('session_id', sessionId)
      
      // Registrar analytics de forma assíncrona
      supabase
        .from('landing_analytics')
        .insert({
          layout_id: layout.id,
          version_id: version?.id || null,
          session_id: sessionId,
          event_type: 'page_view',
          event_data: {
            url: window.location.href,
            referrer: document.referrer,
          },
          user_agent: navigator.userAgent,
          referrer: document.referrer,
        })
        .then(() => {
          // Analytics registrado
        })
        .catch((error) => {
          console.error('Erro ao registrar analytics:', error)
        })
    }

    // Tracking de scroll
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const scrollDepth = Math.round(
          ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
        )
        
        if (sessionId) {
          supabase
            .from('landing_analytics')
            .insert({
              layout_id: layout.id,
              version_id: version?.id || null,
              session_id: sessionId,
              event_type: 'scroll',
              event_data: {
                scroll_depth: scrollDepth,
              },
            })
            .catch(console.error)
        }
      }, 500)
    }

    // Tracking de tempo na página
    const startTime = Date.now()
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000)
      if (sessionId && timeOnPage > 5) {
        supabase
          .from('landing_analytics')
          .insert({
            layout_id: layout.id,
            version_id: version?.id || null,
            session_id: sessionId,
            event_type: 'time_on_page',
            event_data: {
              time_seconds: timeOnPage,
            },
          })
          .catch(console.error)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearTimeout(scrollTimeout)
    }
  }, [layout.id, version?.id, supabase])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  // Aplicar estilos customizados da versão ou layout
  const styles = version?.custom_styles || {}
  const themeColors = layout.theme_colors || {}
  const fonts = styles.fonts || layout.default_fonts || {}

  // Aplicar fontes via CSS variables
  const fontStyles: Record<string, string> = {}
  if (fonts.heading) {
    fontStyles['--font-heading'] = fonts.heading
  }
  if (fonts.body) {
    fontStyles['--font-body'] = fonts.body
  }
  if (fonts.button) {
    fontStyles['--font-button'] = fonts.button
  }

  // Aplicar cores via CSS variables
  const colorStyles: React.CSSProperties & Record<string, string> = {
    ...fontStyles,
    '--color-primary': styles.colors?.primary || themeColors.primary || '#000000',
    '--color-secondary': styles.colors?.secondary || themeColors.secondary || '#ffffff',
    '--color-accent': styles.colors?.accent || themeColors.accent || '#FFD700',
    '--color-background': styles.colors?.background || themeColors.background || '#ffffff',
    '--color-text': styles.colors?.text || themeColors.text || '#000000',
    '--color-button': styles.colors?.button || themeColors.button || '#000000',
    '--color-button-text': styles.colors?.buttonText || themeColors.buttonText || '#ffffff',
  } as React.CSSProperties & Record<string, string>

  // Renderizar seções baseado na configuração
  const sectionsConfig = version?.sections_config || {}

  return (
    <div style={colorStyles} className="min-h-screen">
      {/* Aplicar fontes via classes Tailwind ou inline */}
      <style jsx global>{`
        :root {
          ${fonts.heading ? `--font-heading: ${fonts.heading};` : ''}
          ${fonts.body ? `--font-body: ${fonts.body};` : ''}
          ${fonts.button ? `--font-button: ${fonts.button};` : ''}
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-heading, inherit);
        }
        body {
          font-family: var(--font-body, inherit);
        }
        button, .btn {
          font-family: var(--font-button, inherit);
        }
      `}</style>

      {/* Renderizar conteúdo baseado no tipo de layout */}
      {layout.slug === 'apple-watch' ? (
        <AppleWatchLayout sectionsConfig={sectionsConfig} />
      ) : (
        <DefaultLayout 
          layout={layout} 
          version={version} 
          sectionsConfig={sectionsConfig} 
        />
      )}
    </div>
  )
}

// Layout padrão (usando componentes existentes)
function DefaultLayout({ 
  layout, 
  version, 
  sectionsConfig 
}: { 
  layout: LandingLayout
  version: LandingVersion | null
  sectionsConfig: Record<string, any>
}) {
  // Por enquanto, renderizar uma estrutura básica
  // Depois vamos integrar com os componentes existentes
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="container mx-auto px-4 py-20">
        <h1 
          className="text-4xl font-bold mb-4"
          style={{ 
            color: 'var(--color-text)',
            fontFamily: 'var(--font-heading, inherit)'
          }}
        >
          {layout.name}
        </h1>
        {layout.description && (
          <p 
            className="text-lg mb-8"
            style={{ 
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body, inherit)'
            }}
          >
            {layout.description}
          </p>
        )}
        {version && (
          <div className="mt-8">
            <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
              Versão: {version.name}
            </p>
          </div>
        )}
        <p className="mt-8 text-sm opacity-50" style={{ color: 'var(--color-text)' }}>
          Componentes de seções serão renderizados aqui baseado na configuração.
        </p>
      </div>
    </div>
  )
}

// Layout inspirado na Apple Watch
function AppleWatchLayout({ sectionsConfig }: { sectionsConfig: Record<string, any> }) {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex flex-col items-center justify-center relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-7xl md:text-9xl font-extralight mb-6 tracking-tighter leading-none">
            Apple Watch
          </h1>
          <p className="text-2xl md:text-3xl font-light mb-12 opacity-90 tracking-tight">
            O mais poderoso Apple Watch<br />de todos os tempos.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#"
              className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 text-lg font-medium min-w-[140px]"
            >
              Comprar
            </a>
            <a
              href="#"
              className="px-8 py-3 border border-white/30 text-white rounded-full hover:bg-white/10 transition-all duration-300 text-lg font-medium min-w-[140px]"
            >
              Saiba mais
            </a>
          </div>
          
          {/* Price */}
          <p className="mt-8 text-lg opacity-70">
            A partir de R$ 2.999
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section - Grid Layout */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-light text-center mb-20 tracking-tight">
            Recursos que fazem a diferença
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: '⌚',
                title: 'Design Premium',
                description: 'Materiais de alta qualidade e acabamento impecável.',
              },
              {
                icon: '🔋',
                title: 'Bateria de Longa Duração',
                description: 'Até 48 horas de uso contínuo com uma única carga.',
              },
              {
                icon: '💪',
                title: 'Resistente à Água',
                description: 'Proteção IP68 para uso em qualquer situação.',
              },
              {
                icon: '📱',
                title: 'Conectividade Total',
                description: 'Wi-Fi, Bluetooth e GPS integrados.',
              },
              {
                icon: '❤️',
                title: 'Monitoramento de Saúde',
                description: 'Acompanhe seu coração, sono e atividades físicas.',
              },
              {
                icon: '⚡',
                title: 'Performance',
                description: 'Processador de última geração para máxima velocidade.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-light mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-lg opacity-70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Showcase */}
      <section className="py-32 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-12 tracking-tight">
            Design que impressiona
          </h2>
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-black rounded-2xl flex items-center justify-center">
            <p className="text-2xl opacity-50">Imagem do produto aqui</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-8 tracking-tight">
            Pronto para começar?
          </h2>
          <p className="text-xl opacity-80 mb-12">
            Escolha o Apple Watch perfeito para você.
          </p>
          <a
            href="#"
            className="inline-block px-12 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 text-xl font-medium"
          >
            Ver Modelos
          </a>
        </div>
      </section>
    </div>
  )
}


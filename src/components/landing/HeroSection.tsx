'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { BannerCarousel } from './BannerCarousel'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  heroButtonText?: string
  heroButtonLink?: string
  images?: string[]
  backgroundColor?: string
  textColor?: string
  badgeText?: string
  viewerCountText?: string
  timerEndDate?: Date
  heroImages?: string[]
  heroBanner?: string
  heroBanners?: string[] // Array de banners para carrossel
  elementVisibility?: {
    banner?: boolean
    badge?: boolean
    title?: boolean
    subtitle?: boolean
    timer?: boolean
    cta?: boolean
    heroButton?: boolean
  }
}

export const HeroSection = ({
  title = '🖤 SMART TIME PRIME — BLACK FRIDAY UBERLÂNDIA',
  subtitle = '🚨 A BLACK FRIDAY CHEGOU!\nSmartwatch Série 11 com até 50% OFF + 4 BRINDES EXCLUSIVOS\n📦 Entrega em até 24h direto do Shopping Planalto – Uberlândia/MG',
  ctaText = '💬 QUERO MEU SÉRIE 11 AGORA!',
  ctaLink,
  heroButtonText,
  heroButtonLink,
  images = [],
  backgroundColor, // Será ignorado, sempre usará preto
  textColor, // Será ignorado, sempre usará branco
  badgeText = '🚨 A BLACK FRIDAY CHEGOU!',
  viewerCountText,
  timerEndDate,
  heroImages = [],
  heroBanner,
  heroBanners = [],
  elementVisibility = {
    banner: true,
    badge: true,
    title: true,
    subtitle: true,
    timer: true,
    cta: true,
    heroButton: true,
  },
}: HeroSectionProps) => {
  // Cores fixas da empresa (preto e branco)
  const finalBackgroundColor = '#000000'
  const finalTextColor = '#ffffff'
  const [viewerCount, setViewerCount] = useState(15)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Simular contador de pessoas visualizando (muda a cada 20 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(Math.floor(Math.random() * 11) + 15) // Entre 15 e 25
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  // Calcular tempo restante se houver timerEndDate
  useEffect(() => {
    if (!timerEndDate) return

    const calculateTimeLeft = () => {
      const difference = timerEndDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [timerEndDate])
  // Determinar se usar carrossel ou banner único - priorizar heroBanners (array)
  // Se heroBanners tiver itens, usar apenas ele (ignorar heroBanner antigo)
  const banners = heroBanners && heroBanners.length > 0 
    ? heroBanners.filter(Boolean) 
    : (heroBanner ? [heroBanner].filter(Boolean) : [])

  return (
    <section
      style={{ backgroundColor: finalBackgroundColor, color: finalTextColor }}
      className="relative flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Banner carrossel acima do texto (1920x650) */}
      {elementVisibility.banner && banners.length > 0 && (
        <div className="w-full relative z-20">
          <BannerCarousel banners={banners} autoPlayInterval={5000} />
        </div>
      )}

      {/* Hero Images (se houver) */}
      {heroImages.length > 0 && (
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-2 gap-4 p-8">
            {heroImages.slice(0, 4).map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={img}
                  alt={`Hero ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Background Pattern - apenas na área de conteúdo de texto */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, ${finalTextColor} 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>
        <div className="flex items-center justify-center min-h-[70vh]">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl"
          >
            {/* Badge */}
            {elementVisibility.badge && badgeText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-full text-lg font-bold mb-6 shadow-2xl"
              >
                {badgeText}
              </motion.div>
            )}

            {elementVisibility.title && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              >
                {title}
              </motion.h1>
            )}

            {elementVisibility.subtitle && subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 whitespace-pre-line"
              >
                {(() => {
                  let cleanedSubtitle = subtitle
                    // Remover qualquer HTML de botão
                    .replace(/<button[^>]*>.*?<\/button>/gi, '')
                    .replace(/<a[^>]*>.*?<\/a>/gi, '')
                    // Remover texto "Garantir agora" em várias variações
                    .replace(/Garantir agora!?\s*#####/gi, '')
                    .replace(/Garantir agora!?\s*#####/gi, '')
                    .replace(/Garantir agora/gi, '')
                    .replace(/#####/g, '')
                    .replace(/!#####/g, '')
                    .replace(/!#####/g, '')
                    // Remover linhas vazias múltiplas
                    .replace(/\n\s*\n\s*\n/g, '\n\n')
                    .trim()
                  
                  // Se o subtitle limpo estiver vazio ou só tiver espaços, não renderizar
                  if (!cleanedSubtitle || cleanedSubtitle.length === 0) {
                    return null
                  }
                  
                  return cleanedSubtitle
                })()}
              </motion.p>
            )}

            {/* Contador de Pessoas e Cronômetro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col items-center justify-center gap-4 text-base md:text-lg"
            >
              {/* Card de Pessoas Visualizando com Status */}
              <motion.div
                key={viewerCount}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="relative"
              >
                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md border-2 transition-all duration-300 ${
                  viewerCount < 15
                    ? 'bg-orange-500/20 border-orange-400/50'
                    : viewerCount >= 20
                    ? 'bg-red-500/20 border-red-400/50'
                    : 'bg-green-500/20 border-green-400/50'
                }`}>
                  {/* Ícone de Fogo Animado */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="text-2xl"
                  >
                    🔥
                  </motion.div>
                  
                  {/* Número de Pessoas */}
                  <div className="flex items-center gap-2">
                    <motion.span
                      key={viewerCount}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className={`text-xl md:text-2xl font-black ${
                        viewerCount < 15
                          ? 'text-orange-300'
                          : viewerCount >= 20
                          ? 'text-red-300'
                          : 'text-green-300'
                      }`}
                    >
                      {viewerCount}
                    </motion.span>
                    <span className="text-sm md:text-base font-bold text-white">
                      pessoas vendo agora
                    </span>
                  </div>
                  
                  {/* Badge de Status */}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      viewerCount < 15
                        ? 'bg-orange-500/30 text-orange-200 border-orange-400/50'
                        : viewerCount >= 20
                        ? 'bg-red-500/30 text-red-200 border-red-400/50'
                        : 'bg-green-500/30 text-green-200 border-green-400/50'
                    }`}
                  >
                    {viewerCount < 15
                      ? 'POPULAR'
                      : viewerCount >= 20
                      ? 'ALTA DEMANDA'
                      : 'MUITA GENTE'}
                  </motion.span>
                </div>
                
                {/* Glow Effect */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl blur-xl -z-10 ${
                    viewerCount < 15
                      ? 'bg-orange-500/30'
                      : viewerCount >= 20
                      ? 'bg-red-500/30'
                      : 'bg-green-500/30'
                  }`}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </motion.div>
              
              {elementVisibility.timer && timerEndDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 relative z-20"
                >
                  <span className="text-xl">⏰</span>
                  <span className="font-semibold">
                    Oferta termina em: <span className="font-mono text-white">{String(timeLeft.days).padStart(2, '0')}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s</span>
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* CTA Button */}
            {elementVisibility.cta && ctaText && !ctaText.toLowerCase().includes('garantir agora') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-8"
              >
                {ctaLink ? (
                  <Link href={ctaLink}>
                    <Button size="lg" className="text-lg px-8 py-4">
                      {ctaText.replace(/Garantir agora!?\s*#####/gi, '').replace(/#####/g, '').trim()}
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" className="text-lg px-8 py-4">
                    {ctaText.replace(/Garantir agora!?\s*#####/gi, '').replace(/#####/g, '').trim()}
                  </Button>
                )}
              </motion.div>
            )}

            {/* Hero Button (Novo botão editável) */}
            {elementVisibility.heroButton && heroButtonText && heroButtonLink && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="mt-6 relative z-10"
              >
                <Link href={heroButtonLink} target={heroButtonLink.startsWith('http') ? '_blank' : '_self'} rel={heroButtonLink.startsWith('http') ? 'noopener noreferrer' : undefined}>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-black transition-all relative z-10">
                    {heroButtonText}
                    <ChevronRight className="ml-2" size={20} />
                  </Button>
                </Link>
                
                {/* Scroll Indicator - abaixo do botão */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 1 }}
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-6 z-50"
                >
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-2"
                    style={{ borderColor: finalTextColor }}
                  >
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: finalTextColor }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
            
            {/* Scroll Indicator - apenas se não houver botão hero */}
            {(!elementVisibility.heroButton || !heroButtonText || !heroButtonLink) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-2"
                  style={{ borderColor: finalTextColor }}
                >
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: finalTextColor }}
                  />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}


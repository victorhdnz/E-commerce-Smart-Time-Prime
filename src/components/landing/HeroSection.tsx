'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  images?: string[]
  backgroundColor?: string
  textColor?: string
  badgeText?: string
  viewerCountText?: string
  timerEndDate?: Date
  heroImages?: string[]
}

export const HeroSection = ({
  title = '🖤 SMART TIME PRIME — BLACK FRIDAY UBERLÂNDIA',
  subtitle = '🚨 A BLACK FRIDAY CHEGOU!\nSmartwatch Série 11 com até 50% OFF + 4 BRINDES EXCLUSIVOS\n📦 Entrega em até 24h direto do Shopping Planalto – Uberlândia/MG',
  ctaText = '💬 QUERO MEU SÉRIE 11 AGORA!',
  ctaLink,
  images = [],
  backgroundColor = '#000000',
  textColor = '#ffffff',
  badgeText = '🚨 A BLACK FRIDAY CHEGOU!',
  viewerCountText,
  timerEndDate,
  heroImages = [],
}: HeroSectionProps) => {
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
  return (
    <section
      style={{ backgroundColor, color: textColor }}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, ${textColor} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

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
        <div className="flex items-center justify-center min-h-[70vh]">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl"
          >
            {/* Badge */}
            {badgeText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-full text-lg font-bold mb-6 shadow-2xl"
              >
                {badgeText}
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 whitespace-pre-line"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mb-8"
            >
              {ctaLink && !ctaLink.startsWith('http') && !ctaLink.startsWith('https') && !ctaLink.startsWith('wa.me') ? (
                <Link href={ctaLink}>
                  <Button
                    size="lg"
                    variant={backgroundColor === '#000000' ? 'secondary' : 'primary'}
                    className="group text-xl py-6 px-12"
                  >
                    {ctaText}
                    <ChevronRight
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                      size={24}
                    />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  variant={backgroundColor === '#000000' ? 'secondary' : 'primary'}
                  className="group text-xl py-6 px-12"
                  onClick={() => {
                    if (ctaLink) {
                      window.open(ctaLink, '_blank')
                    }
                  }}
                >
                  {ctaText}
                  <ChevronRight
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                    size={24}
                  />
                </Button>
              )}
            </motion.div>

            {/* Contador de Pessoas e Cronômetro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-lg md:text-xl"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span>
                  {viewerCount} pessoas vendo agora
                </span>
              </div>
              
              {timerEndDate && (
                <>
                  <span className="hidden md:inline">|</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⏰</span>
                    <span>
                      Oferta termina em: {String(timeLeft.days).padStart(2, '0')}d{' '}
                      {String(timeLeft.hours).padStart(2, '0')}h{' '}
                      {String(timeLeft.minutes).padStart(2, '0')}m{' '}
                      {String(timeLeft.seconds).padStart(2, '0')}s
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-2"
          style={{ borderColor: textColor }}
        >
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: textColor }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}


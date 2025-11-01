'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BannerCarouselProps {
  banners?: string[]
  autoPlayInterval?: number // em milissegundos, padrão 5000ms (5 segundos)
}

export const BannerCarousel = ({ 
  banners = [], 
  autoPlayInterval = 5000 
}: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-play apenas se houver mais de 1 banner
  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [banners.length, autoPlayInterval])

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  if (!banners || banners.length === 0) {
    return null
  }

  // Se houver apenas 1 banner, exibir estático
  if (banners.length === 1) {
    return (
      <div className="w-full relative" style={{ aspectRatio: '1920/650', minHeight: '300px' }}>
        <Image
          src={banners[0]}
          alt="Banner"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
    )
  }

  // Se houver múltiplos banners, exibir carrossel
  return (
    <div className="relative w-full group" style={{ aspectRatio: '1920/650', minHeight: '300px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={banners[currentIndex]}
            alt={`Banner ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Botões de navegação */}
      <button
        onClick={prevBanner}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
        aria-label="Banner anterior"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
        aria-label="Próximo banner"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ir para banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}


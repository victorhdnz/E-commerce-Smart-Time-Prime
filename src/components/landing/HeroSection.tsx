'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  images?: string[]
  backgroundColor?: string
  textColor?: string
}

export const HeroSection = ({
  title = 'Elegância e Precisão em Cada Instante',
  subtitle = 'Descubra nossa coleção exclusiva de relógios premium',
  ctaText = 'Ver Coleção',
  ctaLink = '/produtos',
  images = [],
  backgroundColor = '#000000',
  textColor = '#ffffff',
}: HeroSectionProps) => {
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-center min-h-[70vh]">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl mb-8 opacity-90"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link href={ctaLink}>
                <Button
                  size="lg"
                  variant={backgroundColor === '#000000' ? 'secondary' : 'primary'}
                  className="group"
                >
                  {ctaText}
                  <ChevronRight
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                    size={20}
                  />
                </Button>
              </Link>
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


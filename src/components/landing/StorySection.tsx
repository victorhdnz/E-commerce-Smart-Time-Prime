'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface StorySectionProps {
  title?: string
  content?: string
  images?: string[] // Array de imagens
  image?: string // Mantido para compatibilidade
  foundersNames?: string
}

export const StorySection = ({
  title = '✍️ NOSSA HISTÓRIA',
  content = 'A Smart Time Prime nasceu em Uberlândia com o propósito de unir estilo e tecnologia no dia a dia das pessoas.\n\nHoje somos uma das lojas mais lembradas quando o assunto é smartwatch e confiança.',
  images,
  image, // Compatibilidade com versão antiga
  foundersNames,
}: StorySectionProps) => {
  // Usar images se disponível, senão usar image como fallback
  const displayImages = images && images.length > 0 
    ? images 
    : (image ? [image] : [])
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
          <div className="w-24 h-1 bg-black mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-lg md:text-xl text-gray-700 whitespace-pre-line leading-relaxed">
              {content}
            </div>
            {foundersNames && (
              <div className="mt-6 pt-6 border-t border-gray-300">
                <p className="text-lg font-semibold text-gray-900">
                  {foundersNames}
                </p>
                <p className="text-sm text-gray-600 mt-1">Fundadores da Smart Time Prime</p>
              </div>
            )}
          </motion.div>

          {/* Imagens */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {displayImages.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {displayImages.map((img, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={img}
                      alt={`Nossa história - Foto ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-gray-600">Foto dos donos na loja</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}


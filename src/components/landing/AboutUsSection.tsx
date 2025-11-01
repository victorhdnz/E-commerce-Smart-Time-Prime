'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface AboutUsSectionProps {
  title?: string
  description?: string
  storeImages?: string[] // Array de imagens
  storeImage?: string // Mantido para compatibilidade
  foundersNames?: string
  location?: string
}

export const AboutUsSection = ({
  title = '🏪 SOBRE A SMART TIME PRIME',
  description = 'A Smart Time Prime é uma loja de tecnologia localizada em Uberlândia/MG, dentro do Shopping Planalto.\n\nSomos referência em smartwatches e acessórios tecnológicos, com atendimento humano, entrega rápida e garantia total.',
  storeImages,
  storeImage, // Compatibilidade com versão antiga
  foundersNames,
  location = 'Shopping Planalto, Uberlândia/MG',
}: AboutUsSectionProps) => {
  // Usar storeImages se disponível, senão usar storeImage como fallback
  const images = storeImages && storeImages.length > 0 
    ? storeImages 
    : (storeImage ? [storeImage] : [])
  return (
    <section className="py-20 bg-gray-50">
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

        <div className="max-w-4xl mx-auto">
          {/* Descrição */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-lg md:text-xl text-gray-700 whitespace-pre-line leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* Imagens da Loja */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-2xl mx-auto"
          >
            {images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={img}
                      alt={`Loja Smart Time Prime - Foto ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏪</div>
                  <p className="text-gray-600">Foto da loja</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}


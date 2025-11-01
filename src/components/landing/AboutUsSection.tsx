'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface AboutUsSectionProps {
  title?: string
  description?: string
  storeImage?: string
  foundersNames?: string
  location?: string
}

export const AboutUsSection = ({
  title = '🏪 SOBRE A SMART TIME PRIME',
  description = 'A Smart Time Prime é uma loja de tecnologia localizada em Uberlândia/MG, dentro do Shopping Planalto.\n\nSomos referência em smartwatches e acessórios tecnológicos, com atendimento humano, entrega rápida e garantia total.',
  storeImage,
  foundersNames,
  location = 'Shopping Planalto, Uberlândia/MG',
}: AboutUsSectionProps) => {
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

          {/* Imagem da Loja */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-2xl mx-auto"
          >
            {storeImage ? (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={storeImage}
                  alt="Loja Smart Time Prime"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏪</div>
                  <p className="text-gray-600">Foto da loja</p>
                </div>
              </div>
            )}
            <div className="mt-4 text-center">
              <p className="font-semibold text-gray-700">Nossa Loja</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


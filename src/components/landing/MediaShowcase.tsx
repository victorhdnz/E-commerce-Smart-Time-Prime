'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MediaShowcaseProps {
  images?: string[]
  videoUrl?: string
}

export const MediaShowcase = ({
  images = [],
  videoUrl,
}: MediaShowcaseProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Sempre renderizar a seção, mas mostrar placeholders se não houver conteúdo

  return (
    <section className="py-12 bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            ✨ Destaques
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          {/* Carrossel de Imagens - 1 coluna */}
          <div className="lg:col-span-1">
            {images.length > 0 ? (
              <div className="relative group">
                {/* Imagem Principal */}
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="aspect-square bg-gray-900 rounded-lg overflow-hidden"
                >
                  <img
                    src={images[currentIndex]}
                    alt={`Produto ${currentIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Botões de Navegação */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Indicadores */}
                {images.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentIndex
                            ? 'bg-accent w-8'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Miniaturas */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentIndex
                            ? 'border-accent scale-105'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-900 rounded-lg flex flex-col items-center justify-center p-8 text-center">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-gray-400 text-lg mb-2">
                  Adicione imagens no Dashboard
                </p>
                <p className="text-sm text-gray-600">
                  Configure até 4 imagens para o carrossel
                </p>
              </div>
            )}
          </div>

          {/* Vídeo Vertical (Reels) */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="sticky top-24 max-w-sm mx-auto"
            >
              <div className="bg-gradient-to-br from-accent/20 to-transparent p-1 rounded-2xl">
                <div className="bg-black rounded-xl overflow-hidden">
                  {videoUrl ? (
                    <div className="aspect-[9/16] relative">
                      <video
                        src={videoUrl}
                        controls
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                        poster="/placeholder-video.jpg"
                      >
                        Seu navegador não suporta vídeo.
                      </video>
                      
                      {/* Badge Reels */}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                        <span>▶</span> Reels
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[9/16] flex flex-col items-center justify-center text-center p-8">
                      <div className="text-6xl mb-4">🎬</div>
                      <p className="text-gray-400 mb-2">
                        Adicione um vídeo vertical
                      </p>
                      <p className="text-sm text-gray-600">
                        Formato Reels/Stories (9:16)
                      </p>
                      <p className="text-xs text-gray-700 mt-4">
                        Configure no Dashboard
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Legenda do Vídeo */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  🔥 Confira nossos lançamentos
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}


'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Review } from '@/types'
import { useEffect, useState } from 'react'

interface SocialProofProps {
  reviews: Review[]
  title?: string
}

export const SocialProof = ({
  reviews,
  title = 'O Que Nossos Clientes Dizem',
}: SocialProofProps) => {
  // Avaliações padrão
  const defaultReviews: Review[] = [
      {
        id: '1',
        customer_name: 'Maria Silva',
        rating: 5,
        comment: 'Produto excelente! Superou minhas expectativas. Entrega rápida e embalagem perfeita. Recomendo muito!',
        product_id: '',
        user_id: null,
        is_approved: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        customer_name: 'João Santos',
        rating: 5,
        comment: 'Qualidade impecável! O atendimento foi nota 10, tiraram todas as minhas dúvidas. Produto chegou em perfeito estado.',
        product_id: '',
        user_id: null,
        is_approved: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        customer_name: 'Ana Costa',
        rating: 5,
        comment: 'Adorei a compra! Chegou antes do prazo e o produto é exatamente como descrito. Estou muito satisfeita!',
        product_id: '',
        user_id: null,
        is_approved: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '4',
        customer_name: 'Carlos Mendes',
        rating: 5,
        comment: 'Excelente custo-benefício! A qualidade surpreendeu. Processo de compra muito fácil e rápido.',
        product_id: '',
        user_id: null,
        is_approved: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '5',
        customer_name: 'Juliana Oliveira',
        rating: 5,
        comment: 'Produto de altíssima qualidade. Embalagem linda e cuidadosa. Vou comprar novamente com certeza!',
        product_id: '',
        user_id: null,
        is_approved: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '6',
        customer_name: 'Roberto Alves',
        rating: 5,
        comment: 'Melhor compra que fiz! Entrega super rápida para Uberlândia. Produto impecável, muito bonito!',
        product_id: '',
        user_id: null,
        is_approved: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '7',
        customer_name: 'Fernanda Lima',
        rating: 5,
        comment: 'Amei! O produto é lindo e de excelente qualidade. Atendimento pelo WhatsApp foi rápido e atencioso.',
        product_id: '',
        user_id: null,
        is_approved: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '8',
        customer_name: 'Paulo Rodrigues',
        rating: 5,
        comment: 'Recomendo de olhos fechados! Produto top, entrega rápida e preço justo. Parabéns pelo trabalho!',
        product_id: '',
        user_id: null,
        is_approved: true,
        created_at: new Date().toISOString(),
      },
    ]
  
  // Usar reviews do banco ou padrão
  const reviewsToUse = reviews.length > 0 ? reviews : defaultReviews
  
  // Duplicar reviews para efeito infinito (3x para loop contínuo)
  const duplicatedReviews = [...reviewsToUse, ...reviewsToUse, ...reviewsToUse]

  return (
    <section className="py-20 bg-black text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Avaliações dos Clientes</h2>
          <p className="text-gray-400 text-lg">Depoimentos reais de quem já comprou conosco</p>
          <div className="w-24 h-1 bg-accent mx-auto mt-6" />
        </motion.div>

        {/* Carrossel Infinito */}
        <div className="relative overflow-hidden">
          {/* Gradiente Esquerda - apenas borda */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          
          {/* Gradiente Direita - apenas borda */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          <motion.div
            animate={{
              x: [0, -(duplicatedReviews.length / 3) * 336], // 336 = 320px width + 16px gap
            }}
            transition={{
              duration: duplicatedReviews.length * 4, // 4 segundos por review
              repeat: Infinity,
              ease: 'linear',
            }}
            className="flex gap-4"
          >
            {duplicatedReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="flex-shrink-0 w-80 bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-colors"
              >
                {/* Rating */}
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < review.rating
                          ? 'fill-accent text-accent'
                          : 'text-gray-500'
                      }
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-200 mb-4 line-clamp-3 text-sm">
                  "{review.comment}"
                </p>

                {/* Customer */}
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black font-bold text-sm">
                    {review.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-sm">{review.customer_name}</p>
                    <p className="text-xs text-gray-400">Cliente Verificado</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}


'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import Link from 'next/link'

interface ValuePackageProps {
  title?: string
  image?: string
  items?: Array<{
    name: string
    price: string
  }>
  totalPrice?: string
  salePrice?: string
  deliveryText?: string
  buttonText?: string
  whatsappGroupLink?: string
  whatsappNumber?: string
  stockText?: string
  discountText?: string
  promotionText?: string
  endDate?: Date
}

export const ValuePackage = ({
  title = '🎁 VOCÊ LEVA TUDO ISSO',
  image,
  items = [
    { name: 'Smartwatch Série 11', price: '' },
    { name: '2 Pulseiras extras', price: 'R$ 79' },
    { name: '1 Case protetor', price: 'R$ 39' },
    { name: '1 Película premium', price: 'R$ 29' },
  ],
  totalPrice = 'R$ 447',
  salePrice = 'R$ 299',
  deliveryText = '📍 Entrega em até 24h para Uberlândia',
  buttonText = '💬 GARANTIR MEU DESCONTO AGORA!',
  whatsappGroupLink,
  whatsappNumber = '5534984136291',
  stockText = '📦 Estoque limitado',
  discountText = '🎯 De R$ 499 → por R$ 299 + 4 brindes grátis!',
  promotionText = '🕒 Promoção válida enquanto durar o estoque.',
  endDate,
}: ValuePackageProps) => {
  const handleClick = () => {
    if (whatsappGroupLink) {
      window.open(whatsappGroupLink, '_blank')
    } else {
      window.open(`https://wa.me/${whatsappNumber}`, '_blank')
    }
  }

  // Calcular tempo restante se houver endDate
  const getTimeLeft = () => {
    if (!endDate) return null
    const difference = endDate.getTime() - new Date().getTime()
    if (difference <= 0) return null

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((difference / 1000 / 60) % 60)
    const seconds = Math.floor((difference / 1000) % 60)

    return { days, hours, minutes, seconds }
  }

  const timeLeft = getTimeLeft()

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
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
          {/* Imagem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {image ? (
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={image}
                  alt="Pacote completo"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gray-200 flex items-center justify-center">
                <div className="text-6xl">📦</div>
              </div>
            )}
          </motion.div>

          {/* Conteúdo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Lista de itens */}
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <span className="text-lg font-semibold">{item.name}</span>
                  </div>
                  {item.price && (
                    <span className="text-gray-600 font-medium">{item.price}</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Preço */}
            <div className="bg-black text-white rounded-2xl p-8 text-center">
              <div className="mb-4">
                <p className="text-gray-300 line-through text-xl mb-2">
                  Valor total: {totalPrice}
                </p>
                <p className="text-4xl md:text-5xl font-bold">
                  Por apenas {salePrice}
                </p>
              </div>
              <p className="text-gray-300 mb-6">{deliveryText}</p>

              <Button
                onClick={handleClick}
                size="lg"
                variant="secondary"
                className="w-full text-lg font-bold py-6"
              >
                {buttonText}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Seção de Promoção Black Friday */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white rounded-2xl p-8 md:p-12 text-center shadow-2xl border-2 border-red-900/30"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
            🔥 BLACK FRIDAY SMART TIME PRIME
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-lg md:text-xl font-semibold">{stockText}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-lg md:text-xl font-semibold">{discountText}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-lg md:text-xl font-semibold">{promotionText}</p>
            </div>
          </div>

          {/* Cronômetro se houver endDate */}
          {timeLeft && (
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl p-8 mb-6 max-w-2xl mx-auto border border-gray-700 shadow-2xl">
              <p className="text-lg font-bold text-white mb-6 text-center">⏰ Termina em:</p>
              <div className="flex items-center justify-center gap-3 md:gap-4">
                <div className="text-center bg-black/50 rounded-lg p-4 border border-gray-700 min-w-[70px]">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-1 font-mono tracking-tight">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 font-medium uppercase tracking-wide">dias</div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-red-500">:</div>
                <div className="text-center bg-black/50 rounded-lg p-4 border border-gray-700 min-w-[70px]">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-1 font-mono tracking-tight">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 font-medium uppercase tracking-wide">horas</div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-red-500">:</div>
                <div className="text-center bg-black/50 rounded-lg p-4 border border-gray-700 min-w-[70px]">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-1 font-mono tracking-tight">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 font-medium uppercase tracking-wide">min</div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-red-500">:</div>
                <div className="text-center bg-black/50 rounded-lg p-4 border border-gray-700 min-w-[70px]">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-1 font-mono tracking-tight">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 font-medium uppercase tracking-wide">seg</div>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
            size="lg"
            variant="secondary"
            className="text-lg font-bold py-6 px-12"
          >
            GARANTIR AGORA
          </Button>
        </motion.div>
      </div>
    </section>
  )
}


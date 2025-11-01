'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
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
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  // Calcular e atualizar tempo restante a cada segundo
  useEffect(() => {
    if (!endDate) {
      setTimeLeft(null)
      return
    }

    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime()

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
  }, [endDate])

  const handleClick = () => {
    if (whatsappGroupLink) {
      window.open(whatsappGroupLink, '_blank')
    } else {
      window.open(`https://wa.me/${whatsappNumber}`, '_blank')
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-300/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h2>
          <motion.div 
            className="w-32 h-1.5 bg-gradient-to-r from-transparent via-black to-transparent mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 128 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Imagem */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            {image ? (
              <motion.div 
                className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50"
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={image}
                  alt="Pacote completo"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </motion.div>
            ) : (
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-white/50">
                <motion.div 
                  className="text-8xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                >
                  📦
                </motion.div>
              </div>
            )}
            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-red-400/20 rounded-3xl blur-2xl -z-10"></div>
          </motion.div>

          {/* Conteúdo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Lista de itens */}
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="flex items-center justify-between p-5 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                >
                  <div className="flex items-center gap-4">
                    <motion.span 
                      className="text-3xl"
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        duration: 0.5,
                        delay: index * 0.2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      ✅
                    </motion.span>
                    <span className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-black transition-colors">
                      {item.name}
                    </span>
                  </div>
                  {item.price && (
                    <motion.span 
                      className="text-lg font-bold text-gray-700 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.2 }}
                    >
                      {item.price}
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Preço */}
            <motion.div 
              className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white rounded-3xl p-8 md:p-10 text-center shadow-2xl border-2 border-white/10 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-red-500/10 to-yellow-500/10 animate-pulse"></div>
              
              <div className="relative z-10">
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-gray-400 line-through text-xl mb-3 font-medium">
                    Valor total: {totalPrice}
                  </p>
                  <motion.p 
                    className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent"
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                  >
                    Por apenas {salePrice}
                  </motion.p>
                </motion.div>
                <motion.p 
                  className="text-gray-300 mb-8 text-lg font-medium"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                >
                  {deliveryText}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => {
                      const element = document.getElementById('whatsapp-vip')
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                    size="lg"
                    variant="secondary"
                    className="w-full text-base md:text-lg font-bold py-3 md:py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-300 text-black shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 border border-yellow-300/50 rounded-xl"
                  >
                    {buttonText}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Seção de Promoção Black Friday */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mt-20 relative"
        >
          {/* Background glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-3xl blur-2xl opacity-50"></div>
          
          <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl border-4 border-red-400/50 overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] repeat"></div>
            </div>
            
            <div className="relative z-10">
              <motion.h3 
                className="text-4xl md:text-6xl font-black mb-8 drop-shadow-2xl bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                🔥 BLACK FRIDAY SMART TIME PRIME
              </motion.h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { text: stockText, delay: 0.3 },
                  { text: discountText, delay: 0.4 },
                  { text: promotionText, delay: 0.5 },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: item.delay, type: 'spring', stiffness: 150 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/15 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20 shadow-md hover:bg-white/25 transition-all duration-300"
                  >
                    <p className="text-lg md:text-xl font-bold">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Cronômetro se houver endDate */}
              {timeLeft && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-8 md:p-10 mb-8 max-w-3xl mx-auto border-4 border-yellow-500/30 shadow-2xl relative overflow-hidden"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-red-500/20 to-yellow-500/20 animate-pulse"></div>
                  
                  <div className="relative z-10">
                    <motion.p 
                      className="text-xl md:text-2xl font-black text-white mb-8 text-center drop-shadow-2xl bg-gradient-to-r from-yellow-300 via-white to-yellow-300 bg-clip-text text-transparent"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ⏰ Termina em:
                    </motion.p>
                    <div className="flex items-center justify-center gap-3 md:gap-5 flex-wrap">
                      {[
                        { value: timeLeft.days, label: 'dias' },
                        { value: timeLeft.hours, label: 'horas' },
                        { value: timeLeft.minutes, label: 'min' },
                        { value: timeLeft.seconds, label: 'seg' },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3 md:gap-5">
                          <motion.div
                            key={`${item.label}-${item.value}`}
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-center bg-gradient-to-br from-black via-gray-900 to-black rounded-xl p-4 md:p-5 border-2 border-yellow-400/40 min-w-[70px] md:min-w-[90px] shadow-xl relative overflow-hidden"
                          >
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-red-500/10"></div>
                            
                            <div className="relative z-10">
                              <motion.div 
                                className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2 font-mono tracking-tight drop-shadow-lg bg-gradient-to-b from-white to-yellow-200 bg-clip-text text-transparent break-words overflow-hidden"
                                key={item.value}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                {String(item.value).padStart(2, '0')}
                              </motion.div>
                              <div className="text-[10px] md:text-xs lg:text-sm text-gray-300 font-bold uppercase tracking-wider break-words overflow-hidden">
                                {item.label}
                              </div>
                            </div>
                          </motion.div>
                          {index < 3 && (
                            <motion.div
                              className="text-3xl md:text-5xl font-bold text-yellow-400 drop-shadow-lg"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: index * 0.2 }}
                            >
                              :
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
                  size="lg"
                  variant="secondary"
                  className="text-base md:text-lg font-bold py-3 md:py-4 px-8 md:px-10 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-300 text-black shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 border border-yellow-300/50 rounded-xl"
                >
                  GARANTIR AGORA
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


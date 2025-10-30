'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Star, Percent, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/types'
import Link from 'next/link'

interface ComboItem {
  id: string
  product_id: string
  quantity: number
  product?: {
    id: string
    name: string
    local_price: number
    images: string[]
  }
}

interface Combo {
  id: string
  name: string
  description: string
  discount_percentage: number
  discount_amount: number
  final_price: number
  is_active: boolean
  is_featured: boolean
  combo_items?: ComboItem[]
}

interface FeaturedCombosProps {
  combos: Combo[]
  title?: string
  subtitle?: string
}

export const FeaturedCombos = ({
  combos,
  title = 'Combos em Destaque',
  subtitle = 'Economize mais comprando nossos kits promocionais',
}: FeaturedCombosProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { addItem } = useCart()

  if (!combos || combos.length === 0) {
    return null
  }

  // Mostrar 3 combos por vez no desktop, 2 no tablet, 1 no mobile
  const itemsPerPage = 3
  const totalPages = Math.ceil(combos.length / itemsPerPage)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const getCurrentCombos = () => {
    const start = currentIndex * itemsPerPage
    return combos.slice(start, start + itemsPerPage)
  }

  const calculateOriginalPrice = (combo: Combo) => {
    return combo.combo_items?.reduce((sum, item) => {
      return sum + (item.product?.local_price || 0) * item.quantity
    }, 0) || 0
  }

  const calculateSavings = (combo: Combo) => {
    const originalPrice = calculateOriginalPrice(combo)
    return originalPrice - combo.final_price
  }

  const handleAddComboToCart = (combo: Combo) => {
    // Adicionar cada produto do combo ao carrinho
    combo.combo_items?.forEach(item => {
      if (item.product) {
        addItem(item.product as Product, undefined, item.quantity)
      }
    })
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          <div className="w-24 h-1 bg-black mx-auto mt-6" />
        </motion.div>

        <div className="relative">
          {/* Navigation Arrows */}
          {totalPages > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                aria-label="Combo anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                aria-label="Próximo combo"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Combos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getCurrentCombos().map((combo, index) => {
            const originalPrice = calculateOriginalPrice(combo)
            const savings = calculateSavings(combo)
            const discountPercentage = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0

            return (
                <motion.div
                  key={combo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                {/* Header with Badge */}
                <div className="relative p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package size={20} />
                      <span className="text-sm font-semibold uppercase tracking-wide">Combo</span>
                    </div>
                    {combo.is_featured && (
                      <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                        <Star size={12} />
                        Destaque
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{combo.name}</h3>
                  <p className="text-green-100 text-sm">{combo.description}</p>
                </div>

                {/* Products Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {combo.combo_items?.slice(0, 4).map((item, itemIndex) => (
                      <div key={item.id} className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg overflow-hidden">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              ⌚
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          {item.quantity}x {item.product?.name?.substring(0, 15)}
                          {item.product?.name && item.product.name.length > 15 ? '...' : ''}
                        </div>
                      </div>
                    ))}
                  </div>

                  {combo.combo_items && combo.combo_items.length > 4 && (
                    <div className="text-center text-sm text-gray-500 mb-4">
                      +{combo.combo_items.length - 4} produtos adicionais
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="space-y-2 mb-4">
                    {originalPrice > combo.final_price && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Preço individual:</span>
                        <span className="text-gray-500 line-through">
                          {formatCurrency(originalPrice)}
                        </span>
                      </div>
                    )}
                    
                    {discountPercentage > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <Percent size={14} />
                          Desconto:
                        </span>
                        <span className="text-green-600 font-bold">
                          -{discountPercentage}% (Economize {formatCurrency(savings)})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Preço do combo:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(combo.final_price)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddComboToCart(combo)}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Adicionar Combo
                    </button>
                    <Link
                      href={`/combos/${combo.id}`}
                      className="px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
             })}
           </div>

           {/* Pagination Dots */}
           {totalPages > 1 && (
             <div className="flex justify-center mt-8 gap-2">
               {Array.from({ length: totalPages }).map((_, index) => (
                 <button
                   key={index}
                   onClick={() => setCurrentIndex(index)}
                   className={`w-3 h-3 rounded-full transition-colors ${
                     index === currentIndex ? 'bg-green-600' : 'bg-gray-300'
                   }`}
                   aria-label={`Ir para página ${index + 1}`}
                 />
               ))}
             </div>
           )}
         </div>


      </div>
    </section>
  )
}
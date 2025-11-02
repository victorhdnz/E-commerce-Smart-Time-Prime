'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils/format'
import { ShoppingCart, Eye, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'
import { useUserLocation } from '@/hooks/useUserLocation'
import { getProductPrice } from '@/lib/utils/price'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'

interface ProductCardProps {
  product: Product
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter()
  const mainImage = product.images?.[0] || product.colors?.[0]?.images[0]
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { isUberlandia, needsAddress, loading: locationLoading } = useUserLocation()
  const [showAddressModal, setShowAddressModal] = useState(false)

  // Atualizar quando usuário cadastrar endereço (via evento customizado)
  useEffect(() => {
    const handleAddressRegistered = () => {
      // Quando o endereço for cadastrado, recarregar a página para atualizar o preço
      if (isAuthenticated) {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    }
    
    window.addEventListener('addressRegistered', handleAddressRegistered)
    
    return () => {
      window.removeEventListener('addressRegistered', handleAddressRegistered)
    }
  }, [isAuthenticated])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Previne navegação do Link pai
    e.stopPropagation()
    
    if (product.stock === 0) {
      toast.error('Produto esgotado')
      return
    }

    addItem(product)
    
    toast.success('Produto adicionado ao carrinho!')
  }

  return (
    <Card hover className="group">
      <Link href={`/produtos/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden">
          {/* Image */}
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-6xl">⌚</span>
            </div>
          )}

          {/* Featured Badge */}
          {product.is_featured && (
            <div className="absolute top-4 left-4 bg-accent text-black px-3 py-1 rounded-full text-sm font-semibold">
              Destaque
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center gap-2">
              <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <Eye size={16} className="mr-2" />
                Ver Detalhes
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/produtos/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.short_description}
          </p>
        )}

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-2 mb-3">
            {product.colors.slice(0, 5).map((color) => (
              <div
                key={color.id}
                className="w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color.color_hex }}
                title={color.color_name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-sm text-gray-500">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {needsAddress && !locationLoading ? (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!isAuthenticated) {
                    router.push('/login')
                    return
                  }
                  setShowAddressModal(true)
                }}
                className="relative cursor-pointer group w-full text-left"
              >
                {/* Preço embaçado com design intuitivo */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative flex items-center gap-2 mb-1 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-100 hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Efeito de brilho animado */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                      repeatDelay: 1
                    }}
                  />
                  
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="relative z-10"
                  >
                    <MapPin size={18} className="text-blue-600" />
                  </motion.div>
                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-400 blur-sm select-none">
                        {formatCurrency(product.local_price || product.national_price)}
                      </span>
                      <motion.span
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className="text-sm"
                      >
                        🔓
                      </motion.span>
                    </div>
                    <p className="text-xs font-bold text-blue-600 mt-0.5 flex items-center gap-1">
                      <span>👆</span>
                      <span>Clique para revelar o preço</span>
                    </p>
                  </div>
                </motion.div>
              </button>
            ) : (
              <div>
                <span className="text-xl font-bold">
                  {locationLoading 
                    ? 'Carregando...' 
                    : formatCurrency(getProductPrice(product, isUberlandia))}
                </span>
                {!needsAddress && !locationLoading && (
                  <p className="text-xs text-gray-500 mt-1">
                    {isUberlandia ? '💚 Preço Local (Uberlândia)' : '🌐 Preço Nacional'}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all hover:scale-110 disabled:bg-gray-400 disabled:cursor-not-allowed"
            title={product.stock === 0 ? 'Produto esgotado' : 'Adicionar ao carrinho'}
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        {/* Modal para redirecionar para cadastro de endereço */}
        <Modal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          title="📍 Cadastre seu endereço"
          size="md"
        >
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} className="text-blue-600" />
              </div>
              <p className="text-lg font-semibold mb-2">
                Para ver o preço, precisamos do seu endereço
              </p>
              <p className="text-gray-600">
                Cadastre seu endereço para visualizar o preço correto baseado na sua localização:
              </p>
              <ul className="mt-4 text-left space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Uberlândia/MG:</strong> Preço local especial</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span><strong>Outras cidades:</strong> Preço nacional</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowAddressModal(false)
                  router.push('/minha-conta/enderecos')
                }}
                className="flex-1"
                size="lg"
              >
                <MapPin size={18} className="mr-2" />
                Cadastrar Endereço
              </Button>
              <Button
                onClick={() => setShowAddressModal(false)}
                variant="outline"
                size="lg"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>

        {/* Stock Status */}
        {product.stock === 0 ? (
          <p className="text-sm text-red-600 mt-2">Esgotado</p>
        ) : product.stock < 5 ? (
          <p className="text-sm text-orange-600 mt-2">
            Apenas {product.stock} em estoque
          </p>
        ) : null}
      </div>
    </Card>
  )
}


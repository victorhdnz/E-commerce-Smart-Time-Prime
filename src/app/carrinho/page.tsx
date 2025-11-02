'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useUserLocation } from '@/hooks/useUserLocation'
import { Button } from '@/components/ui/Button'
import { FadeInSection } from '@/components/ui/FadeInSection'
import { ShippingCalculator } from '@/components/shipping/ShippingCalculator'
import { formatCurrency } from '@/lib/utils/format'
import { getProductPrice } from '@/lib/utils/price'
import { Trash2, Plus, Minus, ShoppingBag, Eye, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface ShippingOption {
  id: string
  name: string
  price: number
  currency: string
  delivery_time: number
  delivery_range?: {
    min: number
    max: number
  }
  company: string
}

export default function CartPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { isUberlandia, needsAddress, loading: locationLoading } = useUserLocation()
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart()
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBag size={80} className="mx-auto mb-6 text-gray-400" />
          <h2 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-8">
            Adicione produtos ao carrinho para continuar comprando
          </p>
          <Link href="/produtos">
            <Button size="lg">Ver Produtos</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <FadeInSection>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Carrinho de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.color?.id}-${item.is_gift}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`rounded-lg shadow-md p-4 flex gap-4 ${
                  item.is_gift ? 'bg-green-50 border-2 border-green-200' : 'bg-white'
                }`}
              >
                {/* Image */}
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {item.color?.images[0] || item.product.images?.[0] ? (
                    <img
                      src={item.color?.images[0] || item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {item.is_gift ? '🎁' : '⌚'}
                    </div>
                  )}
                  {item.is_gift && (
                    <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded font-semibold">
                      BRINDE
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {item.product.name}
                      </h3>
                      {item.color && (
                        <p className="text-sm text-gray-600">
                          Cor: {item.color.color_name}
                        </p>
                      )}
                    </div>
                  </div>
                  {item.is_gift && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-green-700 font-semibold">
                        🎉 Brinde Grátis!
                      </p>
                      <p className="text-xs text-gray-600">
                        Adicionado automaticamente com sua compra
                      </p>
                    </div>
                  )}
                </div>

                {/* Quantity & Price */}
                <div className="flex flex-col items-end gap-2">
                  {/* Price */}
                  <div className="text-right">
                    {item.is_gift ? (
                      <>
                        <p className="text-sm text-gray-500 line-through">
                          {formatCurrency(item.product.local_price)}
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          GRÁTIS
                        </p>
                      </>
                    ) : needsAddress && !locationLoading ? (
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast.error('Faça login para ver o preço')
                            router.push('/login')
                            return
                          }
                          setShowAddressModal(true)
                        }}
                        className="relative cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Eye size={18} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                          <span className="text-lg font-bold text-gray-400 blur-sm select-none">
                            {formatCurrency(item.product.local_price * item.quantity)}
                          </span>
                          <MapPin size={14} className="text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Clique para revelar o preço
                        </p>
                      </button>
                    ) : (
                      <p className="text-lg font-bold">
                        {formatCurrency((getProductPrice(item.product, isUberlandia) * item.quantity))}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  {!item.is_gift && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1,
                            item.color?.id
                          )
                        }
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1,
                            item.color?.id
                          )
                        }
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}

                  {/* Remove Button */}
                  {!item.is_gift && (
                    <button
                      onClick={() => removeItem(item.product.id, item.color?.id)}
                      className="text-red-600 hover:text-red-800 mt-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Limpar Carrinho
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 space-y-6">
              <h2 className="text-2xl font-bold mb-6">Resumo do Pedido</h2>

              {/* Shipping Calculator */}
              <div className="border-b pb-6">
                <ShippingCalculator
                  onShippingSelected={setSelectedShipping}
                  selectedShipping={selectedShipping}
                />
              </div>

              {/* Order Summary */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  {needsAddress && !locationLoading ? (
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.error('Faça login para ver o preço')
                          router.push('/login')
                          return
                        }
                        setShowAddressModal(true)
                      }}
                      className="relative cursor-pointer group text-right"
                    >
                      <div className="flex items-center gap-2 justify-end">
                        <Eye size={16} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                        <span className="font-semibold text-gray-400 blur-sm select-none">
                          {formatCurrency(getTotal())}
                        </span>
                        <MapPin size={12} className="text-gray-400" />
                      </div>
                    </button>
                  ) : (
                    <span className="font-semibold">
                      {formatCurrency(items.reduce((total, item) => {
                        if (item.is_gift) return total
                        return total + (getProductPrice(item.product, isUberlandia) * item.quantity)
                      }, 0))}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-semibold text-sm">
                    {selectedShipping ? (
                      formatCurrency(selectedShipping.price)
                    ) : (
                      <span className="text-gray-500">Calcular frete</span>
                    )}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    {needsAddress && !locationLoading ? (
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast.error('Faça login para ver o preço')
                            router.push('/login')
                            return
                          }
                          setShowAddressModal(true)
                        }}
                        className="relative cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <Eye size={18} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                          <span className="text-gray-400 blur-md select-none">
                            {formatCurrency(
                              (items.reduce((total, item) => {
                                if (item.is_gift) return total
                                return total + (getProductPrice(item.product, isUberlandia) * item.quantity)
                              }, 0)) + (selectedShipping?.price ? Number(selectedShipping.price) : 0)
                            )}
                          </span>
                          <MapPin size={14} className="text-gray-400" />
                        </div>
                      </button>
                    ) : (
                      <span>
                        {formatCurrency(
                          (items.reduce((total, item) => {
                            if (item.is_gift) return total
                            return total + (getProductPrice(item.product, isUberlandia) * item.quantity)
                          }, 0)) + (selectedShipping?.price ? Number(selectedShipping.price) : 0)
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {needsAddress && !locationLoading ? (
                  <>
                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.error('Faça login para finalizar a compra')
                          router.push('/login')
                          return
                        }
                        setShowAddressModal(true)
                      }}
                    >
                      Cadastrar Endereço para Finalizar
                    </Button>
                    <p className="text-xs text-center text-gray-600">
                      É necessário cadastrar um endereço para visualizar preços e finalizar a compra
                    </p>
                  </>
                ) : (
                  <Link href="/checkout">
                    <Button size="lg" className="w-full">
                      Finalizar Compra
                    </Button>
                  </Link>
                )}

                <Link href="/produtos">
                  <Button variant="outline" size="lg" className="w-full mt-3">
                    Continuar Comprando
                  </Button>
                </Link>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="font-semibold mb-2">🔒 Compra 100% Segura</p>
                <p>Seus dados estão protegidos e criptografados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para cadastro de endereço */}
      {showAddressModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddressModal(false)
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200"
          >
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Fechar"
            >
              ✕
            </button>
            
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin size={40} className="text-blue-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Cadastre seu endereço
                </h2>
                <p className="text-gray-600">
                  Para visualizar os preços dos produtos e finalizar sua compra, precisamos do seu endereço
                </p>
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
          </div>
        </div>
      )}
    </FadeInSection>
  )
}

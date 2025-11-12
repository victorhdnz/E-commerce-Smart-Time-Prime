'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useUserLocation } from '@/hooks/useUserLocation'
import { Button } from '@/components/ui/Button'
import { FadeInSection } from '@/components/ui/FadeInSection'
import { ShippingCalculator } from '@/components/shipping/ShippingCalculator'
import { formatCurrency } from '@/lib/utils/format'
import { getProductPrice } from '@/lib/utils/price'
import { Trash2, Plus, Minus, ShoppingBag, Eye, MapPin, Package, Tag, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

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
  const { isUberlandia, needsAddress, loading: locationLoading, userAddress } = useUserLocation()
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart()
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [comboDataMap, setComboDataMap] = useState<Record<string, {
    combo: any
    items: Array<{ product: any; quantity: number }>
  }>>({})
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const supabase = createClient()

  // Carregar dados dos combos quando houver produtos de categoria "Combos"
  useEffect(() => {
    const loadComboData = async () => {
      const comboItems = items.filter(item => item.product.category === 'Combos')
      
      if (comboItems.length === 0) {
        setComboDataMap({})
        return
      }

      const newComboDataMap: Record<string, {
        combo: any
        items: Array<{ product: any; quantity: number }>
      }> = {}

      await Promise.all(
        comboItems.map(async (item) => {
          try {
            const { data: comboData, error } = await supabase
              .from('product_combos')
              .select(`
                *,
                combo_items (
                  id,
                  product_id,
                  quantity,
                  product:products (id, name, local_price, national_price, images)
                )
              `)
              .eq('slug', item.product.slug)
              .eq('is_active', true)
              .maybeSingle()

            if (!error && comboData && comboData.combo_items) {
              const comboItems = comboData.combo_items.map((comboItem: any) => ({
                product: comboItem.product,
                quantity: comboItem.quantity
              }))
              
              newComboDataMap[item.product.id] = {
                combo: comboData,
                items: comboItems
              }
            } else {
              console.log('Combo não encontrado ou sem itens:', {
                slug: item.product.slug,
                error,
                comboData
              })
            }
          } catch (error) {
            console.error('Erro ao carregar dados do combo:', error)
          }
        })
      )

      setComboDataMap(newComboDataMap)
    }

    loadComboData()
  }, [items])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Digite um código de cupom')
      return
    }

    if (!isAuthenticated) {
      toast.error('Faça login para usar cupons')
      router.push('/login')
      return
    }

    setCouponLoading(true)
    try {
      // Buscar cupom
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .single()

      if (error || !coupon) {
        toast.error('Cupom inválido ou não encontrado')
        return
      }

      // Validar cupom
      const now = new Date()
      const validFrom = new Date(coupon.valid_from)
      if (now < validFrom) {
        toast.error('Este cupom ainda não está válido')
        return
      }

      if (coupon.valid_until) {
        const validUntil = new Date(coupon.valid_until)
        if (now > validUntil) {
          toast.error('Este cupom expirou')
          return
        }
      }

      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        toast.error('Este cupom atingiu o limite de usos')
        return
      }

      // Validar valor mínimo
      const subtotal = items.reduce((total, item) => {
        if (item.is_gift) return total
        return total + (getProductPrice(item.product, isUberlandia) * item.quantity)
      }, 0)

      if (coupon.min_purchase_amount > 0 && subtotal < coupon.min_purchase_amount) {
        toast.error(`Valor mínimo de compra: ${formatCurrency(coupon.min_purchase_amount)}`)
        return
      }

      setAppliedCoupon(coupon)
      toast.success('Cupom aplicado com sucesso!')
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error)
      toast.error('Erro ao aplicar cupom')
    } finally {
      setCouponLoading(false)
    }
  }

  const calculateCouponDiscount = (subtotal: number) => {
    if (!appliedCoupon) return 0

    let discount = 0
    if (appliedCoupon.discount_type === 'percentage') {
      discount = subtotal * (appliedCoupon.discount_value / 100)
    } else {
      discount = appliedCoupon.discount_value
    }

    return discount
  }

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
            {items.map((item) => {
              const isCombo = item.product.category === 'Combos'
              const comboData = comboDataMap[item.product.id]
              const comboItems = comboData?.items || []
              
              return (
                <motion.div
                  key={`${item.product.id}-${item.color?.id}-${item.is_gift}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`rounded-lg shadow-md p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 ${
                    item.is_gift ? 'bg-green-50 border-2 border-green-200' : 
                    isCombo ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200' : 
                    'bg-white'
                  }`}
                >
                {/* Image */}
                <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {isCombo && comboItems && comboItems.length > 0 ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-1 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                        {comboItems.slice(0, 4).map((comboItem, idx) => {
                          const itemImage = Array.isArray(comboItem.product.images) 
                            ? comboItem.product.images[0] 
                            : typeof comboItem.product.images === 'string'
                              ? comboItem.product.images
                              : null
                          return (
                            <div key={idx} className="relative bg-white rounded overflow-hidden border border-gray-200">
                              {itemImage ? (
                                <Image
                                  src={itemImage}
                                  alt={comboItem.product?.name || 'Produto do combo'}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs">⌚</span>
                                </div>
                              )}
                              {comboItem.quantity > 1 && (
                                <div className="absolute top-0 right-0 bg-black/70 text-white text-[10px] px-0.5 py-0 rounded">
                                  {comboItem.quantity}x
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {comboItems.length > 4 && (
                        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
                          +{comboItems.length - 4}
                        </div>
                      )}
                    </div>
                  ) : item.color?.images[0] || item.product.images?.[0] ? (
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
                  {isCombo && (
                    <div className="absolute top-1 left-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded font-semibold flex items-center gap-1">
                      <Package size={12} />
                      Combo
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base sm:text-lg break-words">
                          {item.product.name}
                        </h3>
                        {isCombo && (
                          <span className="inline-flex items-center gap-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                            <Package size={12} />
                            Combo
                          </span>
                        )}
                      </div>
                      {item.color && (
                        <p className="text-sm text-gray-600">
                          Cor: {item.color.color_name}
                        </p>
                      )}
                      {isCombo && comboItems && comboItems.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Package size={14} className="text-green-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-green-600">Produtos incluídos:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {comboItems.slice(0, 3).map((comboItem, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded break-words">
                                {comboItem.quantity > 1 && `${comboItem.quantity}x `}{comboItem.product?.name || 'Produto'}
                              </span>
                            ))}
                            {comboItems.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                +{comboItems.length - 3} mais
                              </span>
                            )}
                          </div>
                          {comboData?.combo && (() => {
                            const discountPercentage = isUberlandia
                              ? (comboData.combo.discount_percentage_local || 0)
                              : (comboData.combo.discount_percentage_national || 0)
                            const discountAmount = isUberlandia
                              ? (comboData.combo.discount_amount_local || 0)
                              : (comboData.combo.discount_amount_national || 0)
                            
                            if (discountPercentage === 0 && discountAmount === 0) return null
                            
                            return (
                              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                <div className="text-xs space-y-1">
                                  {discountPercentage > 0 && (
                                    <p className="text-green-700 font-semibold">
                                      💰 Desconto: {discountPercentage}% OFF
                                    </p>
                                  )}
                                  {discountAmount > 0 && discountPercentage === 0 && (
                                    <p className="text-green-700 font-semibold">
                                      💰 Desconto: {formatCurrency(discountAmount)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
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
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-2 w-full sm:w-auto">
                  {/* Price */}
                  <div className="text-right sm:text-right">
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
                        className="relative cursor-pointer group text-left sm:text-right"
                      >
                        <div className="flex items-center gap-2 justify-end sm:justify-end">
                          <Eye size={18} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                          <span className="text-lg font-bold text-gray-400 blur-sm select-none">
                            {formatCurrency(item.product.local_price * item.quantity)}
                          </span>
                          <MapPin size={14} className="text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          Clique para revelar o preço
                        </p>
                      </button>
                    ) : (
                      <p className="text-lg font-bold">
                        {formatCurrency((getProductPrice(item.product, isUberlandia) * item.quantity))}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex items-center gap-2">
                    {!item.is_gift && (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              try {
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                  item.color?.id
                                )
                              } catch (error: any) {
                                toast.error(error.message || 'Erro ao atualizar quantidade')
                              }
                            }}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              try {
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                  item.color?.id
                                )
                              } catch (error: any) {
                                toast.error(error.message || 'Erro ao atualizar quantidade')
                              }
                            }}
                            className="p-1 rounded-full hover:bg-gray-100"
                            disabled={(() => {
                              const availableStock = item.color?.stock !== undefined 
                                ? item.color.stock 
                                : item.product.stock
                              return item.quantity >= availableStock
                            })()}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, item.color?.id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                </motion.div>
              )
            })}

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

              {/* Coupon Code */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-3">Cupom de Desconto</h3>
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-600">
                          {appliedCoupon.discount_type === 'percentage'
                            ? `${appliedCoupon.discount_value}% OFF`
                            : `${formatCurrency(appliedCoupon.discount_value)} OFF`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setAppliedCoupon(null)
                        setCouponCode('')
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Digite o código do cupom"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <Button
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </Button>
                  </div>
                )}
              </div>

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
                {appliedCoupon && !needsAddress && !locationLoading && (() => {
                  const subtotal = items.reduce((total, item) => {
                    if (item.is_gift) return total
                    return total + (getProductPrice(item.product, isUberlandia) * item.quantity)
                  }, 0)
                  const discount = calculateCouponDiscount(subtotal)
                  return (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({appliedCoupon.code})</span>
                      <span className="font-semibold">- {formatCurrency(discount)}</span>
                    </div>
                  )
                })()}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-gray-600">Frete</span>
                    {selectedShipping && userAddress?.cep && (
                      <span className="text-xs text-gray-500 mt-0.5">
                        CEP: {userAddress.cep.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2')}
                      </span>
                    )}
                  </div>
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
                          (() => {
                            const subtotal = items.reduce((total, item) => {
                              if (item.is_gift) return total
                              return total + (getProductPrice(item.product, isUberlandia) * item.quantity)
                            }, 0)
                            const discount = appliedCoupon ? calculateCouponDiscount(subtotal) : 0
                            const shipping = selectedShipping?.price ? Number(selectedShipping.price) : 0
                            return subtotal - discount + shipping
                          })()
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

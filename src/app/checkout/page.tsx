'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useUserLocation } from '@/hooks/useUserLocation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FadeInSection } from '@/components/ui/FadeInSection'
import { formatCurrency } from '@/lib/utils/format'
import { validateCEP, calculateShipping } from '@/lib/utils/shipping'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { MapPin, CreditCard, Truck } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { isAuthenticated, profile, loading: authLoading } = useAuth()
  const { needsAddress, loading: locationLoading } = useUserLocation()
  const { items, getTotal, clearCart } = useCart()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  })

  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  useEffect(() => {
    // Aguardar o carregamento da autenticação completar antes de verificar
    if (authLoading || locationLoading) return
    
    // Se não está autenticado após o loading completar, redirecionar com returnUrl
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent('/checkout')
      router.push(`/login?returnUrl=${returnUrl}`)
      return
    }

    // Se não tem endereço cadastrado, redirecionar para cadastro de endereço
    if (needsAddress) {
      toast.error('É necessário cadastrar um endereço para finalizar a compra')
      router.push('/minha-conta/enderecos')
    }
  }, [isAuthenticated, authLoading, needsAddress, locationLoading, router])

  useEffect(() => {
    if (items.length === 0) {
      router.push('/carrinho')
    }
  }, [items, router])

  const handleCEPChange = async (cep: string) => {
    setAddress({ ...address, cep })

    if (cep.replace(/\D/g, '').length === 8) {
      setLoading(true)
      try {
        const result = await validateCEP(cep)
        if (result.valid && result.address) {
          setAddress({
            ...address,
            cep,
            ...result.address,
          })

          // Calcular frete
          const firstProduct = items[0].product
          const shipping = await calculateShipping({
            cep,
            weight: firstProduct.weight || 0.5,
            width: firstProduct.width || 10,
            height: firstProduct.height || 10,
            length: firstProduct.length || 10,
          })
          setShippingCost(shipping.price)
          toast.success(`Frete calculado: ${formatCurrency(shipping.price)}`)
        } else {
          toast.error('CEP não encontrado')
        }
      } catch (error) {
        toast.error('Erro ao buscar CEP')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleFinishOrder = async () => {
    if (!profile?.id) {
      toast.error('Faça login para finalizar o pedido')
      return
    }

    setLoading(true)
    try {
      // Criar pedido no Supabase
      const orderNumber = `ORD-${Date.now()}`
      const subtotal = getTotal()
      const total = subtotal + (shippingCost || 0)

      // Criar pedido
      const createRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber,
          user_id: profile.id,
          subtotal,
          shipping_cost: shippingCost || 0,
          total,
          payment_method: paymentMethod,
          shipping_address: address,
          items: items.map(item => ({
            product_id: item.product.id,
            color_id: (item as any).colorId || (item as any).color?.id || null,
            quantity: item.quantity,
            unit_price: (item.product.local_price ?? (item.product as any).price ?? 0),
            subtotal: (item.product.local_price ?? (item.product as any).price ?? 0) * item.quantity,
            is_gift: (item as any).isGift || (item as any).is_gift || false,
          })),
        }),
      })
      const createJson = await createRes.json()
      if (!createRes.ok || createJson?.error) {
        throw new Error(createJson?.error || 'Erro ao criar pedido')
      }

      // Estoque já foi atualizado ao criar o pedido na API

      toast.success('Pedido realizado com sucesso!')
      clearCart()
      router.push(`/minha-conta/pedidos`)
    } catch (error: any) {
      console.error('Erro ao finalizar pedido:', error)
      toast.error(error.message || 'Erro ao finalizar pedido')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || locationLoading || items.length === 0 || needsAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  const subtotal = getTotal()
  const total = subtotal + (shippingCost || 0)

  return (
    <FadeInSection>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Endereço */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mr-3">
                <MapPin size={20} />
              </div>
              <h2 className="text-2xl font-bold">Endereço de Entrega</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="CEP"
                value={address.cep}
                onChange={(e) => handleCEPChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
              />
              <Input
                label="Número"
                value={address.number}
                onChange={(e) =>
                  setAddress({ ...address, number: e.target.value })
                }
                placeholder="123"
              />
              <Input
                label="Rua"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                placeholder="Nome da rua"
                className="md:col-span-2"
              />
              <Input
                label="Complemento"
                value={address.complement}
                onChange={(e) =>
                  setAddress({ ...address, complement: e.target.value })
                }
                placeholder="Apto, Bloco, etc."
              />
              <Input
                label="Bairro"
                value={address.neighborhood}
                onChange={(e) =>
                  setAddress({ ...address, neighborhood: e.target.value })
                }
                placeholder="Bairro"
              />
              <Input
                label="Cidade"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                placeholder="Cidade"
              />
              <Input
                label="Estado"
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </motion.div>

          {/* Step 2: Frete */}
          {shippingCost !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mr-3">
                  <Truck size={20} />
                </div>
                <h2 className="text-2xl font-bold">Frete</h2>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Entrega Padrão</p>
                    <p className="text-sm text-gray-600">5-7 dias úteis</p>
                  </div>
                  <p className="text-xl font-bold">
                    {formatCurrency(shippingCost)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Pagamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mr-3">
                <CreditCard size={20} />
              </div>
              <h2 className="text-2xl font-bold">Forma de Pagamento</h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="credit_card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">Cartão de Crédito</span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={paymentMethod === 'pix'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">PIX (5% de desconto)</span>
              </label>
            </div>
          </motion.div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleFinishOrder}
            isLoading={loading}
            disabled={!shippingCost || loading}
          >
            Finalizar Pedido
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Resumo do Pedido</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.color?.id}`}
                  className="flex gap-3"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.color?.images[0] || item.product.images?.[0] ? (
                      <img
                        src={item.color?.images[0] || item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        ⌚
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-600">
                      Qtd: {item.quantity}
                    </p>
                    {(item as any).isGift || (item as any).is_gift ? (
                      <span className="text-xs text-accent">🎁 Brinde</span>
                    ) : null}
                  </div>
                  <p className="font-semibold text-sm">
                    {(item as any).isGift || (item as any).is_gift
                      ? 'Grátis'
                      : formatCurrency(((item.product.local_price ?? (item.product as any).price ?? 0) * item.quantity))}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {shippingCost !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-semibold">
                    {formatCurrency(shippingCost)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold border-t pt-3">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </FadeInSection>
  )
}


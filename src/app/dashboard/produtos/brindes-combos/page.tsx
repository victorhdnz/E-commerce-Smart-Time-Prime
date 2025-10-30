'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Gift, Package, Trash2, Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'

interface Product {
  id: string
  name: string
  local_price: number
  images: string[]
}

interface ProductGift {
  id: string
  product_id: string
  gift_product_id: string
  gift_product?: Product
}

export default function BrindesECombosPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productGifts, setProductGifts] = useState<ProductGift[]>([])
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [availableGifts, setAvailableGifts] = useState<Product[]>([])
  const [selectedGift, setSelectedGift] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    if (!authLoading) {
      if (!isAuthenticated || !isEditor) {
        router.push('/')
        return
      }
      
      if (mounted) {
        loadProducts()
      }
    }

    return () => {
      mounted = false
    }
  }, [isAuthenticated, isEditor, authLoading])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, local_price, images')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setProducts(data || [])
      setAvailableGifts(data || [])
    } catch (error) {
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const loadProductGifts = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_gifts')
        .select(`
          id,
          product_id,
          gift_product_id,
          gift_product:products!product_gifts_gift_product_id_fkey(id, name, local_price, images)
        `)
        .eq('product_id', productId)
        .eq('is_active', true)

      if (error) throw error
      setProductGifts(data as any || [])
    } catch (error) {
      toast.error('Erro ao carregar brindes')
    }
  }

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    loadProductGifts(product.id)
  }

  const handleAddGift = async () => {
    if (!selectedProduct || !selectedGift) {
      toast.error('Selecione um brinde')
      return
    }

    try {
      const { error } = await supabase
        .from('product_gifts')
        .insert({
          product_id: selectedProduct.id,
          gift_product_id: selectedGift,
          is_active: true,
        })

      if (error) throw error

      toast.success('Brinde adicionado com sucesso!')
      setShowGiftModal(false)
      setSelectedGift('')
      loadProductGifts(selectedProduct.id)
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Este brinde já está vinculado ao produto')
      } else {
        toast.error('Erro ao adicionar brinde')
      }
    }
  }

  const handleRemoveGift = async (giftId: string) => {
    if (!confirm('Deseja remover este brinde?')) return

    try {
      const { error } = await supabase
        .from('product_gifts')
        .delete()
        .eq('id', giftId)

      if (error) throw error

      toast.success('Brinde removido')
      loadProductGifts(selectedProduct!.id)
    } catch (error) {
      toast.error('Erro ao remover brinde')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard/produtos"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold">Brindes e Combos</h1>
            <p className="text-gray-600 mt-1">
              Gerencie brindes vinculados aos produtos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista de Produtos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Produtos</h2>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          ⌚
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(product.local_price)}
                      </p>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <div className="text-black">
                        <LinkIcon size={20} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brindes do Produto Selecionado */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedProduct ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Brindes</h2>
                    <p className="text-gray-600 mt-1">{selectedProduct.name}</p>
                  </div>
                  <Button onClick={() => setShowGiftModal(true)} size="sm">
                    <Plus size={16} className="mr-2" />
                    Adicionar Brinde
                  </Button>
                </div>

                <div className="space-y-3">
                  {productGifts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Gift size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Nenhum brinde vinculado</p>
                      <p className="text-sm mt-2">
                        Adicione brindes para este produto
                      </p>
                    </div>
                  ) : (
                    productGifts.map((gift) => (
                      <div
                        key={gift.id}
                        className="p-4 border border-green-200 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                            {gift.gift_product?.images?.[0] ? (
                              <img
                                src={gift.gift_product.images[0]}
                                alt={gift.gift_product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                🎁
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                                BRINDE
                              </span>
                              <h3 className="font-semibold">
                                {gift.gift_product?.name}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 line-through">
                              {formatCurrency(gift.gift_product?.local_price || 0)}
                            </p>
                            <p className="text-sm text-green-600 font-semibold">
                              GRÁTIS
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveGift(gift.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>Selecione um produto</p>
                <p className="text-sm mt-2">
                  Selecione um produto à esquerda para gerenciar seus brindes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Adicionar Brinde */}
        <Modal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          title="Adicionar Brinde"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Selecione qual produto será enviado como brinde junto com{' '}
              <strong>{selectedProduct?.name}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium mb-2">
                Produto Brinde
              </label>
              <select
                value={selectedGift}
                onChange={(e) => setSelectedGift(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Selecione um produto</option>
                {availableGifts
                  .filter((p) => p.id !== selectedProduct?.id)
                  .map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.local_price)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddGift} className="flex-1">
                Adicionar Brinde
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowGiftModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}


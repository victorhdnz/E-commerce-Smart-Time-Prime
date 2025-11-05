'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils/format'
import { ShoppingCart, Eye, MapPin, GitCompare, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { useProductComparison } from '@/hooks/useProductComparison'
import toast from 'react-hot-toast'
import { useUserLocation } from '@/hooks/useUserLocation'
import { getProductPrice } from '@/lib/utils/price'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

interface ProductCardProps {
  product: Product
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter()
  const mainImage = product.images?.[0] || product.colors?.[0]?.images[0]
  const { addItem } = useCart()
  const { addProduct, products, canAddMore } = useProductComparison()
  const { isAuthenticated } = useAuth()
  const { isUberlandia, needsAddress, loading: locationLoading } = useUserLocation()
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [comboItems, setComboItems] = useState<Array<{ product: Product; quantity: number }>>([])
  const [isLoadingCombo, setIsLoadingCombo] = useState(false)
  const isInComparison = products.some(p => p.id === product.id)
  const isCombo = product.category === 'Combos'
  const supabase = createClient()

  // Carregar dados do combo se for um combo
  const loadComboData = async () => {
    try {
      setIsLoadingCombo(true)
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
        .eq('slug', product.slug)
        .eq('is_active', true)
        .maybeSingle()

      if (error || !comboData) {
        return
      }

      if (comboData.combo_items) {
        const items = comboData.combo_items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity
        }))
        setComboItems(items)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do combo:', error)
    } finally {
      setIsLoadingCombo(false)
    }
  }

  useEffect(() => {
    if (isCombo && product.slug) {
      loadComboData()
    }
  }, [isCombo, product.slug])

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

  // Controlar body overflow quando modal abrir/fechar
  useEffect(() => {
    if (showAddressModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showAddressModal])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Previne navegação do Link pai
    e.stopPropagation()
    
    if (product.stock === 0) {
      toast.error('Produto esgotado')
      return
    }

    // Se for um combo, adicionar todos os produtos do combo ao carrinho
    if (isCombo && comboItems.length > 0) {
      comboItems.forEach(item => {
        if (item.product) {
          addItem(item.product, undefined, item.quantity)
        }
      })
      toast.success('Combo adicionado ao carrinho!')
    } else {
      addItem(product)
      toast.success('Produto adicionado ao carrinho!')
    }
  }

  return (
    <Card hover className="group">
      <Link href={`/produtos/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden">
          {/* Combo Badge */}
          {isCombo && (
            <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <Package size={14} />
              Combo
            </div>
          )}

          {/* Image or Combo Preview */}
          {isCombo && comboItems.length > 0 ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-2 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-1 w-full h-full">
                {comboItems.slice(0, 4).map((item, idx) => {
                  const itemImage = Array.isArray(item.product.images) 
                    ? item.product.images[0] 
                    : typeof item.product.images === 'string'
                      ? item.product.images
                      : null
                  return (
                    <div key={idx} className="relative bg-white rounded-lg overflow-hidden border border-gray-200">
                      {itemImage ? (
                        <Image
                          src={itemImage}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-2xl">⌚</span>
                        </div>
                      )}
                      {item.quantity > 1 && (
                        <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {item.quantity}x
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {comboItems.length > 4 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  +{comboItems.length - 4} mais
                </div>
              )}
            </div>
          ) : mainImage ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={product.is_featured}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-6xl">⌚</span>
            </div>
          )}

          {/* Featured Badge */}
          {product.is_featured && !isCombo && (
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

        {/* Combo Products Preview */}
        {isCombo && comboItems.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Package size={14} className="text-green-600" />
              <span className="text-xs font-semibold text-green-600">Produtos incluídos:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {comboItems.slice(0, 3).map((item, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {item.quantity > 1 && `${item.quantity}x `}{item.product.name}
                </span>
              ))}
              {comboItems.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  +{comboItems.length - 3} mais
                </span>
              )}
            </div>
          </div>
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
                {/* Preço embaçado com olho */}
                <div className="flex items-center gap-2">
                  <Eye size={20} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                  <span className="text-xl font-bold text-gray-400 blur-sm select-none">
                    {formatCurrency(product.local_price || product.national_price)}
                  </span>
                  <MapPin size={16} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Clique para revelar o preço
                </p>
              </button>
            ) : (
              <div>
                {/* Preço revelado - sem olho */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    {locationLoading 
                      ? 'Carregando...' 
                      : formatCurrency(getProductPrice(product, isUberlandia))}
                  </span>
                </div>
                {!needsAddress && !locationLoading && (
                  <p className="text-xs text-gray-500 mt-1">
                    {isUberlandia ? '💚 Preço Local (Uberlândia)' : '🌐 Preço Nacional'}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (isInComparison) {
                  toast('Produto já está na comparação')
                  router.push('/comparar')
                  return
                }
                if (!canAddMore()) {
                  toast.error('Você pode comparar até 4 produtos. Limpe a comparação atual ou remova algum produto.')
                  return
                }
                addProduct(product)
                toast.success('Produto adicionado à comparação!')
              }}
              disabled={!canAddMore() && !isInComparison}
              className={`p-2 rounded-full transition-all hover:scale-110 disabled:bg-gray-400 disabled:cursor-not-allowed ${
                isInComparison 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              title={isInComparison ? 'Ver comparação' : canAddMore() ? 'Adicionar à comparação' : 'Limite de comparação atingido'}
            >
              <GitCompare size={18} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all hover:scale-110 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title={product.stock === 0 ? 'Produto esgotado' : 'Adicionar ao carrinho'}
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>

        {/* Modal simplificado para redirecionar para cadastro de endereço - usando portal */}
        {typeof window !== 'undefined' && showAddressModal && createPortal(
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => {
              // Só fechar se clicar diretamente no overlay (não no modal)
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
                    Para visualizar o preço do produto, precisamos do seu endereço
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
          </div>,
          document.body
        )}
      </div>
    </Card>
  )
}


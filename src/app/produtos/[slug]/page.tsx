'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/format'
import { createClient } from '@/lib/supabase/client'
import { Product, ProductColor } from '@/types'
import Image from 'next/image'
import { ShoppingCart, Heart, Share2, Star, Truck, Shield, RefreshCw, MapPin, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUserLocation } from '@/hooks/useUserLocation'
import { getProductPrice } from '@/lib/utils/price'
import { Modal } from '@/components/ui/Modal'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { isUberlandia, needsAddress, loading: locationLoading } = useUserLocation()

  const [product, setProduct] = useState<Product | null>(null)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [gifts, setGifts] = useState<Product[]>([])
  const [isFavorite, setIsFavorite] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadProduct()
  }, [params.slug, isAuthenticated])

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

  const loadProduct = async () => {
    try {
      // Carregar produto
      const { data: productData, error } = await supabase
        .from('products')
        .select(`
          *,
          colors:product_colors(*)
        `)
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single()

      if (error || !productData) {
        router.push('/produtos')
        return
      }

      setProduct(productData as any)

      if (productData.colors && productData.colors.length > 0) {
        setSelectedColor(productData.colors[0] as any)
      }

      // Carregar brindes vinculados
      const { data: giftsData } = await supabase
        .from('product_gifts')
        .select(`
          gift_product:products!product_gifts_gift_product_id_fkey(*)
        `)
        .eq('product_id', productData.id)
        .eq('is_active', true)

      if (giftsData && giftsData.length > 0) {
        setGifts(giftsData.map((g: any) => g.gift_product))
      }

      // Verificar se o produto está nos favoritos
      if (isAuthenticated) {
        try {
          const user = await supabase.auth.getUser()
          if (user.data.user) {
            const { data: favoriteData } = await supabase
              .from('favorites')
              .select('id')
              .eq('product_id', productData.id)
              .eq('user_id', user.data.user.id)
              .single()

            setIsFavorite(!!favoriteData)
          }
        } catch (error) {
          // Ignora erro se não encontrar favorito
          setIsFavorite(false)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error)
      router.push('/produtos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!product) return

    addItem(product, selectedColor || undefined, quantity)

    // Adicionar brindes automaticamente
    gifts.forEach((gift) => {
      addItem(gift, undefined, 1)
    })

    toast.success('Produto adicionado ao carrinho!')
  }

  const handleUnlockPrice = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    setShowAddressModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!product) return null

  const images = selectedColor?.images || product.images || []
  const currentImage = images[selectedImage] || ''

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          {/* Main Image */}
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative"
          >
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={selectedImage === 0}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                ⌚
              </div>
            )}
          </motion.div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all relative ${
                    selectedImage === index
                      ? 'border-black'
                      : 'border-transparent'
                  }`}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-100">
                      ⌚
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          {product.short_description && (
            <p className="text-lg text-gray-600 mb-6">
              {product.short_description}
            </p>
          )}

          {/* Price */}
          <div className="mb-6">
            {needsAddress && !locationLoading && isAuthenticated ? (
              <button
                onClick={handleUnlockPrice}
                className="relative cursor-pointer group w-full text-left"
              >
                {/* Preço embaçado com olho */}
                <div className="flex items-center gap-3 mb-2">
                  <Eye size={32} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                  <span className="text-4xl font-bold text-gray-400 blur-md select-none">
                    {formatCurrency(product.local_price || product.national_price)}
                  </span>
                  <MapPin size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  Clique para revelar o preço
                </p>
              </button>
            ) : !isAuthenticated ? (
              <div className="p-4 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300">
                <div className="text-4xl font-bold text-gray-400 blur-md select-none mb-2">
                  {formatCurrency(product.local_price || product.national_price)}
                </div>
                <Button onClick={() => router.push('/login')} variant="outline" size="sm">
                  Faça login para ver o preço
                </Button>
              </div>
            ) : (
              <div>
                {/* Preço revelado - sem olho */}
                <span className="text-4xl font-bold">
                  {locationLoading 
                    ? 'Carregando...' 
                    : formatCurrency(getProductPrice(product, isUberlandia))}
                </span>
                {!needsAddress && !locationLoading && (
                  <p className="text-sm text-gray-500 mt-1">
                    {isUberlandia ? '💚 Preço Local (Uberlândia)' : '🌐 Preço Nacional'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Modal simplificado para redirecionar para cadastro de endereço */}
          {showAddressModal && (
            <div 
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onMouseDown={(e) => {
                // Prevenir fechamento acidental ao mover mouse
                e.preventDefault()
              }}
              onClick={(e) => {
                // Só fechar se clicar diretamente no overlay (não no modal)
                if (e.target === e.currentTarget) {
                  setShowAddressModal(false)
                }
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
              >
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
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
              </div>
            )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">
                Cor: {selectedColor?.color_name}
              </h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setSelectedColor(color)
                      setSelectedImage(0)
                    }}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${
                      selectedColor?.id === color.id
                        ? 'border-black scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.color_hex }}
                    title={color.color_name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Gifts */}
          {gifts.length > 0 && (
            <div className="mb-6 p-4 bg-accent/10 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center">
                🎁 Ganhe de Brinde:
              </h3>
              <ul className="space-y-1">
                {gifts.map((gift) => (
                  <li key={gift.id} className="text-sm flex items-center">
                    <span className="mr-2">•</span>
                    {gift.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Quantidade</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-black transition-colors"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-black transition-colors"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart size={20} className="mr-2" />
              {product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
            </Button>
            <button
              onClick={async () => {
                if (!isAuthenticated) {
                  toast.error('Faça login para favoritar produtos')
                  router.push('/login')
                  return
                }
                try {
                  const user = await supabase.auth.getUser()
                  if (!user.data.user) return

                  if (isFavorite) {
                    // Remover dos favoritos
                    const { error } = await supabase
                      .from('favorites')
                      .delete()
                      .eq('product_id', product.id)
                      .eq('user_id', user.data.user.id)

                    if (error) throw error
                    setIsFavorite(false)
                    toast.success('Removido dos favoritos')
                  } else {
                    // Adicionar aos favoritos
                    const { error } = await supabase
                      .from('favorites')
                      .insert({
                        product_id: product.id,
                        user_id: user.data.user.id,
                      })

                    if (error) throw error
                    setIsFavorite(true)
                    toast.success('Adicionado aos favoritos')
                  }
                } catch (error) {
                  console.error('Erro ao favoritar:', error)
                  toast.error('Erro ao favoritar produto')
                }
              }}
              className={`w-14 h-14 rounded-lg border-2 transition-colors flex items-center justify-center ${
                isFavorite
                  ? 'border-red-500 bg-red-50 text-red-500'
                  : 'border-gray-300 hover:border-black'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart size={24} className={isFavorite ? 'fill-current' : ''} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    text: product.short_description || product.description || '',
                    url: window.location.href,
                  }).catch(() => {})
                } else {
                  // Fallback: copiar para clipboard
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Link copiado para a área de transferência!')
                }
              }}
              className="w-14 h-14 rounded-lg border-2 border-gray-300 hover:border-black transition-colors flex items-center justify-center"
              title="Compartilhar produto"
            >
              <Share2 size={24} />
            </button>
          </div>

          {/* Stock Status */}
          {product.stock > 0 && product.stock < 10 && (
            <p className="text-orange-600 mb-6">
              ⚠️ Apenas {product.stock} unidades disponíveis!
            </p>
          )}

          {/* Benefits */}
          {product.benefits && (
            <div className="space-y-3 border-t pt-6">
              {product.benefits.free_shipping?.enabled && (
                <div className="flex items-center">
                  <Truck size={20} className="mr-3 flex-shrink-0" />
                  <span>{product.benefits.free_shipping.text || 'Frete grátis para Uberlândia acima de R$ 200'}</span>
                </div>
              )}
              {product.benefits.warranty?.enabled && (
                <div className="flex items-center">
                  <Shield size={20} className="mr-3 flex-shrink-0" />
                  <span>{product.benefits.warranty.text || 'Garantia de 1 ano'}</span>
                </div>
              )}
              {product.benefits.returns?.enabled && (
                <div className="flex items-center">
                  <RefreshCw size={20} className="mr-3 flex-shrink-0" />
                  <span>{product.benefits.returns.text || 'Troca grátis em 7 dias'}</span>
                </div>
              )}
              {product.benefits.gift?.enabled && (
                <div className="flex items-center">
                  <span className="text-xl mr-3 flex-shrink-0">🎁</span>
                  <span>{product.benefits.gift.text || 'Brinde exclusivo incluído'}</span>
                </div>
              )}
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-2xl font-bold mb-4">Especificações Técnicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec: any, index: number) => (
                  <div key={index} className="flex gap-2">
                    <span className="font-semibold text-gray-700">{spec.key}:</span>
                    <span className="text-gray-600">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-2xl font-bold mb-4">Descrição</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


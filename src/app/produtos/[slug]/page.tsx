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
import { ShoppingCart, Heart, Share2, Star, Truck, Shield, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showPrice, setShowPrice] = useState(false)
  const [gifts, setGifts] = useState<Product[]>([])

  const supabase = createClient()

  useEffect(() => {
    loadProduct()
  }, [params.slug])

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
    setShowPrice(true)
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
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4"
          >
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
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
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-black'
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
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
            {showPrice || isAuthenticated ? (
              <>
                {product.bling_price && product.bling_price > product.local_price && (
                  <span className="text-2xl text-gray-500 line-through mr-3">
                    {formatCurrency(product.bling_price)}
                  </span>
                )}
                <span className="text-4xl font-bold">
                  {formatCurrency(product.local_price)}
                </span>
                {product.bling_price && product.bling_price > product.local_price && (
                  <div className="inline-block ml-3 px-3 py-1 bg-accent text-black rounded-full text-sm font-semibold">
                    {Math.round(
                      ((product.bling_price - product.local_price) /
                        product.bling_price) *
                        100
                    )}
                    % OFF
                  </div>
                )}
              </>
            ) : (
              <div>
                <div className="text-2xl font-semibold text-gray-400 mb-2">
                  Faça login para ver o preço
                </div>
                <Button onClick={handleUnlockPrice} variant="outline" size="sm">
                  Ver Preço
                </Button>
              </div>
            )}
          </div>

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
            <button className="w-14 h-14 rounded-lg border-2 border-gray-300 hover:border-black transition-colors flex items-center justify-center">
              <Heart size={24} />
            </button>
            <button className="w-14 h-14 rounded-lg border-2 border-gray-300 hover:border-black transition-colors flex items-center justify-center">
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
          <div className="space-y-3 border-t pt-6">
            <div className="flex items-center">
              <Truck size={20} className="mr-3 flex-shrink-0" />
              <span>Frete grátis para Uberlândia acima de R$ 200</span>
            </div>
            <div className="flex items-center">
              <Shield size={20} className="mr-3 flex-shrink-0" />
              <span>Garantia de 1 ano</span>
            </div>
            <div className="flex items-center">
              <RefreshCw size={20} className="mr-3 flex-shrink-0" />
              <span>Troca grátis em 7 dias</span>
            </div>
          </div>

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


'use client'

import { useEffect, useState } from 'react'
import { useProductComparison } from '@/hooks/useProductComparison'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/format'
import { getProductPrice } from '@/lib/utils/price'
import { Product } from '@/types'
import Image from 'next/image'
import { X, ShoppingCart, Eye, Check, XCircle, MapPin, GitCompare, Star } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { useCart } from '@/hooks/useCart'
import { createClient } from '@/lib/supabase/client'

export default function ComparePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { products, removeProduct, clearComparison, addProduct, canAddMore } = useProductComparison()
  const { isUberlandia, needsAddress, loading: locationLoading } = useUserLocation()
  const { addItem } = useCart()
  const [comparisonFields, setComparisonFields] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const supabase = createClient()

  const loadComparisonFields = async () => {
    try {
      // Se não há produtos, não precisa carregar campos
      if (products.length === 0) {
        setComparisonFields([])
        setLoading(false)
        return
      }

      // Buscar campos de comparação usando as especificações dos produtos
      // Comparar por nome da especificação, não por posição
      const allSpecKeys = new Set<string>()
      products.forEach(product => {
        if (product.specifications) {
          product.specifications.forEach(spec => {
            // Adicionar por nome (key), permitindo duplicatas se necessário
            if (spec.key && spec.key.trim()) {
              allSpecKeys.add(spec.key.trim())
            }
          })
        }
      })
      
      // Campos padrão sempre presentes
      const defaultFields = ['Nome', 'Preço', 'Categoria', 'Estoque']
      
      // Combinar campos padrão com especificações (ordenadas alfabeticamente)
      const sortedSpecs = Array.from(allSpecKeys).sort()
      setComparisonFields([...defaultFields, ...sortedSpecs])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar campos de comparação:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComparisonFields()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length, products.map(p => p.id).join(',')])

  const handleRemoveProduct = (productId: string) => {
    removeProduct(productId)
    // Remover redirecionamento - manter na página de comparação mesmo quando vazio
  }

  const handleAddToCart = (product: Product) => {
    if (product.colors && product.colors.length > 0) {
      toast.error('Selecione uma cor na página do produto antes de adicionar ao carrinho')
      router.push(`/produtos/${product.slug}`)
      return
    }
    addItem(product, undefined, 1)
    toast.success('Produto adicionado ao carrinho!')
  }

  // Carregar produtos e categorias
  useEffect(() => {
    const loadProductsAndCategories = async () => {
      try {
        setLoading(true)
        const { data: productsData, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error) throw error

        if (productsData) {
          setAllProducts(productsData as Product[])
          const uniqueCategories = [...new Set(productsData.map((p: any) => p.category).filter(Boolean))] as string[]
          setCategories(uniqueCategories.sort())
        }
        setLoading(false)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
        toast.error('Erro ao carregar produtos')
        setLoading(false)
      }
    }

    loadProductsAndCategories()
  }, [])

  const handleAddProductToComparison = (product: Product) => {
    // Verificar se produtos já na comparação são da mesma categoria
    if (products.length > 0) {
      const firstProductCategory = products[0].category
      if (product.category !== firstProductCategory) {
        toast.error(
          `Não é possível comparar produtos de categorias diferentes.\n\nProdutos na comparação: ${firstProductCategory || 'Sem categoria'}\nProduto selecionado: ${product.category || 'Sem categoria'}\n\nPor favor, limpe a comparação atual ou selecione produtos da mesma categoria.`,
          {
            duration: 5000,
            style: {
              maxWidth: '500px',
              whiteSpace: 'pre-line',
            },
          }
        )
        return
      }
    }

    if (!canAddMore()) {
      toast.error('Você pode comparar até 4 produtos. Limpe a comparação atual ou remova algum produto.')
      return
    }

    if (products.some(p => p.id === product.id)) {
      toast('Produto já está na comparação')
      return
    }

    addProduct(product)
    toast.success('Produto adicionado à comparação!')
    setShowProductSelector(false)
  }

  const filteredProducts = selectedCategory
    ? allProducts.filter(p => p.category === selectedCategory)
    : allProducts

  // Renderização condicional APÓS todos os hooks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Comparar Produtos</h1>
          <p className="text-gray-600 mb-8">
            Selecione produtos para comparar suas características lado a lado
          </p>
        </div>

        {/* Seletor de categoria e produtos */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Selecione uma categoria</h2>
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === null
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:border-black'
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedCategory === category
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {selectedCategory && (
            <p className="text-sm text-gray-600 mb-4">
              Produtos da categoria: <strong>{selectedCategory}</strong>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAddProductToComparison(product)}
              >
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      ⌚
                    </div>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddProductToComparison(product)
                  }}
                >
                  <GitCompare size={16} className="mr-2" />
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Comparar Produtos</h1>
        <div className="flex gap-3">
          <Button onClick={() => setShowProductSelector(!showProductSelector)} variant="outline">
            <GitCompare size={16} className="mr-2" />
            {showProductSelector ? 'Fechar Seleção' : 'Adicionar Produtos'}
          </Button>
          <Button onClick={clearComparison} variant="outline">
            Limpar Comparação
          </Button>
        </div>
      </div>

      {/* Seletor de produtos */}
      {showProductSelector && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Selecione produtos para comparar</h2>
          <p className="text-sm text-gray-600 mb-4">
            {products.length > 0 && (
              <>
                ⚠️ Você só pode comparar produtos da mesma categoria.
                <br />
                Categoria atual: <strong>{products[0].category || 'Sem categoria'}</strong>
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === null
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:border-black'
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedCategory === category
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts
              .filter(p => !products.some(prod => prod.id === p.id))
              .map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        ⌚
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddProductToComparison(product)}
                    disabled={!canAddMore() || (products.length > 0 && product.category !== products[0].category)}
                  >
                    <GitCompare size={16} className="mr-2" />
                    Adicionar
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto -mx-4 sm:mx-0">
        <div className="px-4 sm:px-0">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="p-2 sm:p-4 text-left font-bold sticky left-0 bg-white z-10 min-w-[150px] sm:min-w-[200px]">
                  <span className="text-sm sm:text-base">Característica</span>
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-2 sm:p-4 text-center min-w-[200px] sm:min-w-[250px]">
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="ml-auto text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Remover produto"
                      >
                        <X size={18} className="sm:w-5 sm:h-5" />
                      </button>
                      <div className="relative w-20 h-20 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 80px, 128px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl sm:text-4xl">
                            ⌚
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-xs sm:text-lg text-center px-1">{product.name}</h3>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 w-full">
                        <Link href={`/produtos/${product.slug}`} className="w-full sm:w-auto">
                          <Button size="sm" variant="outline" className="w-full text-xs sm:text-sm">
                            <Eye size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Ver Detalhes</span>
                            <span className="sm:hidden">Detalhes</span>
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          className="w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <ShoppingCart size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Adicionar</span>
                          <span className="sm:hidden">Add</span>
                        </Button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          <tbody>
            {comparisonFields.map((field, index) => (
              <tr 
                key={field} 
                className={`border-b transition-colors ${
                  index % 2 === 0 
                    ? 'bg-white hover:bg-gray-50/50' 
                    : 'bg-gray-50/30 hover:bg-gray-50/70'
                }`}
              >
                <td className="p-2 sm:p-4 font-semibold sticky left-0 bg-white z-10 text-xs sm:text-base border-r border-gray-200">
                  <span className="text-gray-800">{field}</span>
                </td>
                {products.map((product) => {
                  let value: string | number | React.ReactNode = '—'
                  
                  switch (field) {
                    case 'Nome':
                      value = product.name
                      break
                    case 'Preço':
                      // Mostrar preço embaçado se não tiver endereço
                      if (needsAddress && !locationLoading) {
                        value = (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!isAuthenticated) {
                                router.push('/login')
                                return
                              }
                              setShowAddressModal(true)
                            }}
                            className="relative cursor-pointer group"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Eye size={16} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                              <span className="text-gray-400 blur-sm select-none">
                                {formatCurrency(product.local_price || product.national_price)}
                              </span>
                            </div>
                          </button>
                        )
                      } else {
                        value = formatCurrency(getProductPrice(product, isUberlandia))
                      }
                      break
                    case 'Categoria':
                      value = product.category || '—'
                      break
                    case 'Estoque':
                      value = product.stock > 0 ? `${product.stock} unidades` : 'Esgotado'
                      break
                    default:
                      // Buscar na especificações
                      const spec = product.specifications?.find(s => s.key === field)
                      if (spec) {
                        const rating = parseInt(spec.value) || 0
                        const isRating = rating >= 1 && rating <= 5
                        
                        if (isRating) {
                          value = (
                            <div className="flex items-center justify-center gap-1.5 py-1">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={18}
                                    className={
                                      star <= rating
                                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                                        : 'fill-gray-200 text-gray-200'
                                    }
                                  />
                                ))}
                              </div>
                              <span className="ml-1.5 text-sm font-semibold text-gray-700">{rating}/5</span>
                            </div>
                          )
                        } else {
                          value = <span className="text-gray-700 break-words">{spec.value}</span>
                        }
                      }
                      break
                  }
                  
                  return (
                    <td key={product.id} className="p-2 sm:p-4 text-center text-xs sm:text-base bg-transparent">
                      {typeof value === 'string' || typeof value === 'number' ? (
                        <span className="text-gray-700 break-words font-medium">{value}</span>
                      ) : (
                        value
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal para cadastrar endereço */}
      {typeof window !== 'undefined' && showAddressModal && createPortal(
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
  )
}


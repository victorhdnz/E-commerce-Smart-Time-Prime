'use client'

import { useEffect, useState } from 'react'
import { useProductComparison } from '@/hooks/useProductComparison'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/format'
import { getProductPrice } from '@/lib/utils/price'
import { Product } from '@/types'
import Image from 'next/image'
import { X, ShoppingCart, Eye, Check, XCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useCart } from '@/hooks/useCart'
import { createClient } from '@/lib/supabase/client'

export default function ComparePage() {
  const router = useRouter()
  const { products, removeProduct, clearComparison } = useProductComparison()
  const { isUberlandia } = useUserLocation()
  const { addItem } = useCart()
  const [comparisonFields, setComparisonFields] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadComparisonFields()
  }, [])

  const loadComparisonFields = async () => {
    try {
      // Buscar campos de comparação configurados para a categoria dos produtos
      // Por enquanto, vamos usar as especificações dos produtos como base
      const allSpecKeys = new Set<string>()
      products.forEach(product => {
        if (product.specifications) {
          product.specifications.forEach(spec => {
            allSpecKeys.add(spec.key)
          })
        }
      })
      
      // Campos padrão sempre presentes
      const defaultFields = ['Nome', 'Preço', 'Categoria', 'Estoque']
      
      // Combinar campos padrão com especificações
      setComparisonFields([...defaultFields, ...Array.from(allSpecKeys)])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar campos de comparação:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (products.length > 0) {
      loadComparisonFields()
    }
  }, [products])

  const handleRemoveProduct = (productId: string) => {
    removeProduct(productId)
    if (products.length === 1) {
      router.push('/produtos')
    }
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
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Comparar Produtos</h1>
          <p className="text-gray-600 mb-8">
            Você ainda não selecionou produtos para comparar
          </p>
          <Link href="/produtos">
            <Button size="lg">Ver Produtos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Comparar Produtos</h1>
        <div className="flex gap-3">
          <Button onClick={clearComparison} variant="outline">
            Limpar Comparação
          </Button>
          <Link href="/produtos">
            <Button variant="outline">Adicionar Mais Produtos</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left font-bold sticky left-0 bg-white z-10 min-w-[200px]">
                Característica
              </th>
              {products.map((product) => (
                <th key={product.id} className="p-4 text-center min-w-[250px]">
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="ml-auto text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
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
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <div className="flex gap-2">
                      <Link href={`/produtos/${product.slug}`}>
                        <Button size="sm" variant="outline">
                          <Eye size={16} className="mr-2" />
                          Ver Detalhes
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFields.map((field) => (
              <tr key={field} className="border-b hover:bg-gray-50">
                <td className="p-4 font-semibold sticky left-0 bg-white z-10">
                  {field}
                </td>
                {products.map((product) => {
                  let value: string | number | React.ReactNode = '—'
                  
                  switch (field) {
                    case 'Nome':
                      value = product.name
                      break
                    case 'Preço':
                      value = formatCurrency(getProductPrice(product, isUberlandia))
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
                        value = spec.value
                      }
                      break
                  }
                  
                  return (
                    <td key={product.id} className="p-4 text-center">
                      {typeof value === 'string' || typeof value === 'number' ? (
                        <span className="text-gray-700">{value}</span>
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
  )
}


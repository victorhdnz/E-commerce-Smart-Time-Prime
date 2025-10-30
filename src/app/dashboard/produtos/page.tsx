'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils/format'
import { Plus, Edit, Trash2, Eye, EyeOff, Package, RefreshCw, Link2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function DashboardProductsPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    if (!authLoading) {
      if (!isAuthenticated || !isEditor) {
        router.push('/')
      } else if (mounted) {
        loadProducts()
      }
    }

    return () => {
      mounted = false
    }
  }, [isAuthenticated, isEditor, authLoading, router])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data as Product[])
    } catch (error) {
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)

      if (error) throw error

      toast.success('Status atualizado')
      loadProducts()
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentStatus })
        .eq('id', productId)

      if (error) throw error

      toast.success('Destaque atualizado')
      loadProducts()
    } catch (error) {
      toast.error('Erro ao atualizar destaque')
    }
  }

  const syncBlingProducts = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/bling/products/sync', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Produtos sincronizados!')
        loadProducts()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Erro ao sincronizar produtos:', error)
      toast.error(error.message || 'Erro ao sincronizar produtos do Bling')
    } finally {
      setSyncing(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast.success('Produto excluído')
      loadProducts()
    } catch (error) {
      toast.error('Erro ao excluir produto')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gerenciar Produtos</h1>
            <p className="text-gray-600">
              {products.length} produtos cadastrados
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={syncBlingProducts}
              disabled={syncing}
            >
              <RefreshCw size={20} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Bling'}
            </Button>
            <Link href="/dashboard/produtos/brindes-combos">
              <Button variant="outline" size="lg">
                <Package size={20} className="mr-2" />
                Brindes & Combos
              </Button>
            </Link>
            <Link href="/dashboard/produtos/novo">
              <Button size="lg">
                <Plus size={20} className="mr-2" />
                Novo Produto
              </Button>
            </Link>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Local
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Nacional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
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
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(product.local_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(product.national_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`text-sm font-semibold ${
                            product.stock === 0
                              ? 'text-red-600'
                              : product.stock < 10
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {product.stock} unidades
                        </div>
                        {(product as any).bling_id && (
                          <Link2 size={14} className="text-blue-500" title="Sincronizado com Bling" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                        {product.is_featured && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent text-black">
                            Destaque
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            toggleProductStatus(product.id, product.is_active)
                          }
                          className="text-gray-600 hover:text-gray-900"
                          title={
                            product.is_active ? 'Desativar' : 'Ativar'
                          }
                        >
                          {product.is_active ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                        <Link
                          href={`/dashboard/produtos/${product.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


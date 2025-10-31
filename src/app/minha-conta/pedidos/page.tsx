'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils/format'
import { Package, CheckCircle, XCircle, Clock, User, MapPin, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function MyOrdersPage() {
  const router = useRouter()
  const { isAuthenticated, profile, loading: authLoading, signOut } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const hasLoadedRef = useRef(false)

  const supabase = useMemo(() => createClient(), [])

  const loadOrders = useCallback(async (userId: string) => {
    if (!userId) return
    
    try {
      setLoading(true)
      
      // Primeiro, buscar apenas os pedidos
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (ordersError) {
        if (ordersError.code === 'PGRST116') {
          setOrders([])
          return
        }
        throw ordersError
      }
      
      setOrders(ordersData as Order[] || [])
    } catch (error: any) {
      // Silencioso se não houver pedidos
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    // Aguardar o carregamento da autenticação completar
    if (authLoading) return
    
    // O middleware já protege essa rota, então só verificar se realmente não está autenticado
    // após o loading completar, para evitar race conditions
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent('/minha-conta/pedidos')
      router.push(`/login?returnUrl=${returnUrl}`)
      return
    }

    if (profile?.id && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadOrders(profile.id)
    }
  }, [authLoading, isAuthenticated, profile?.id, router, loadOrders])

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      toast.error('Erro ao sair')
    }
  }, [signOut, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando Pagamento'
      case 'processing':
        return 'Processando'
      case 'shipped':
        return 'Enviado'
      case 'delivered':
        return 'Entregue'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="mr-1" />
      case 'delivered':
        return <CheckCircle size={16} className="mr-1" />
      case 'cancelled':
        return <XCircle size={16} className="mr-1" />
      default:
        return <Package size={16} className="mr-1" />
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Minha Conta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Avatar */}
            <div className="text-center mb-6">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4 text-3xl">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <h2 className="text-xl font-bold">{profile?.full_name || 'Usuário'}</h2>
              <p className="text-gray-600">{profile?.email}</p>
            </div>

            {/* Menu */}
            <nav className="space-y-2">
              <Link
                href="/minha-conta"
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User size={20} className="mr-3" />
                Dados Pessoais
              </Link>
              <Link
                href="/minha-conta/pedidos"
                className="flex items-center p-3 rounded-lg bg-gray-100 font-medium"
              >
                <Package size={20} className="mr-3" />
                Meus Pedidos
              </Link>
              <Link
                href="/minha-conta/enderecos"
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MapPin size={20} className="mr-3" />
                Endereços
              </Link>
              {(profile?.role === 'admin' || profile?.role === 'editor') && (
                <Link
                  href="/dashboard"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut size={20} className="mr-3" />
                Sair
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Meus Pedidos</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-2xl font-semibold mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-gray-600 mb-6">
                    Parece que você ainda não fez nenhuma compra. Que tal explorar nossos produtos?
                  </p>
                  <Link href="/produtos">
                    <Button size="lg">Ver Produtos</Button>
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold">Pedido #{order.order_number}</h3>
                        <p className="text-sm text-gray-600">
                          Data: {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {((order as any).order_items || []).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product?.images?.[0] ? (
                              <img
                                src={item.product.images[0]}
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
                            <p className="font-semibold">{item.product?.name}</p>
                            <p className="text-sm text-gray-600">
                              Quantidade: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatCurrency(item.price_at_purchase * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 mt-4 flex justify-between items-center">
                      <p className="text-lg font-bold">Total:</p>
                      <p className="text-lg font-bold">{formatCurrency((order as any).total_amount || 0)}</p>
                    </div>
                  </div>
                ))
              )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

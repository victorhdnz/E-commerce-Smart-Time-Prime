'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Layout,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCheck,
  MessageCircle,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'
interface DashboardStats {
  todaySales: number
  newOrders: number
  activeProducts: number
  clients: number
}

interface Order {
  id: string
  order_number: string
  total: number
  status: string
  created_at: string
  user_id: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    newOrders: 0,
    activeProducts: 0,
    clients: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentDay, setCurrentDay] = useState<string>(() => {
    // Armazenar dia atual para detectar mudança
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(5)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    // Aguardar o carregamento da autenticação completar
    if (loading) return
    
    // Verificar autenticação e permissões
    // O middleware já protege essa rota, mas verificamos novamente no cliente
    // para evitar problemas de sincronização em produção
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent('/dashboard')
      router.push(`/login?returnUrl=${returnUrl}`)
      return
    }

    if (!isEditor) {
      router.push('/')
      return
    }
  }, [isAuthenticated, isEditor, loading, router])

  useEffect(() => {
    if (isAuthenticated && isEditor) {
      loadDashboardData()
      // Atualizar dados a cada 60 segundos
      const dataInterval = setInterval(loadDashboardData, 60000)
      // Atualizar tempo a cada minuto
      const timeInterval = setInterval(() => {
        const now = new Date()
        setCurrentTime(now)
        
        // Verificar se mudou o dia
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        if (todayStr !== currentDay) {
          // Dia mudou - limpar dados e recarregar
          setCurrentDay(todayStr)
          setStats({ todaySales: 0, newOrders: 0, activeProducts: 0, clients: 0 })
          setRecentOrders([])
          loadDashboardData()
        }
      }, 60000) // Verificar mudança de dia a cada minuto
      
      return () => {
        clearInterval(dataInterval)
        clearInterval(timeInterval)
      }
    }
  }, [isAuthenticated, isEditor, currentDay])

  const loadDashboardData = async () => {
    try {
      setLoadingData(true)
      
      // Buscar dados diretamente do Supabase
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Buscar estatísticas e pedidos em paralelo
      // Selecionar apenas campos necessários para melhor performance
      const [ordersResult, productsResult, clientsResult] = await Promise.all([
        supabase
          .from('orders')
          .select('id, order_number, total, status, created_at, user_id')
          .eq('status', 'completed')
          .gte('created_at', new Date().toISOString().split('T')[0])
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select('id')
          .eq('is_active', true),
        supabase
          .from('profiles')
          .select('id')
          .order('created_at', { ascending: false }),
      ])

      // Calcular estatísticas
      const todayOrders = ordersResult.data || []
      const todaySales = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      const newOrders = todayOrders.length
      const activeProducts = productsResult.data?.length || 0
      const clients = clientsResult.data?.length || 0

      setStats({
        todaySales,
        newOrders,
        activeProducts,
        clients,
      })

      // Mapear pedidos para o formato esperado
      const mappedOrders: Order[] = (todayOrders || []).map(order => ({
        id: order.id,
        order_number: order.order_number || order.id,
        total: order.total || 0,
        status: order.status || 'pending',
        created_at: order.created_at,
        user_id: order.user_id,
      }))

      setRecentOrders(mappedOrders)
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Filtrar pedidos de hoje
  const todayOrders = recentOrders.filter(order => {
    if (!order || !order.created_at) {
      return false
    }
    const orderDate = new Date(order.created_at).toISOString().split('T')[0]
    return orderDate === currentDay
  })

  // Cálculos de paginação
  const totalPages = Math.ceil(todayOrders.length / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const endIndex = startIndex + ordersPerPage
  const currentOrders = todayOrders.slice(startIndex, endIndex)

  // Resetar página quando mudar o dia
  useEffect(() => {
    setCurrentPage(1)
  }, [currentDay])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Vendas Hoje',
      value: formatCurrency(stats.todaySales),
      icon: DollarSign,
      color: 'bg-green-500',
      change: stats.todaySales > 0 ? '+' : '',
    },
    {
      title: 'Novos Pedidos',
      value: stats.newOrders.toString(),
      icon: ShoppingBag,
      color: 'bg-blue-500',
      change: `+${stats.newOrders}`,
    },
    {
      title: 'Produtos Ativos',
      value: stats.activeProducts.toString(),
      icon: Package,
      color: 'bg-purple-500',
      change: '',
    },
    {
      title: 'Clientes',
      value: stats.clients.toString(),
      icon: Users,
      color: 'bg-orange-500',
      change: '',
    },
  ]

  const quickActions = [
    {
      title: 'Gerenciar Produtos',
      description: 'Adicionar, editar ou remover produtos',
      icon: Package,
      href: '/dashboard/produtos',
      color: 'bg-blue-500',
    },
    {
      title: 'Editar Landing Page',
      description: 'Personalizar seções da página inicial',
      icon: Layout,
      href: '/dashboard/landing',
      color: 'bg-purple-500',
    },
    {
      title: 'FAQ',
      description: 'Editar perguntas frequentes',
      icon: MessageSquare,
      href: '/dashboard/faq',
      color: 'bg-yellow-500',
    },
    {
      title: 'Clientes',
      description: 'Visualizar contas registradas e informações',
      icon: UserCheck,
      href: '/dashboard/clientes',
      color: 'bg-green-500',
    },
    {
      title: 'Vendas e Pedidos',
      description: 'Filtrar e visualizar todas as vendas',
      icon: ShoppingBag,
      href: '/dashboard/vendas',
      color: 'bg-indigo-500',
    },
    {
      title: 'Grupo VIP WhatsApp',
      description: 'Visualizar registros do Grupo VIP',
      icon: MessageCircle,
      href: '/dashboard/whatsapp-vip',
      color: 'bg-green-500',
    },
    {
      title: 'Configurações',
      description: 'Ajustar configurações do site',
      icon: Settings,
      href: '/dashboard/configuracoes',
      color: 'bg-gray-500',
    },
    {
      title: 'Termos',
      description: 'Gerenciar termos e políticas do site',
      icon: FileText,
      href: '/dashboard/termos',
      color: 'bg-blue-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Bem-vindo ao painel administrativo do Smart Time Prime
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}
                >
                  <stat.icon size={24} />
                </div>
                {stat.change && (
                  <span className="text-sm font-semibold text-green-600">
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold">{loadingData ? '...' : stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={action.href}>
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                    <div
                      className={`${action.color} w-14 h-14 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <action.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                    <p className="text-gray-600">{action.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity - Apenas Vendas de Hoje */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Vendas de Hoje</h2>
            <div className="text-sm text-gray-500">
              {todayOrders.length} {todayOrders.length === 1 ? 'venda' : 'vendas'}
            </div>
          </div>
          
          <div className="space-y-4">
            {loadingData ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : todayOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Nenhuma venda hoje</p>
                <p className="text-xs mt-2">As vendas aparecerão aqui conforme forem realizadas</p>
              </div>
            ) : (
              <>
                {currentOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <ShoppingBag size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Pedido #{order.order_number}</p>
                          <p className="text-sm text-gray-600">
                            Status: {order.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, todayOrders.length)} de {todayOrders.length} vendas
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                        Anterior
                      </button>
                      <span className="flex items-center px-3 py-2 text-sm">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


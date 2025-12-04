'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  Package,
  Layout,
  Settings,
  Eye,
  MessageCircle,
  FileText,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface DashboardStats {
  todaySales: number
  newOrders: number
  activeProducts: number
  clients: number
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
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    // Aguardar o carregamento da autenticação completar
    if (loading) return
    
    // Verificar autenticação e permissões
    // O middleware já protege essa rota, mas verificamos novamente no cliente
    // para evitar problemas de sincronização em produção
    if (!isAuthenticated) {
      router.push('/admin')
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
      
      return () => {
        clearInterval(dataInterval)
      }
    }
  }, [isAuthenticated, isEditor])

  const loadDashboardData = async () => {
    try {
      setLoadingData(true)
      
      // Buscar dados diretamente do Supabase
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Buscar apenas produtos ativos (e-commerce removido, mantendo apenas para comparador)
      const productsResult = await supabase
        .from('products')
        .select('id')
        .eq('is_active', true)

      const activeProducts = productsResult.data?.length || 0

      setStats({
        todaySales: 0,
        newOrders: 0,
        activeProducts,
        clients: 0,
      })
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Removido: Lógica de pedidos e vendas (e-commerce não utilizado)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Produtos Ativos',
      value: stats.activeProducts.toString(),
      icon: Package,
      color: 'bg-purple-500',
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
    // Removido: Clientes e Vendas (e-commerce não utilizado)
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
    // Removido: Cupons (e-commerce não utilizado)
    {
      title: 'Layouts de Landing Page',
      description: 'Criar e gerenciar layouts e versões de landing pages',
      icon: Layout,
      href: '/admin/layouts',
      color: 'bg-indigo-600',
    },
    {
      title: 'Analytics',
      description: 'Acompanhar performance das landing pages',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-teal-500',
    },
    {
      title: 'Páginas de Suporte',
      description: 'Criar manuais e páginas de suporte por modelo',
      icon: FileText,
      href: '/admin/suporte',
      color: 'bg-cyan-500',
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
                className="h-full"
              >
                <Link href={action.href}>
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer group h-full flex flex-col">
                    <div
                      className={`${action.color} w-14 h-14 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform flex-shrink-0`}
                    >
                      <action.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 flex-shrink-0">{action.title}</h3>
                    <p className="text-gray-600 flex-1 leading-relaxed">{action.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Removido: Seção de vendas (e-commerce não utilizado) */}
      </div>
    </div>
  )
}


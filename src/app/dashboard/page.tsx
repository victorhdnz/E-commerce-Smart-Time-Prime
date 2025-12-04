'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  Layout,
  Settings,
  BarChart3,
  GitCompare,
  FileText,
  Layers,
  Eye,
  MousePointer,
  HelpCircle,
  ArrowRight,
  Palette,
  Tags,
  Link2,
  Package,
} from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalLayouts: number
  totalVersions: number
  totalViews: number
  totalClicks: number
  productsForComparison: number
  supportPages: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalLayouts: 0,
    totalVersions: 0,
    totalViews: 0,
    totalClicks: 0,
    productsForComparison: 0,
    supportPages: 0,
  })
  const [loadingData, setLoadingData] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (loading) return
    
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
      const dataInterval = setInterval(loadDashboardData, 60000)
      return () => clearInterval(dataInterval)
    }
  }, [isAuthenticated, isEditor])

  const loadDashboardData = async () => {
    try {
      setLoadingData(true)

      // Buscar estatísticas em paralelo
      const [layoutsResult, versionsResult, analyticsResult, productsResult, supportResult] = await Promise.all([
        supabase.from('landing_layouts').select('id', { count: 'exact' }),
        supabase.from('landing_versions').select('id', { count: 'exact' }),
        supabase.from('landing_analytics').select('event_type').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('product_support_pages').select('id', { count: 'exact' }),
      ])

      const views = analyticsResult.data?.filter(a => a.event_type === 'page_view').length || 0
      const clicks = analyticsResult.data?.filter(a => a.event_type === 'click').length || 0

      setStats({
        totalLayouts: layoutsResult.count || 0,
        totalVersions: versionsResult.count || 0,
        totalViews: views,
        totalClicks: clicks,
        productsForComparison: productsResult.count || 0,
        supportPages: supportResult.count || 0,
      })
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Layouts',
      value: stats.totalLayouts.toString(),
      icon: Layers,
      color: 'bg-indigo-500',
      description: 'Landing pages',
    },
    {
      title: 'Versões',
      value: stats.totalVersions.toString(),
      icon: Layout,
      color: 'bg-purple-500',
      description: 'Campanhas',
    },
    {
      title: 'Views (30d)',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'bg-blue-500',
      description: 'Visualizações',
    },
    {
      title: 'Cliques (30d)',
      value: stats.totalClicks.toLocaleString(),
      icon: MousePointer,
      color: 'bg-green-500',
      description: 'Interações',
    },
  ]

  const mainSections = [
    {
      title: 'Landing Pages',
      description: 'Gerencie layouts, versões e campanhas de marketing',
      icon: Layers,
      items: [
        {
          title: 'Gerenciar Layouts e Versões',
          description: 'Criar layouts, versões, editar cores, fontes e copiar links',
          href: '/dashboard/layouts',
          icon: Palette,
          color: 'bg-indigo-500',
        },
        {
          title: 'Editar Página Principal',
          description: 'Personalizar seções, textos e imagens da home',
          href: '/dashboard/landing',
          icon: Layout,
          color: 'bg-purple-500',
        },
        {
          title: 'Analytics',
          description: 'Ver visualizações, cliques, tempo na página e conversões',
          href: '/dashboard/analytics',
          icon: BarChart3,
          color: 'bg-teal-500',
        },
      ],
    },
    {
      title: 'Comparador de Produtos',
      description: 'Configure produtos e tópicos para o comparador público',
      icon: GitCompare,
      items: [
        {
          title: 'Gerenciar Produtos',
          description: 'Adicionar, editar e organizar produtos',
          href: '/dashboard/produtos',
          icon: Package,
          color: 'bg-orange-500',
        },
        {
          title: 'Tópicos de Classificação',
          description: 'Definir tópicos de comparação por categoria',
          href: '/dashboard/produtos/topicos-classificacao',
          icon: Tags,
          color: 'bg-amber-500',
        },
        {
          title: 'Ver Comparador',
          description: 'Abrir o comparador público',
          href: '/comparar',
          icon: Eye,
          color: 'bg-gray-500',
          external: true,
        },
      ],
    },
    {
      title: 'Páginas de Suporte',
      description: 'Manuais e guias de configuração por modelo de relógio',
      icon: HelpCircle,
      items: [
        {
          title: 'Gerenciar Páginas',
          description: 'Criar e editar manuais e guias',
          href: '/dashboard/suporte',
          icon: FileText,
          color: 'bg-cyan-500',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h1>
          <p className="text-gray-600">
            Gerencie landing pages, comparador e páginas de suporte
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{loadingData ? '...' : stat.value}</p>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {mainSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.15 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white">
                  <section.icon size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <Link 
                    key={item.title} 
                    href={item.href}
                    target={(item as any).external ? '_blank' : undefined}
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group h-full">
                      <div className="flex items-start justify-between">
                        <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                          <item.icon size={24} />
                        </div>
                        <ArrowRight className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" size={20} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Links Footer */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  <strong>{stats.productsForComparison}</strong> produtos ativos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  <strong>{stats.supportPages}</strong> páginas de suporte
                </span>
              </div>
              <Link 
                href="/comparar"
                target="_blank"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Link2 size={16} />
                Abrir Comparador
              </Link>
            </div>
            <Link 
              href="/dashboard/configuracoes"
              className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              <Settings size={16} />
              Configurações
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

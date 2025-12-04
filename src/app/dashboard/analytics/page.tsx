'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { LandingLayout, LandingVersion, LandingAnalytics } from '@/types'
import { BarChart3, TrendingUp, MousePointer, Clock, Eye, X, ArrowLeft, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface AnalyticsSummary {
  totalViews: number
  totalClicks: number
  totalConversions: number
  averageTimeOnPage: number
  averageScrollDepth: number
  bounceRate: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [layouts, setLayouts] = useState<LandingLayout[]>([])
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [versions, setVersions] = useState<LandingVersion[]>([])
  const [analytics, setAnalytics] = useState<LandingAnalytics[]>([])
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const supabase = createClient()

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !isEditor) {
      router.push('/dashboard')
      return
    }

    loadLayouts()
  }, [isAuthenticated, isEditor, authLoading, router])

  useEffect(() => {
    if (selectedLayout) {
      loadVersions(selectedLayout)
      loadAnalytics()
    } else {
      loadAnalytics()
    }
  }, [selectedLayout, selectedVersion, dateRange])

  const loadLayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_layouts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLayouts(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar layouts:', error)
      toast.error('Erro ao carregar layouts')
    } finally {
      setLoading(false)
    }
  }

  const loadVersions = async (layoutId: string) => {
    try {
      const { data, error } = await supabase
        .from('landing_versions')
        .select('*')
        .eq('layout_id', layoutId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVersions(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar versões:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      const dateFilter = getDateFilter(dateRange)
      
      let query = supabase
        .from('landing_analytics')
        .select('*')
        .gte('created_at', dateFilter)

      if (selectedLayout) {
        query = query.eq('layout_id', selectedLayout)
      }

      if (selectedVersion) {
        query = query.eq('version_id', selectedVersion)
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(500)

      if (error) throw error

      setAnalytics(data || [])
      calculateSummary(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar analytics:', error)
      toast.error('Erro ao carregar analytics')
    }
  }

  const getDateFilter = (range: string): string => {
    const now = new Date()
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return '1970-01-01T00:00:00Z'
    }
  }

  const calculateSummary = (data: LandingAnalytics[]) => {
    const views = data.filter(a => a.event_type === 'page_view')
    const clicks = data.filter(a => a.event_type === 'click')
    const conversions = data.filter(a => a.event_type === 'conversion')
    const scrolls = data.filter(a => a.event_type === 'scroll')
    const timeOnPage = data.filter(a => a.event_type === 'time_on_page')

    const totalViews = views.length
    const totalClicks = clicks.length
    const totalConversions = conversions.length

    const avgScrollDepth = scrolls.length > 0
      ? scrolls.reduce((sum, s) => sum + ((s.event_data as any)?.scroll_depth || 0), 0) / scrolls.length
      : 0

    const avgTimeOnPage = timeOnPage.length > 0
      ? timeOnPage.reduce((sum, t) => sum + ((t.event_data as any)?.time_seconds || 0), 0) / timeOnPage.length
      : 0

    // Calcular bounce rate (sessões com apenas 1 page_view)
    const sessions = new Set(data.map(a => a.session_id))
    const singleViewSessions = Array.from(sessions).filter(sessionId => {
      const sessionEvents = data.filter(a => a.session_id === sessionId)
      return sessionEvents.filter(e => e.event_type === 'page_view').length === 1
    }).length
    const bounceRate = sessions.size > 0 ? (singleViewSessions / sessions.size) * 100 : 0

    setSummary({
      totalViews,
      totalClicks,
      totalConversions,
      averageTimeOnPage: Math.round(avgTimeOnPage),
      averageScrollDepth: Math.round(avgScrollDepth),
      bounceRate: Math.round(bounceRate * 100) / 100,
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Acompanhe o desempenho das suas landing pages</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Layout</label>
              <select
                value={selectedLayout || ''}
                onChange={(e) => {
                  setSelectedLayout(e.target.value || null)
                  setSelectedVersion(null)
                }}
                className="w-full border rounded-lg px-4 py-2.5"
              >
                <option value="">Todos os layouts</option>
                {layouts.map(layout => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedLayout && versions.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Versão</label>
                <select
                  value={selectedVersion || ''}
                  onChange={(e) => setSelectedVersion(e.target.value || null)}
                  className="w-full border rounded-lg px-4 py-2.5"
                >
                  <option value="">Todas as versões</option>
                  {versions.map(version => (
                    <option key={version.id} value={version.id}>
                      {version.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Período</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full border rounded-lg px-4 py-2.5"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="all">Todo o período</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadAnalytics}
                className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Resumo */}
        {summary && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Visualizações</h3>
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.totalViews.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Page views registradas</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Cliques</h3>
                <MousePointer className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.totalClicks.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Interações com links/botões</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Conversões</h3>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.totalConversions.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Ações concluídas</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Tempo Médio</h3>
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.averageTimeOnPage}s</p>
              <p className="text-xs text-gray-500 mt-1">Segundos na página</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Scroll Médio</h3>
                <BarChart3 className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.averageScrollDepth}%</p>
              <p className="text-xs text-gray-500 mt-1">Profundidade de scroll</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Taxa de Rejeição</h3>
                <X className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.bounceRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Saíram sem interagir</p>
            </div>
          </div>
        )}

        {/* Lista de eventos recentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Eventos Recentes</h2>
            <p className="text-sm text-gray-500">Últimos {analytics.length} eventos registrados</p>
          </div>
          {analytics.length === 0 ? (
            <div className="p-12 text-center">
              <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado ainda</h3>
              <p className="text-gray-500">Os eventos aparecerão aqui conforme os visitantes interagem com suas landing pages</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layout</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analytics.slice(0, 100).map((event) => {
                    const layout = layouts.find(l => l.id === event.layout_id)
                    const eventData = event.event_data as any
                    
                    return (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(event.created_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            event.event_type === 'conversion' ? 'bg-green-100 text-green-800' :
                            event.event_type === 'click' ? 'bg-blue-100 text-blue-800' :
                            event.event_type === 'page_view' ? 'bg-purple-100 text-purple-800' :
                            event.event_type === 'scroll' ? 'bg-orange-100 text-orange-800' :
                            event.event_type === 'time_on_page' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.event_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {layout?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {event.event_type === 'scroll' && `Scroll: ${eventData?.scroll_depth}%`}
                          {event.event_type === 'time_on_page' && `Tempo: ${eventData?.time_seconds}s`}
                          {event.event_type === 'click' && eventData?.text && `Texto: ${eventData.text}`}
                          {event.event_type === 'page_view' && eventData?.url && (
                            <span className="truncate max-w-xs block">{eventData.url}</span>
                          )}
                          {event.event_type === 'conversion' && 'Conversão registrada'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


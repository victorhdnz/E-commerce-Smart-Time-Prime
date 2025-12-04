'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { LandingLayout, LandingVersion, LandingAnalytics } from '@/types'
import { BarChart3, Clock, Eye, X, ArrowLeft, RefreshCw, Users, Activity, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface AnalyticsSummary {
  totalViews: number
  uniqueVisitors: number
  averageTimeOnPage: number
  averageScrollDepth: number
  bounceRate: number
}

interface DailyStats {
  date: string
  views: number
  visitors: number
  avgTime: number
  avgScroll: number
}

interface LayoutPerformance {
  layoutId: string
  layoutName: string
  views: number
  visitors: number
  avgTime: number
  avgScroll: number
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
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [layoutPerformance, setLayoutPerformance] = useState<LayoutPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [showDetails, setShowDetails] = useState(false)
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
      setRefreshing(true)
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

      const { data, error } = await query.order('created_at', { ascending: false }).limit(1000)

      if (error) throw error

      setAnalytics(data || [])
      calculateSummary(data || [])
      calculateDailyStats(data || [])
      calculateLayoutPerformance(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar analytics:', error)
      toast.error('Erro ao carregar analytics')
    } finally {
      setRefreshing(false)
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
    const scrolls = data.filter(a => a.event_type === 'scroll')
    const timeOnPage = data.filter(a => a.event_type === 'time_on_page')

    const totalViews = views.length
    
    // Visitantes únicos baseado em session_id
    const uniqueSessions = new Set(views.map(v => v.session_id))
    const uniqueVisitors = uniqueSessions.size

    const avgScrollDepth = scrolls.length > 0
      ? scrolls.reduce((sum, s) => sum + ((s.event_data as any)?.scroll_depth || 0), 0) / scrolls.length
      : 0

    const avgTimeOnPage = timeOnPage.length > 0
      ? timeOnPage.reduce((sum, t) => sum + ((t.event_data as any)?.time_seconds || 0), 0) / timeOnPage.length
      : 0

    // Calcular bounce rate (sessões com apenas page_view, sem scroll significativo)
    const sessions = new Set(data.map(a => a.session_id))
    const bouncedSessions = Array.from(sessions).filter(sessionId => {
      const sessionEvents = data.filter(a => a.session_id === sessionId)
      const hasScroll = sessionEvents.some(e => {
        if (e.event_type === 'scroll') {
          const depth = (e.event_data as any)?.scroll_depth || 0
          return depth > 25 // Considera engajamento se scrollou mais de 25%
        }
        return false
      })
      return !hasScroll
    }).length
    const bounceRate = sessions.size > 0 ? (bouncedSessions / sessions.size) * 100 : 0

    setSummary({
      totalViews,
      uniqueVisitors,
      averageTimeOnPage: Math.round(avgTimeOnPage),
      averageScrollDepth: Math.round(avgScrollDepth),
      bounceRate: Math.round(bounceRate),
    })
  }

  const calculateDailyStats = (data: LandingAnalytics[]) => {
    const dailyMap = new Map<string, { views: number; sessions: Set<string>; times: number[]; scrolls: number[] }>()

    data.forEach(event => {
      const date = new Date(event.created_at).toLocaleDateString('pt-BR')
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { views: 0, sessions: new Set(), times: [], scrolls: [] })
      }
      
      const dayStats = dailyMap.get(date)!
      
      if (event.event_type === 'page_view') {
        dayStats.views++
        dayStats.sessions.add(event.session_id)
      } else if (event.event_type === 'time_on_page') {
        dayStats.times.push((event.event_data as any)?.time_seconds || 0)
      } else if (event.event_type === 'scroll') {
        dayStats.scrolls.push((event.event_data as any)?.scroll_depth || 0)
      }
    })

    const stats: DailyStats[] = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        views: stats.views,
        visitors: stats.sessions.size,
        avgTime: stats.times.length > 0 ? Math.round(stats.times.reduce((a, b) => a + b, 0) / stats.times.length) : 0,
        avgScroll: stats.scrolls.length > 0 ? Math.round(stats.scrolls.reduce((a, b) => a + b, 0) / stats.scrolls.length) : 0,
      }))
      .slice(0, 7) // Últimos 7 dias

    setDailyStats(stats)
  }

  const calculateLayoutPerformance = (data: LandingAnalytics[]) => {
    const layoutMap = new Map<string, { views: number; sessions: Set<string>; times: number[]; scrolls: number[] }>()

    data.forEach(event => {
      const layoutId = event.layout_id
      if (!layoutId) return // Skip eventos sem layout_id
      
      if (!layoutMap.has(layoutId)) {
        layoutMap.set(layoutId, { views: 0, sessions: new Set(), times: [], scrolls: [] })
      }
      
      const layoutStats = layoutMap.get(layoutId)!
      
      if (event.event_type === 'page_view') {
        layoutStats.views++
        layoutStats.sessions.add(event.session_id)
      } else if (event.event_type === 'time_on_page') {
        layoutStats.times.push((event.event_data as any)?.time_seconds || 0)
      } else if (event.event_type === 'scroll') {
        layoutStats.scrolls.push((event.event_data as any)?.scroll_depth || 0)
      }
    })

    const performance: LayoutPerformance[] = Array.from(layoutMap.entries())
      .map(([layoutId, stats]) => {
        const layout = layouts.find(l => l.id === layoutId)
        return {
          layoutId,
          layoutName: layout?.name || 'Layout desconhecido',
          views: stats.views,
          visitors: stats.sessions.size,
          avgTime: stats.times.length > 0 ? Math.round(stats.times.reduce((a, b) => a + b, 0) / stats.times.length) : 0,
          avgScroll: stats.scrolls.length > 0 ? Math.round(stats.scrolls.reduce((a, b) => a + b, 0) / stats.scrolls.length) : 0,
        }
      })
      .sort((a, b) => b.views - a.views)

    setLayoutPerformance(performance)
  }

  const getEngagementLevel = (scrollDepth: number, timeOnPage: number): { label: string; color: string } => {
    const score = (scrollDepth / 100) * 0.5 + Math.min(timeOnPage / 60, 1) * 0.5
    
    if (score >= 0.7) return { label: 'Excelente', color: 'text-green-600 bg-green-50' }
    if (score >= 0.5) return { label: 'Bom', color: 'text-blue-600 bg-blue-50' }
    if (score >= 0.3) return { label: 'Moderado', color: 'text-yellow-600 bg-yellow-50' }
    return { label: 'Baixo', color: 'text-red-600 bg-red-50' }
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
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
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
              <div className="flex-1 min-w-[200px]">
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

            <div className="flex-1 min-w-[200px]">
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

            <button
              onClick={loadAnalytics}
              disabled={refreshing}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Resumo Principal */}
        {summary && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.totalViews.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Visualizações</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.uniqueVisitors.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Visitantes únicos</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.averageTimeOnPage}s</p>
              <p className="text-sm text-gray-500">Tempo médio</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <BarChart3 className="w-8 h-8 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.averageScrollDepth}%</p>
              <p className="text-sm text-gray-500">Scroll médio</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.bounceRate}%</p>
              <p className="text-sm text-gray-500">Taxa de rejeição</p>
            </div>
          </div>
        )}

        {/* Análise de Engajamento */}
        {summary && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Análise de Engajamento</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nível de Engajamento */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Nível Geral de Engajamento</h3>
                {(() => {
                  const engagement = getEngagementLevel(summary.averageScrollDepth, summary.averageTimeOnPage)
                  return (
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-lg text-lg font-bold ${engagement.color}`}>
                        {engagement.label}
                      </span>
                      <div className="text-sm text-gray-500">
                        <p>Baseado em {summary.averageScrollDepth}% de scroll</p>
                        <p>e {summary.averageTimeOnPage}s de tempo médio</p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Insights */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">💡 Insights</h3>
                <ul className="space-y-2 text-sm">
                  {summary.bounceRate > 70 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">⚠️</span>
                      <span>Taxa de rejeição alta. Considere melhorar o conteúdo inicial da página.</span>
                    </li>
                  )}
                  {summary.averageScrollDepth < 50 && (
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500">💡</span>
                      <span>Visitantes não estão vendo toda a página. Considere reorganizar o conteúdo.</span>
                    </li>
                  )}
                  {summary.averageTimeOnPage < 15 && (
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">⏱️</span>
                      <span>Tempo na página baixo. O conteúdo pode não estar engajando o suficiente.</span>
                    </li>
                  )}
                  {summary.bounceRate <= 70 && summary.averageScrollDepth >= 50 && summary.averageTimeOnPage >= 15 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✅</span>
                      <span>Boa performance! Continue monitorando e fazendo melhorias incrementais.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Performance por Layout */}
        {layoutPerformance.length > 0 && !selectedLayout && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Performance por Layout</h2>
            
            <div className="space-y-3">
              {layoutPerformance.map((lp, index) => (
                <div key={lp.layoutId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{lp.layoutName}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Eye size={14} /> {lp.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} /> {lp.visitors} visitantes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {lp.avgTime}s
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 size={14} /> {lp.avgScroll}%
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    getEngagementLevel(lp.avgScroll, lp.avgTime).color
                  }`}>
                    {getEngagementLevel(lp.avgScroll, lp.avgTime).label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico Diário */}
        {dailyStats.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Últimos Dias</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Views</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Visitantes</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Tempo Médio</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Scroll Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStats.map((day) => (
                    <tr key={day.date} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{day.date}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{day.views}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{day.visitors}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{day.avgTime}s</td>
                      <td className="py-3 px-4 text-right text-gray-600">{day.avgScroll}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Eventos Detalhados (colapsável) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900 text-left">📋 Eventos Detalhados</h2>
              <p className="text-sm text-gray-500 text-left">{analytics.length} eventos registrados (clique para {showDetails ? 'ocultar' : 'expandir'})</p>
            </div>
            {showDetails ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          
          {showDetails && (
            <>
              {analytics.length === 0 ? (
                <div className="p-12 text-center border-t">
                  <Activity size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado ainda</h3>
                  <p className="text-gray-500">Os eventos aparecerão aqui conforme os visitantes interagem</p>
                </div>
              ) : (
                <div className="border-t max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layout</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {analytics.slice(0, 50).map((event) => {
                        const layout = layouts.find(l => l.id === event.layout_id)
                        const eventData = event.event_data as any
                        
                        const eventLabels: Record<string, { label: string; icon: string }> = {
                          page_view: { label: 'Visita', icon: '👁️' },
                          scroll: { label: 'Scroll', icon: '📜' },
                          time_on_page: { label: 'Tempo', icon: '⏱️' },
                          click: { label: 'Clique', icon: '👆' },
                        }
                        
                        const eventInfo = eventLabels[event.event_type] || { label: event.event_type, icon: '📌' }
                        
                        return (
                          <tr key={event.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(event.created_at).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-sm">
                                {eventInfo.icon} {eventInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {layout?.name || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {event.event_type === 'scroll' && `${eventData?.scroll_depth || 0}% da página`}
                              {event.event_type === 'time_on_page' && `${eventData?.time_seconds || 0} segundos`}
                              {event.event_type === 'page_view' && 'Nova visita'}
                              {event.event_type === 'click' && (eventData?.text || 'Botão clicado')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

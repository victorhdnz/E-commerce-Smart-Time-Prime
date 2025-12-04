'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { LandingLayout, LandingVersion, LandingAnalytics } from '@/types'
import { BarChart3, TrendingUp, MousePointer, Clock, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'

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
  const { isAuthenticated, profile, loading: authLoading } = useAuth()
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

    if (!isAuthenticated || (profile?.role !== 'admin' && profile?.role !== 'editor')) {
      router.push('/')
      return
    }

    loadLayouts()
  }, [isAuthenticated, profile, authLoading, router])

  useEffect(() => {
    if (selectedLayout) {
      loadVersions(selectedLayout)
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
      if (data && data.length > 0 && !selectedLayout) {
        setSelectedLayout(data[0].id)
      }
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
    if (!selectedLayout) return

    try {
      const dateFilter = getDateFilter(dateRange)
      
      let query = supabase
        .from('landing_analytics')
        .select('*')
        .eq('layout_id', selectedLayout)
        .gte('created_at', dateFilter)

      if (selectedVersion) {
        query = query.eq('version_id', selectedVersion)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

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
      ? scrolls.reduce((sum, s) => sum + (s.event_data.scroll_depth || 0), 0) / scrolls.length
      : 0

    const avgTimeOnPage = timeOnPage.length > 0
      ? timeOnPage.reduce((sum, t) => sum + (t.event_data.time_seconds || 0), 0) / timeOnPage.length
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  const currentLayout = layouts.find(l => l.id === selectedLayout)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-gray-600">Acompanhe o desempenho das suas landing pages</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Layout</label>
              <select
                value={selectedLayout || ''}
                onChange={(e) => {
                  setSelectedLayout(e.target.value)
                  setSelectedVersion(null)
                }}
                className="w-full border rounded-lg px-4 py-2"
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
                  className="w-full border rounded-lg px-4 py-2"
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
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="all">Todo o período</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumo */}
        {summary && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Visualizações</h3>
                <Eye className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold">{summary.totalViews.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Cliques</h3>
                <MousePointer className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold">{summary.totalClicks.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Conversões</h3>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold">{summary.totalConversions.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Tempo Médio</h3>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold">{summary.averageTimeOnPage}s</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Scroll Médio</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold">{summary.averageScrollDepth}%</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Taxa de Rejeição</h3>
                <X className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold">{summary.bounceRate}%</p>
            </div>
          </div>
        )}

        {/* Lista de eventos recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Eventos Recentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Elemento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.slice(0, 50).map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(event.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.event_type === 'conversion' ? 'bg-green-100 text-green-800' :
                        event.event_type === 'click' ? 'bg-blue-100 text-blue-800' :
                        event.event_type === 'page_view' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.event_data?.element || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {event.event_type === 'scroll' && `Scroll: ${event.event_data?.scroll_depth}%`}
                      {event.event_type === 'time_on_page' && `Tempo: ${event.event_data?.time_seconds}s`}
                      {event.event_type === 'click' && event.event_data?.text && `Texto: ${event.event_data.text}`}
                      {event.event_type === 'conversion' && 'Conversão registrada'}
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


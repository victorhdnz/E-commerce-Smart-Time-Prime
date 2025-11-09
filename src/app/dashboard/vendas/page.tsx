'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { BackButton } from '@/components/ui/BackButton'
import { formatCurrency } from '@/lib/utils/format'
import { formatDateTime } from '@/lib/utils/format'
import { 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  Filter, 
  Download,
  MapPin,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

interface SalesData {
  orders: any[]
  totalSales: number
  totalOrders: number
  salesByLocation: Record<string, { total: number; count: number }>
}

export default function DashboardSalesPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState<SalesData>({
    orders: [],
    totalSales: 0,
    totalOrders: 0,
    salesByLocation: {},
  })
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>('today')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isEditor)) {
      router.push('/')
    } else if (isAuthenticated && isEditor) {
      loadSalesData()
    }
  }, [isAuthenticated, isEditor, authLoading, router, dateFilter, customStartDate, customEndDate])

  const getDateRange = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    switch (dateFilter) {
      case 'today':
        const todayEnd = new Date(today)
        todayEnd.setHours(23, 59, 59, 999)
        return { start: today.toISOString(), end: todayEnd.toISOString() }
      
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - 7)
        const weekEnd = new Date(today)
        weekEnd.setHours(23, 59, 59, 999)
        return { start: weekStart.toISOString(), end: weekEnd.toISOString() }
      
      case 'month':
        const monthStart = new Date(today)
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)
        const monthEnd = new Date(today)
        monthEnd.setHours(23, 59, 59, 999)
        return { start: monthStart.toISOString(), end: monthEnd.toISOString() }
      
      case 'custom':
        if (!customStartDate || !customEndDate) {
          return null
        }
        const start = new Date(customStartDate)
        start.setHours(0, 0, 0, 0)
        const end = new Date(customEndDate)
        end.setHours(23, 59, 59, 999)
        return { start: start.toISOString(), end: end.toISOString() }
      
      default:
        return null
    }
  }

  const loadSalesData = async () => {
    try {
      setLoading(true)
      const dateRange = getDateRange()
      
      if (!dateRange) {
        setSalesData({ orders: [], totalSales: 0, totalOrders: 0, salesByLocation: {} })
        setLoading(false)
        return
      }

      // Buscar pedidos do site (e-commerce) no período
      const { data: siteOrders, error: siteError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total,
          status,
          created_at,
          shipping_address,
          user_id,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false })

      if (siteError) throw siteError

      // Mapear pedidos do site
      const allOrders = (siteOrders || []).map((order: any) => ({
        id: order.id,
        numero: order.order_number || order.id.substring(0, 8),
        data: order.created_at,
        situacao: order.status,
        total: parseFloat(order.total.toString()),
        cliente: {
          nome: order.profiles?.full_name || 'Cliente',
          email: order.profiles?.email,
        },
        endereco: order.shipping_address,
      })).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

      // Calcular totais
      const totalSales = allOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      const totalOrders = allOrders.length

      // Agrupar por localidade
      const salesByLocation: Record<string, { total: number; count: number }> = {}
      allOrders.forEach((order) => {
        let location = 'Não informado'
        
        if (order.endereco) {
          const addr = typeof order.endereco === 'string' 
            ? JSON.parse(order.endereco) 
            : order.endereco
          location = `${addr.city || ''}/${addr.state || ''}`.trim() || 'Não informado'
        }

        if (!salesByLocation[location]) {
          salesByLocation[location] = { total: 0, count: 0 }
        }
        salesByLocation[location].total += order.total || 0
        salesByLocation[location].count += 1
      })

      setSalesData({
        orders: allOrders,
        totalSales,
        totalOrders,
        salesByLocation,
      })
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
      toast.error('Erro ao carregar dados de vendas')
    } finally {
      setLoading(false)
    }
  }

  const escapeCSVField = (field: any): string => {
    if (field === null || field === undefined) return ''
    const str = String(field)
    // Se contém vírgula, aspas ou quebra de linha, precisa ser escapado
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      // Escapar aspas duplicando-as e envolver em aspas
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const handleExportCSV = () => {
    // Cabeçalho com separador ponto-e-vírgula (padrão brasileiro)
    const headers = ['Data', 'Número', 'Cliente', 'Total', 'Status', 'Localidade']
    const rows = salesData.orders.map(order => {
      const date = new Date(order.data).toLocaleDateString('pt-BR')
      const location = order.endereco
        ? (() => {
            const addr = typeof order.endereco === 'string' 
              ? JSON.parse(order.endereco) 
              : order.endereco
            return `${addr.city || ''}/${addr.state || ''}`.trim() || 'Não informado'
          })()
        : 'Não informado'
      
      return [
        escapeCSVField(date),
        escapeCSVField(order.numero || ''),
        escapeCSVField(order.cliente?.nome || 'Cliente'),
        order.total?.toFixed(2).replace('.', ',') || '0,00',
        escapeCSVField(order.situacao || order.status || ''),
        escapeCSVField(location),
      ]
    })

    // Criar CSV com separador ponto-e-vírgula
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
    ].join('\n')

    // Adicionar BOM UTF-8 para compatibilidade com planilhas e editores
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `vendas_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Relatório exportado com sucesso!')
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
        <div className="mb-6">
          <BackButton href="/dashboard" />
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Vendas e Pedidos</h1>
            <p className="text-gray-600">
              Visualize e filtre todas as vendas do e-commerce
            </p>
          </div>
          <Button onClick={handleExportCSV} variant="outline">
            <Download size={18} className="mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={20} className="text-gray-500" />
              <label className="text-sm font-medium">Período:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="today">Hoje</option>
                <option value="week">Últimos 7 dias</option>
                <option value="month">Este mês</option>
                <option value="custom">Período personalizado</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar size={20} className="text-gray-500" />
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <span className="text-gray-500">até</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total de Vendas</h3>
              <DollarSign size={24} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(salesData.totalSales)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Quantidade de Pedidos</h3>
              <ShoppingBag size={24} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{salesData.totalOrders}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Ticket Médio</h3>
              <TrendingUp size={24} className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold">
              {salesData.totalOrders > 0 
                ? formatCurrency(salesData.totalSales / salesData.totalOrders)
                : formatCurrency(0)
              }
            </p>
          </div>
        </div>

        {/* Vendas por Localidade */}
        {Object.keys(salesData.salesByLocation).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Vendas por Localidade
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(salesData.salesByLocation)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([location, data]) => (
                  <div key={location} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{location}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        {data.count} pedido(s)
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(data.total)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Lista de Vendas */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Pedidos</h2>
          </div>
          
          {salesData.orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma venda encontrada
              </h3>
              <p className="text-gray-500">
                Não há vendas no período selecionado
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesData.orders.map((order) => {
                    const location = order.endereco
                      ? (() => {
                          const addr = typeof order.endereco === 'string' 
                            ? JSON.parse(order.endereco) 
                            : order.endereco
                          return `${addr.city || ''}/${addr.state || ''}`.trim() || 'Não informado'
                        })()
                      : 'Não informado'
                    
                    return (
                      <tr key={order.id || order.numero} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDateTime(order.data)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          #{order.numero}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div>
                            <div className="font-medium">{order.cliente?.nome || 'Cliente'}</div>
                            {order.cliente?.email && (
                              <div className="text-xs text-gray-500">{order.cliente.email}</div>
                            )}
                            {location !== 'Não informado' && (
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin size={12} />
                                {location}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            (order.situacao || order.status) === 'pendente' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : (order.situacao || order.status) === 'cancelado'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {order.situacao || order.status || 'pendente'}
                          </span>
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


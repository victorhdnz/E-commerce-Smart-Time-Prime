import { NextResponse } from 'next/server'
import { blingClient } from '@/lib/bling/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar dados em paralelo
    const [
      blingTodaySales,
      blingNewOrders,
      blingProducts,
      siteTodaySales,
      siteNewOrders,
      totalClients,
      activeProductsCount,
    ] = await Promise.all([
      // Vendas de hoje do Bling
      blingClient.getTodaySales().catch(() => 0),
      
      // Novos pedidos do Bling (últimas 24h)
      blingClient.getNewOrders().catch(() => 0),
      
      // Produtos do Bling
      blingClient.getProducts(1000).then(p => p.length).catch(() => 0),
      
      // Vendas de hoje do site (pedidos criados hoje no Supabase)
      // Soma o valor total de TODOS os pedidos criados hoje (independente do status)
      (async () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayEnd = new Date(today)
        todayEnd.setHours(23, 59, 59, 999)
        
        // Buscar TODOS os pedidos de hoje (sem filtro de status)
        const { data } = await supabase
          .from('orders')
          .select('total')
          .gte('created_at', today.toISOString())
          .lte('created_at', todayEnd.toISOString())
        
        if (!data || data.length === 0) return 0
        
        // Somar o total de TODOS os pedidos de hoje
        const total = data.reduce((sum, order) => {
          const orderTotal = parseFloat(order.total.toString()) || 0
          return sum + orderTotal
        }, 0)
        
        return total
      })(),
      
      // Novos pedidos do site (apenas de hoje)
      (async () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayEnd = new Date(today)
        todayEnd.setHours(23, 59, 59, 999)
        
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString())
          .lte('created_at', todayEnd.toISOString())
        
        return count || 0
      })(),
      
      // Total de clientes (profiles com login)
      (async () => {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        
        return count || 0
      })(),
      
      // Produtos ativos no site (sincronizados ou criados manualmente)
      (async () => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
        
        return count || 0
      })(),
    ])

    // Combinar vendas: Bling + Site
    const totalTodaySales = blingTodaySales + siteTodaySales
    
    // Combinar novos pedidos: Bling + Site
    const totalNewOrders = blingNewOrders + siteNewOrders

    return NextResponse.json({
      success: true,
      stats: {
        todaySales: totalTodaySales,
        newOrders: totalNewOrders,
        activeProducts: Math.max(activeProductsCount, blingProducts), // Usar o maior entre site e Bling
        clients: totalClients,
      },
    })
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


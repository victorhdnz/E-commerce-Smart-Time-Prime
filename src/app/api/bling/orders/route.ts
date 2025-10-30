import { NextResponse } from 'next/server'
import { blingClient } from '@/lib/bling/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar pedidos do Bling primeiro para identificar a última data com vendas
    const recentBlingOrders = await blingClient.getOrders({ limit: 500 }).catch(() => [])
    
    // Identificar a data do pedido mais recente do Bling (última data com vendas)
    let targetDateStr: string | null = null
    if (recentBlingOrders.length > 0) {
      // Pegar a data do pedido mais recente
      const latestOrder = recentBlingOrders[0]
      const latestDate = new Date(latestOrder.data)
      targetDateStr = `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}-${String(latestDate.getDate()).padStart(2, '0')}`
    } else {
      // Se não tem pedidos do Bling, usar data de hoje
      const today = new Date()
      targetDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    }

    // Criar range da data alvo (00:00 até 23:59:59)
    const targetDate = targetDateStr ? new Date(targetDateStr + 'T00:00:00') : new Date()
    const targetStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0)
    const targetEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999)

    // Buscar pedidos do Bling e do site da data alvo
    const [blingOrders, siteOrders] = await Promise.all([
      // Pedidos do Bling da data alvo
      (async () => {
        try {
          // Buscar com filtro de data
          const orders = await blingClient.getOrders({
            dataInicial: targetDateStr!,
            dataFinal: targetDateStr!,
          })
          
          // Se não retornou nada, filtrar dos pedidos recentes que já buscamos
          if (orders.length === 0 && recentBlingOrders.length > 0) {
            return recentBlingOrders.filter(order => {
              try {
                const orderDate = new Date(order.data)
                const orderDateStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`
                return orderDateStr === targetDateStr
              } catch {
                return false
              }
            })
          }
          
          return orders
        } catch {
          // Fallback: usar pedidos recentes já buscados e filtrar
          if (recentBlingOrders.length > 0) {
            return recentBlingOrders.filter(order => {
              try {
                const orderDate = new Date(order.data)
                const orderDateStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`
                return orderDateStr === targetDateStr
              } catch {
                return false
              }
            })
          }
          return []
        }
      })(),
      
      // Pedidos do site da data alvo
      (async () => {
        const { data } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total,
            status,
            created_at,
            user_id,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .gte('created_at', targetStart.toISOString())
          .lte('created_at', targetEnd.toISOString())
          .order('created_at', { ascending: false })
        
        if (!data) return []
        
        return data.map((order: any) => ({
          numero: order.order_number || order.id.substring(0, 8),
          data: order.created_at,
          situacao: order.status,
          total: parseFloat(order.total.toString()),
          cliente: {
            nome: order.profiles?.full_name || 'Cliente',
            email: order.profiles?.email,
          },
          origem: 'site',
        }))
      })(),
    ])

    // Combinar e filtrar apenas pedidos da data alvo (verificação final)
    const allOrders = [...blingOrders, ...siteOrders]
      .filter(order => {
        try {
          const orderDate = new Date(order.data)
          const orderDateStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`
          return orderDateStr === targetDateStr
        } catch {
          return false
        }
      })
      .sort((a, b) => 
        new Date(b.data).getTime() - new Date(a.data).getTime()
      )

    return NextResponse.json({ success: true, orders: allOrders })
  } catch (error: any) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


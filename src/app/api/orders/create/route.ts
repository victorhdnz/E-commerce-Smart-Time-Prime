import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const {
      order_number,
      user_id,
      subtotal,
      shipping_cost,
      total,
      payment_method,
      shipping_address,
      items,
    } = body

    // Criar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        user_id,
        status: 'pending',
        subtotal,
        shipping_cost,
        total,
        payment_method,
        payment_status: 'pending',
        shipping_address,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Criar itens do pedido
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      color_id: item.color_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
      is_gift: item.is_gift || false,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json({
      success: true,
      order,
      message: 'Pedido criado com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao criar pedido',
      },
      { status: 500 }
    )
  }
}


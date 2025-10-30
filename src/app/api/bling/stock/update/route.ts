import { NextResponse } from 'next/server'
import { blingClient } from '@/lib/bling/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Atualizar estoque no Bling após venda no site
 */
export async function POST(request: Request) {
  try {
    const { productId, quantity, operation = 'decrease' } = await request.json()

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'productId e quantity são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar produto no Supabase para obter bling_id
    const { data: product } = await supabase
      .from('products')
      .select('bling_id, stock')
      .eq('id', productId)
      .single()

    if (!product?.bling_id) {
      return NextResponse.json(
        { success: false, error: 'Produto não está vinculado ao Bling' },
        { status: 400 }
      )
    }

    // Buscar produto atual do Bling
    const blingProduct = await blingClient.getProductById(product.bling_id)

    if (!blingProduct) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado no Bling' },
        { status: 404 }
      )
    }

    // Calcular novo estoque
    const currentStock = blingProduct.estoqueAtual || 0
    const newStock = operation === 'decrease' 
      ? Math.max(0, currentStock - quantity) 
      : currentStock + quantity

    // Atualizar estoque no Bling
    const updated = await blingClient.updateProductStock(
      product.bling_id,
      newStock
    )

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar estoque no Bling' },
        { status: 500 }
      )
    }

    // Atualizar estoque no Supabase também
    await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)

    return NextResponse.json({
      success: true,
      oldStock: currentStock,
      newStock,
      message: `Estoque atualizado: ${currentStock} → ${newStock}`,
    })
  } catch (error: any) {
    console.error('Erro ao atualizar estoque:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


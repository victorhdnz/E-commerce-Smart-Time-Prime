import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Buscar todos os produtos ativos (sem limite)
    // Sem cache para garantir produtos atualizados
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        colors:product_colors(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }

    // Garantir que o campo images seja sempre um array válido
    const normalizedProducts = (products || []).map((product: any) => {
      // Se images for string, parsear como JSON
      if (typeof product.images === 'string') {
        try {
          product.images = JSON.parse(product.images)
        } catch (e) {
          // Se falhar o parse, usar array vazio
          product.images = []
        }
      }
      // Garantir que seja sempre um array
      if (!Array.isArray(product.images)) {
        product.images = []
      }
      return product
    })

    return NextResponse.json({
      success: true,
      count: normalizedProducts?.length || 0,
      products: normalizedProducts || [],
      message: normalizedProducts?.length ? 'Produtos encontrados' : 'Nenhum produto ativo encontrado'
    })
  } catch (error: any) {
    console.error('Erro na API de produtos:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 })
  }
}
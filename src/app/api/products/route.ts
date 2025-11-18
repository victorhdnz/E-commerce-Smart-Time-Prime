import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Cache por 60 segundos (ISR - Incremental Static Regeneration)
export const revalidate = 60

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Buscar todos os produtos ativos (sem limite)
    // Query otimizada - selecionar apenas campos necessários
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        short_description,
        description,
        category,
        local_price,
        national_price,
        images,
        is_featured,
        is_active,
        created_at,
        colors:product_colors(
          id,
          name,
          hex_code,
          images,
          stock
        )
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
    }, {
      headers: {
        // Cache por 60 segundos no cliente e CDN
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      }
    })
  } catch (error: any) {
    console.error('Erro na API de produtos:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { blingClient } from '@/lib/bling/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Sincronizar produtos do Bling com o banco local
 * Busca produtos do Bling e atualiza/cria no Supabase
 * Opções: ?onlyWithStock=true para sincronizar apenas produtos com estoque
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const onlyWithStock = searchParams.get('onlyWithStock') === 'true'
    
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar produtos do Bling
    console.log('🔄 Iniciando sincronização de produtos do Bling...')
    
    let allBlingProducts: any[] = []
    
    try {
      allBlingProducts = await blingClient.getProducts(1000)
      
      console.log(`📦 Produtos recebidos do Bling: ${allBlingProducts?.length || 0}`)

      if (!allBlingProducts || allBlingProducts.length === 0) {
        console.error('❌ Nenhum produto retornado do Bling')
        return NextResponse.json({
          success: false,
          error: 'Nenhum produto encontrado no Bling. Verifique se há produtos cadastrados no Bling e se a API está configurada corretamente.',
          details: 'A API do Bling não retornou nenhum produto. Verifique: 1) Se há produtos cadastrados no Bling, 2) Se o token/API Key está correto, 3) Se a conexão com o Bling está funcionando.',
        }, { status: 404 })
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar produtos do Bling:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar produtos do Bling',
        details: error.message || 'Verifique se o Bling está configurado corretamente e se o token/API Key está válido.',
      }, { status: 500 })
    }

    // Filtrar produtos com estoque se solicitado
    const blingProducts = onlyWithStock 
      ? allBlingProducts.filter(product => product.estoqueAtual && product.estoqueAtual > 0)
      : allBlingProducts

    if (blingProducts.length === 0) {
      return NextResponse.json({
        success: false,
        error: onlyWithStock 
          ? `Nenhum produto com estoque encontrado (${allBlingProducts.length} produtos sem estoque ignorados)`
          : 'Nenhum produto encontrado no Bling',
      })
    }

    let synced = 0
    let created = 0
    let updated = 0

    // Para cada produto do Bling
    for (const blingProduct of blingProducts) {
      try {
        // Verificar se produto já existe (primeiro por bling_id, depois por nome)
        let existing = null
        
        if (blingProduct.id) {
          const { data } = await supabase
            .from('products')
            .select('id, bling_id, local_price, national_price')
            .eq('bling_id', blingProduct.id)
            .limit(1)
            .maybeSingle()
          existing = data
        }
        
        // Se não encontrou por bling_id, buscar por nome exato (case insensitive)
        if (!existing && blingProduct.nome) {
          const { data } = await supabase
            .from('products')
            .select('id, bling_id, local_price, national_price')
            .ilike('name', blingProduct.nome.trim())
            .limit(1)
            .maybeSingle()
          existing = data
        }

        // Criar slug do nome
        const slug = blingProduct.nome
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')

        const productData: any = {
          name: blingProduct.nome,
          slug: slug,
          description: blingProduct.descricao || '',
          short_description: blingProduct.descricao?.substring(0, 150) || null,
          bling_price: blingProduct.preco,
          local_price: blingProduct.preco, // Usar preço do Bling como local
          national_price: blingProduct.preco, // Pode ajustar depois
          stock: blingProduct.estoqueAtual || 0,
          bling_id: blingProduct.id,
          category: blingProduct.categoria || null,
          is_active: true,
          is_featured: false,
          updated_at: new Date().toISOString(),
        }

        if (existing) {
          // Atualizar produto existente (preservar campos que não vêm do Bling)
          await supabase
            .from('products')
            .update({
              name: productData.name,
              bling_price: productData.bling_price,
              stock: productData.stock,
              bling_id: productData.bling_id,
              description: productData.description,
              short_description: productData.short_description,
              category: productData.category,
              updated_at: productData.updated_at,
              // Preservar preços locais/nacionais se já existirem
              // Mas atualizar se forem null
              ...(existing.local_price === null && { local_price: productData.local_price }),
              ...(existing.national_price === null && { national_price: productData.national_price }),
            })
            .eq('id', existing.id)
          updated++
        } else {
          // Criar novo produto
          await supabase
            .from('products')
            .insert(productData)
          created++
        }

        synced++
      } catch (error: any) {
        console.error(`Erro ao sincronizar produto ${blingProduct.nome}:`, error)
      }
    }

    // Estatísticas finais
    const productsWithStock = blingProducts.filter(p => p.estoqueAtual && p.estoqueAtual > 0).length
    const productsWithoutStock = blingProducts.length - productsWithStock
    const totalFound = allBlingProducts.length

    return NextResponse.json({
      success: true,
      synced,
      created,
      updated,
      totalFound,
      productsWithStock,
      productsWithoutStock,
      onlyWithStock,
      message: onlyWithStock 
        ? `Sincronizados ${synced} produtos com estoque (${created} criados, ${updated} atualizados). ${allBlingProducts.length - blingProducts.length} produtos sem estoque ignorados.`
        : `Sincronizados ${synced} produtos (${created} criados, ${updated} atualizados). ${productsWithStock} com estoque, ${productsWithoutStock} sem estoque.`,
    })
  } catch (error: any) {
    console.error('Erro ao sincronizar produtos:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


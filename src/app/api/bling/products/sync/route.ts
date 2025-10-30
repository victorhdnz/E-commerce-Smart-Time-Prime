import { NextResponse } from 'next/server'
import { blingClient } from '@/lib/bling/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Sincronizar produtos do Bling com o banco local
 * Busca produtos do Bling e atualiza/cria no Supabase
 */
export async function POST() {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar produtos do Bling
    const blingProducts = await blingClient.getProducts(1000)

    if (!blingProducts || blingProducts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum produto encontrado no Bling',
      })
    }

    let synced = 0
    let created = 0
    let updated = 0

    // Para cada produto do Bling
    for (const blingProduct of blingProducts) {
      try {
        // Verificar se produto já existe (por bling_id ou nome)
        const { data: existing } = await supabase
          .from('products')
          .select('id, bling_id, local_price, national_price')
          .or(`bling_id.eq.${blingProduct.id},name.ilike.%${blingProduct.nome}%`)
          .limit(1)
          .maybeSingle()

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
              bling_product_id: productData.bling_product_id,
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

    return NextResponse.json({
      success: true,
      synced,
      created,
      updated,
      message: `Sincronizados ${synced} produtos (${created} criados, ${updated} atualizados)`,
    })
  } catch (error: any) {
    console.error('Erro ao sincronizar produtos:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


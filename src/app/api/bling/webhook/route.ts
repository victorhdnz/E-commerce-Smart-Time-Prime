import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * Webhook do Bling para receber notificações em tempo real
 * Baseado na documentação: https://developer.bling.com.br/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('X-Bling-Signature-256')
    
    // Verificar autenticação do webhook
    if (!verifyWebhookSignature(body, signature)) {
      console.error('❌ Webhook signature inválida')
      return NextResponse.json(
        { error: 'Signature inválida' },
        { status: 401 }
      )
    }

    const payload = JSON.parse(body)
    console.log('📥 Webhook recebido:', payload)

    // Processar diferentes tipos de eventos
    const { event, data } = payload

    switch (event) {
      case 'produto.criado':
      case 'produto.alterado':
      case 'produto.atualizado':
        await handleProductEvent(data)
        break
      
      case 'produto.excluido':
        await handleProductDeleted(data)
        break
      
      case 'pedidoVenda.criado':
      case 'pedidoVenda.alterado':
      case 'pedido.criado':
      case 'pedido.atualizado':
        await handleOrderEvent(data)
        break
      
      case 'pedidoVenda.excluido':
      case 'pedido.excluido':
        await handleOrderDeleted(data)
        break
      
      case 'estoqueProduto.alterado':
        await handleStockChange(data)
        break
      
      default:
        console.log(`ℹ️ Evento não processado: ${event}`, data)
    }

    // Retornar 200 para confirmar recebimento
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}

/**
 * Verificar assinatura do webhook usando HMAC SHA-256
 * Baseado na documentação do Bling
 */
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false

  const clientSecret = process.env.BLING_CLIENT_SECRET
  if (!clientSecret) {
    console.error('❌ BLING_CLIENT_SECRET não configurado')
    return false
  }

  // Remover o prefixo "sha256=" da assinatura
  const receivedSignature = signature.replace('sha256=', '')
  
  // Gerar hash HMAC usando o payload e client secret
  const expectedSignature = crypto
    .createHmac('sha256', clientSecret)
    .update(payload, 'utf8')
    .digest('hex')

  // Comparar assinaturas de forma segura
  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

/**
 * Processar eventos de produto (criado/atualizado)
 */
async function handleProductEvent(productData: any) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const blingId = productData.id?.toString()
    if (!blingId) {
      console.error('❌ Produto sem ID do Bling')
      return
    }

    // Verificar se produto já existe
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, local_price, national_price')
      .eq('bling_id', blingId)
      .maybeSingle()

    const productPayload = {
      bling_id: blingId,
      name: productData.nome || productData.name || '',
      slug: (productData.nome || productData.name || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, ''),
      description: productData.descricao || productData.description || '',
      short_description: (productData.descricao || productData.description || '').substring(0, 150),
      bling_price: parseFloat(productData.preco || productData.price || '0'),
      local_price: parseFloat(productData.preco || productData.price || '0'),
      national_price: parseFloat(productData.preco || productData.price || '0'),
      stock: parseInt(productData.estoqueAtual || productData.stock || '0'),
      category: productData.categoria?.descricao || productData.categoria || productData.category || null,
      updated_at: new Date().toISOString(),
    }

    // Preservar preços locais/nacionais se já existirem
    if (existingProduct) {
      productPayload.local_price = existingProduct.local_price || productPayload.bling_price
      productPayload.national_price = existingProduct.national_price || productPayload.bling_price
    }

    if (existingProduct) {
      // Atualizar produto existente
      await supabase
        .from('products')
        .update({
          ...productPayload,
          // Preservar preços locais/nacionais se já existirem
          local_price: existingProduct.local_price || productPayload.local_price,
          national_price: existingProduct.national_price || productPayload.national_price,
        })
        .eq('id', existingProduct.id)
      
      console.log(`✅ Produto ${blingId} atualizado via webhook: ${productPayload.name}`)
    } else {
      // Criar novo produto
      await supabase
        .from('products')
        .insert({
          ...productPayload,
          is_active: true,
          is_featured: false,
          created_at: new Date().toISOString(),
        })
      
      console.log(`✅ Produto ${blingId} criado via webhook: ${productPayload.name}`)
    }

  } catch (error) {
    console.error('❌ Erro ao processar evento de produto:', error)
  }
}

/**
 * Processar exclusão de produto
 */
async function handleProductDeleted(productData: any) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const blingId = productData.id?.toString()
    if (!blingId) return

    // Marcar produto como inativo em vez de excluir
    await supabase
      .from('products')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('bling_id', blingId)

    console.log(`✅ Produto ${blingId} desativado via webhook`)

  } catch (error) {
    console.error('❌ Erro ao processar exclusão de produto:', error)
  }
}

/**
 * Processar eventos de pedido
 */
async function handleOrderEvent(orderData: any) {
  try {
    console.log(`📦 Pedido ${orderData.numero || orderData.id} processado via webhook`)
    // Os pedidos do Bling não precisam ser salvos no banco do site
    // Eles já são buscados via API quando necessário
    // Aqui podemos apenas registrar o evento se necessário

  } catch (error) {
    console.error('❌ Erro ao processar evento de pedido:', error)
  }
}

/**
 * Processar exclusão de pedido
 */
async function handleOrderDeleted(orderData: any) {
  try {
    console.log(`📦 Pedido ${orderData.numero || orderData.id} excluído via webhook`)
    // Os pedidos do Bling não são salvos no banco, apenas registramos o evento

  } catch (error) {
    console.error('❌ Erro ao processar exclusão de pedido:', error)
  }
}

/**
 * Processar mudanças de estoque
 */
async function handleStockChange(stockData: any) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const blingId = stockData.idProduto?.toString() || stockData.product_id?.toString() || stockData.id?.toString()

    if (!blingId) {
      console.error('❌ Estoque sem ID do produto')
      return
    }

    // Atualizar estoque do produto
    await supabase
      .from('products')
      .update({
        stock: parseInt(stockData.estoqueAtual || stockData.stock || '0'),
        updated_at: new Date().toISOString(),
      })
      .eq('bling_id', blingId)

    console.log(`✅ Estoque do produto ${blingId} atualizado via webhook: ${stockData.estoqueAtual || stockData.stock}`)

  } catch (error) {
    console.error('❌ Erro ao processar mudança de estoque:', error)
  }
}
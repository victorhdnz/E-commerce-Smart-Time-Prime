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
      case 'produto.atualizado':
        await handleProductEvent(data)
        break
      
      case 'produto.excluido':
        await handleProductDeleted(data)
        break
      
      case 'pedido.criado':
      case 'pedido.atualizado':
        await handleOrderEvent(data)
        break
      
      default:
        console.log(`ℹ️ Evento não processado: ${event}`)
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

    // Verificar se produto já existe
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('bling_id', productData.id)
      .single()

    const productPayload = {
      bling_id: productData.id,
      name: productData.nome,
      slug: productData.nome?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim(),
      description: productData.descricao || '',
      short_description: productData.descricaoComplementar || '',
      bling_price: parseFloat(productData.preco) || 0,
      local_price: parseFloat(productData.preco) || 0,
      national_price: parseFloat(productData.preco) || 0,
      stock: productData.estoqueAtual || 0,
      category: productData.categoria?.descricao || 'Geral',
      is_active: true,
      updated_at: new Date().toISOString(),
    }

    if (existingProduct) {
      // Atualizar produto existente
      await supabase
        .from('products')
        .update(productPayload)
        .eq('bling_id', productData.id)
      
      console.log(`✅ Produto atualizado via webhook: ${productData.nome}`)
    } else {
      // Criar novo produto
      await supabase
        .from('products')
        .insert({
          ...productPayload,
          created_at: new Date().toISOString(),
        })
      
      console.log(`✅ Produto criado via webhook: ${productData.nome}`)
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

    // Marcar produto como inativo em vez de excluir
    await supabase
      .from('products')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('bling_id', productData.id)

    console.log(`✅ Produto desativado via webhook: ${productData.id}`)

  } catch (error) {
    console.error('❌ Erro ao processar exclusão de produto:', error)
  }
}

/**
 * Processar eventos de pedido
 */
async function handleOrderEvent(orderData: any) {
  try {
    console.log(`📦 Pedido ${orderData.numero} processado via webhook`)
    // Aqui você pode implementar lógica específica para pedidos
    // Por exemplo: atualizar status, enviar emails, etc.

  } catch (error) {
    console.error('❌ Erro ao processar evento de pedido:', error)
  }
}
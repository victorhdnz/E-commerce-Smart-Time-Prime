import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * Webhook do Bling para receber notificações em tempo real
 * Baseado na documentação oficial: https://developer.bling.com.br/webhooks
 * 
 * Estrutura do payload:
 * {
 *   "eventId": "...",
 *   "date": "...",
 *   "version": "v1",
 *   "event": "product.created",
 *   "companyId": "...",
 *   "data": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('X-Bling-Signature-256')
    
    // Verificar autenticação do webhook (opcional, mas recomendado)
    if (signature && !verifyWebhookSignature(body, signature)) {
      console.error('❌ Webhook signature inválida')
      return NextResponse.json(
        { error: 'Signature inválida' },
        { status: 401 }
      )
    }

    const payload = JSON.parse(body)
    console.log('📥 Webhook recebido:', JSON.stringify(payload, null, 2))

    // Estrutura correta do payload conforme documentação
    const { event, data, eventId, date, companyId } = payload

    if (!event || !data) {
      console.error('❌ Payload inválido: falta event ou data')
      return NextResponse.json(
        { error: 'Payload inválido' },
        { status: 400 }
      )
    }

    // Processar diferentes tipos de eventos conforme documentação
    switch (event) {
      // Produtos
      case 'product.created':
      case 'product.updated':
        await handleProductEvent(data, event)
        break
      
      case 'product.deleted':
        await handleProductDeleted(data)
        break
      
      // Pedidos de Venda (order)
      case 'order.created':
      case 'order.updated':
        await handleOrderEvent(data, event)
        break
      
      case 'order.deleted':
        await handleOrderDeleted(data)
        break
      
      // Estoque (stock)
      case 'stock.created':
      case 'stock.updated':
      case 'stock.deleted':
        await handleStockChange(data, event)
        break
      
      // Estoque Virtual (virtual_stock)
      case 'virtual_stock.updated':
        await handleVirtualStockChange(data)
        break
      
      default:
        console.log(`ℹ️ Evento não processado: ${event}`, data)
    }

    // Retornar 200 em até 5 segundos para confirmar recebimento
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error: any) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Verificar assinatura do webhook usando HMAC SHA-256
 * Baseado na documentação do Bling
 */
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    // Se não houver assinatura, permitir (modo desenvolvimento ou sem verificação)
    console.warn('⚠️ Webhook sem assinatura - permitindo em desenvolvimento')
    return true
  }

  const clientSecret = process.env.BLING_CLIENT_SECRET
  if (!clientSecret) {
    console.error('❌ BLING_CLIENT_SECRET não configurado')
    return false
  }

  // Remover o prefixo "sha256=" da assinatura se existir
  const receivedSignature = signature.replace(/^sha256=/, '')
  
  // Gerar hash HMAC usando o payload e client secret
  const expectedSignature = crypto
    .createHmac('sha256', clientSecret)
    .update(payload, 'utf8')
    .digest('hex')

  // Comparar assinaturas de forma segura
  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    console.error('❌ Erro ao comparar assinaturas:', error)
    return false
  }
}

/**
 * Processar eventos de produto (created/updated)
 * Estrutura conforme documentação:
 * {
 *   "id": 12345678,
 *   "nome": "Copo do Bling",
 *   "codigo": "COD-4587",
 *   "tipo": "P",
 *   "situacao": "A",
 *   "preco": 4.99,
 *   "unidade": "UN",
 *   "formato": "S",
 *   "idProdutoPai": 12345678,
 *   "categoria": { "id": 12345679 },
 *   "descricaoCurta": "Descrição curta",
 *   "descricaoComplementar": "Descrição complementar"
 * }
 */
async function handleProductEvent(productData: any, event: string) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const blingId = productData.id?.toString()
    if (!blingId) {
      console.error('❌ Produto sem ID do Bling', productData)
      return
    }

    console.log(`📦 Processando produto ${blingId} (${event}):`, productData)

    // Verificar se produto já existe
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, bling_id, local_price, national_price, is_active')
      .eq('bling_id', blingId)
      .maybeSingle()

    // Extrair dados conforme estrutura da documentação
    const nome = productData.nome || ''
    const preco = parseFloat(productData.preco || '0')
    const situacao = productData.situacao || 'A' // A = Ativo, I = Inativo
    const descricaoCurta = productData.descricaoCurta || ''
    const descricaoComplementar = productData.descricaoComplementar || ''
    const descricao = `${descricaoCurta} ${descricaoComplementar}`.trim() || nome

    // Gerar slug a partir do nome
    const slug = nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .substring(0, 100) || `produto-${blingId}`

    const productPayload: any = {
      bling_id: blingId,
      name: nome,
      slug: slug,
      description: descricao,
      short_description: descricaoCurta.substring(0, 150) || nome.substring(0, 150),
      bling_price: preco,
      local_price: preco,
      national_price: preco,
      is_active: situacao === 'A', // A = Ativo, I = Inativo
      updated_at: new Date().toISOString(),
    }

    // Preservar preços locais/nacionais se já existirem
    if (existingProduct) {
      if (existingProduct.local_price !== null) {
        productPayload.local_price = existingProduct.local_price
      }
      if (existingProduct.national_price !== null) {
        productPayload.national_price = existingProduct.national_price
      }
      
      // Atualizar produto existente
      const { error: updateError } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', existingProduct.id)

      if (updateError) {
        console.error('❌ Erro ao atualizar produto:', updateError)
        throw updateError
      }
      
      console.log(`✅ Produto ${blingId} atualizado via webhook: ${nome}`)
    } else {
      // Criar novo produto
      productPayload.created_at = new Date().toISOString()
      productPayload.is_featured = false

      const { error: insertError } = await supabase
        .from('products')
        .insert(productPayload)

      if (insertError) {
        console.error('❌ Erro ao criar produto:', insertError)
        throw insertError
      }
      
      console.log(`✅ Produto ${blingId} criado via webhook: ${nome}`)
    }

  } catch (error: any) {
    console.error('❌ Erro ao processar evento de produto:', error)
    throw error
  }
}

/**
 * Processar exclusão de produto
 * Estrutura: { "id": 12345678 }
 */
async function handleProductDeleted(productData: any) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const blingId = productData.id?.toString()
    if (!blingId) {
      console.error('❌ Produto deletado sem ID', productData)
      return
    }

    // Marcar produto como inativo em vez de excluir
    const { error } = await supabase
      .from('products')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('bling_id', blingId)

    if (error) {
      console.error('❌ Erro ao desativar produto:', error)
      throw error
    }

    console.log(`✅ Produto ${blingId} desativado via webhook`)

  } catch (error: any) {
    console.error('❌ Erro ao processar exclusão de produto:', error)
    throw error
  }
}

/**
 * Processar eventos de pedido (created/updated)
 * Estrutura conforme documentação:
 * {
 *   "id": 12345678,
 *   "data": "2024-09-25",
 *   "numero": 123,
 *   "numeroLoja": "Loja_123",
 *   "total": 123.45,
 *   "contato": { "id": 12345678 },
 *   "vendedor": { "id": 12345678 },
 *   "loja": { "id": 12345678 }
 * }
 */
async function handleOrderEvent(orderData: any, event: string) {
  try {
    console.log(`📦 Processando pedido ${orderData.numero || orderData.id} (${event}):`, orderData)
    
    // Os pedidos do Bling não precisam ser salvos no banco do site
    // Eles já são buscados via API quando necessário
    // Aqui podemos apenas registrar o evento se necessário
    
    console.log(`✅ Pedido ${orderData.numero || orderData.id} processado via webhook`)

  } catch (error: any) {
    console.error('❌ Erro ao processar evento de pedido:', error)
    throw error
  }
}

/**
 * Processar exclusão de pedido
 * Estrutura: { "id": 12345678 }
 */
async function handleOrderDeleted(orderData: any) {
  try {
    console.log(`📦 Pedido ${orderData.id} excluído via webhook`)
    
    // Os pedidos do Bling não são salvos no banco, apenas registramos o evento
    console.log(`✅ Pedido ${orderData.id} excluído registrado via webhook`)

  } catch (error: any) {
    console.error('❌ Erro ao processar exclusão de pedido:', error)
    throw error
  }
}

/**
 * Processar mudanças de estoque (created/updated/deleted)
 * Estrutura conforme documentação:
 * {
 *   "produto": { "id": 12345678 },
 *   "deposito": { "id": 12345678, "saldoFisico": 1250.75, "saldoVirtual": 1250.75 },
 *   "operacao": "E", // E = Entrada, S = Saída
 *   "quantidade": 25,
 *   "saldoFisicoTotal": 1500.75,
 *   "saldoVirtualTotal": 1500.75
 * }
 */
async function handleStockChange(stockData: any, event: string) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Extrair ID do produto conforme estrutura da documentação
    const produtoId = stockData.produto?.id || stockData.product?.id
    const blingId = produtoId?.toString()

    if (!blingId) {
      console.error('❌ Estoque sem ID do produto', stockData)
      return
    }

    console.log(`📦 Processando estoque do produto ${blingId} (${event}):`, stockData)

    // Usar saldoFisicoTotal ou saldoVirtualTotal conforme documentação
    const saldoTotal = stockData.saldoFisicoTotal || stockData.saldoVirtualTotal || stockData.saldoTotal || 0
    const estoqueAtual = Math.max(0, Math.floor(saldoTotal))

    // Atualizar estoque do produto
    const { error } = await supabase
      .from('products')
      .update({
        stock: estoqueAtual,
        updated_at: new Date().toISOString(),
      })
      .eq('bling_id', blingId)

    if (error) {
      console.error('❌ Erro ao atualizar estoque:', error)
      throw error
    }

    console.log(`✅ Estoque do produto ${blingId} atualizado via webhook: ${estoqueAtual} (${event})`)

  } catch (error: any) {
    console.error('❌ Erro ao processar mudança de estoque:', error)
    throw error
  }
}

/**
 * Processar mudanças de estoque virtual
 * Estrutura conforme documentação:
 * {
 *   "produto": { "id": 12345 },
 *   "saldoFisicoTotal": 150.75,
 *   "saldoVirtualTotal": 148.50,
 *   "vinculoComplexo": true,
 *   "depositos": [...]
 * }
 */
async function handleVirtualStockChange(stockData: any) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Extrair ID do produto conforme estrutura da documentação
    const produtoId = stockData.produto?.id || stockData.product?.id
    const blingId = produtoId?.toString()

    if (!blingId) {
      console.error('❌ Estoque virtual sem ID do produto', stockData)
      return
    }

    console.log(`📦 Processando estoque virtual do produto ${blingId}:`, stockData)

    // Usar saldoVirtualTotal conforme documentação
    const saldoVirtual = stockData.saldoVirtualTotal || 0
    const estoqueAtual = Math.max(0, Math.floor(saldoVirtual))

    // Atualizar estoque do produto
    const { error } = await supabase
      .from('products')
      .update({
        stock: estoqueAtual,
        updated_at: new Date().toISOString(),
      })
      .eq('bling_id', blingId)

    if (error) {
      console.error('❌ Erro ao atualizar estoque virtual:', error)
      throw error
    }

    console.log(`✅ Estoque virtual do produto ${blingId} atualizado via webhook: ${estoqueAtual}`)

  } catch (error: any) {
    console.error('❌ Erro ao processar mudança de estoque virtual:', error)
    throw error
  }
}

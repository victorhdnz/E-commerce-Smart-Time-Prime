import { NextResponse } from 'next/server'
import { blingClient } from '@/lib/bling/client'

/**
 * Endpoint de teste para diagnosticar problemas com a API do Bling
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    errors: [],
  }

  // Teste 1: Verificar se API Key está configurada
  const apiKey = process.env.BLING_API_KEY
  diagnostics.tests.push({
    name: 'API Key Configurada',
    status: !!apiKey,
    value: apiKey ? `${apiKey.substring(0, 10)}...` : 'Não configurada',
  })

  // Teste 2: Tentar buscar produtos diretamente
  try {
    const products = await blingClient.getProducts(10)
    diagnostics.tests.push({
      name: 'Buscar Produtos',
      status: true,
      productsFound: products.length,
      products: products.slice(0, 3).map(p => ({ id: p.id, nome: p.nome })),
    })
  } catch (error: any) {
    diagnostics.tests.push({
      name: 'Buscar Produtos',
      status: false,
      error: error.message,
    })
    diagnostics.errors.push(error.message)
  }

  // Teste 3: Tentar buscar pedidos
  try {
    const orders = await blingClient.getOrders({ limit: 5 })
    diagnostics.tests.push({
      name: 'Buscar Pedidos',
      status: true,
      ordersFound: orders.length,
    })
  } catch (error: any) {
    diagnostics.tests.push({
      name: 'Buscar Pedidos',
      status: false,
      error: error.message,
    })
    diagnostics.errors.push(error.message)
  }

  // Teste 4: Testar endpoint direto da API (diferentes formatos)
  // Bling API v3 usa Bearer token no header, NÃO query parameter
  const testEndpoints = [
    `/produtos`,
    `/produtos?limite=10`,
  ]

  for (const endpoint of testEndpoints) {
    try {
      const token = apiKey || ''
      const baseUrl = 'https://www.bling.com.br/Api/v3'
      const url = `${baseUrl}${endpoint}` // NÃO adicionar apikey na URL
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`, // Bling requer Bearer mesmo para API Key
        },
      })
      
      const responseText = await response.text()
      let parsedResponse: any = null
      
      try {
        parsedResponse = JSON.parse(responseText)
      } catch {
        parsedResponse = { raw: responseText.substring(0, 500) }
      }
      
      diagnostics.tests.push({
        name: `Teste Endpoint: ${endpoint}`,
        status: response.ok,
        statusCode: response.status,
        url: url.replace(token, '***'),
        responseSize: responseText.length,
        responsePreview: typeof parsedResponse === 'object' 
          ? JSON.stringify(parsedResponse).substring(0, 500)
          : responseText.substring(0, 500),
      })

      if (response.ok && parsedResponse) {
        // Verificar estrutura da resposta
        const hasData = parsedResponse.data !== undefined
        const hasProducts = Array.isArray(parsedResponse.data) || Array.isArray(parsedResponse)
        const productCount = hasProducts ? (parsedResponse.data?.length || parsedResponse.length || 0) : 0
        
        diagnostics.tests.push({
          name: `Análise Resposta: ${endpoint}`,
          hasDataField: hasData,
          hasProductsArray: hasProducts,
          productCount: productCount,
          structure: Object.keys(parsedResponse).slice(0, 10),
        })
      } else {
        diagnostics.errors.push(`Endpoint ${endpoint}: Status ${response.status} - ${responseText.substring(0, 200)}`)
      }
    } catch (error: any) {
      diagnostics.tests.push({
        name: `Teste Endpoint: ${endpoint}`,
        status: false,
        error: error.message,
      })
    }
  }

  return NextResponse.json(diagnostics, {
    status: diagnostics.errors.length > 0 ? 500 : 200,
  })
}


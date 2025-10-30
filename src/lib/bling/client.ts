/**
 * Cliente Bling API
 * Integração completa com Bling para pedidos, produtos e vendas
 */

interface BlingTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

interface BlingOrder {
  numero: string
  data: string
  situacao: string
  total: number
  cliente: {
    nome: string
    email?: string
  }
  itens?: Array<{
    produto: {
      nome: string
    }
    quantidade: number
    valor: number
  }>
}

interface BlingProduct {
  id: string
  nome: string
  preco: number
  estoqueAtual?: number
  codigo?: string
  descricao?: string
  categoria?: string
}

class BlingClient {
  private clientId: string
  private clientSecret: string
  private baseUrl = 'https://www.bling.com.br/Api/v3'
  private tokenCache: { token: string; expiresAt: number } | null = null

  constructor() {
    this.clientId = process.env.BLING_CLIENT_ID || ''
    this.clientSecret = process.env.BLING_CLIENT_SECRET || ''
  }

  /**
   * Obter token de acesso (API Key ou OAuth)
   * 
   * Prioridade:
   * 1. BLING_API_KEY (método mais simples - SEM EXPIRAÇÃO)
   * 2. Tokens OAuth do Supabase (se configurado)
   */
  private async getAccessToken(): Promise<string> {
    // Se tiver token em cache válido, usar ele
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token
    }

    // PRIORIDADE 1: API Key (método mais simples, não expira)
    const apiKey = process.env.BLING_API_KEY
    if (apiKey && apiKey.trim() !== '') {
      this.tokenCache = {
        token: apiKey,
        expiresAt: Date.now() + 86400000, // Cache por 24h (API Key não expira)
      }
      return apiKey
    }

    // PRIORIDADE 2: Tentar buscar tokens OAuth do Supabase (se não houver API Key)
    try {
      if (typeof window === 'undefined') {
        // Server-side: buscar direto do Supabase
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: tokensData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'bling_tokens')
          .maybeSingle()

        if (tokensData?.value) {
          const tokens = tokensData.value as any
          
          // Verificar se token ainda é válido
          if (tokens.expires_at && new Date(tokens.expires_at) > new Date()) {
            this.tokenCache = {
              token: tokens.access_token,
              expiresAt: new Date(tokens.expires_at).getTime(),
            }
            return tokens.access_token
          }

          // Token expirado, tentar refresh
          if (tokens.refresh_token) {
            return await this.refreshAccessToken(tokens.refresh_token)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar token OAuth:', error)
    }

    throw new Error('Bling não configurado. Adicione BLING_API_KEY no .env.local ou configure tokens OAuth no Supabase')
  }

  /**
   * Renovar access_token usando refresh_token
   */
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const clientId = process.env.BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('Bling OAuth não configurado')
    }

    // Bling usa: https://bling.com.br/Api/v3/oauth/token (baseado na info fornecida)
    const tokenUrl = 'https://bling.com.br/Api/v3/oauth/token'
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error('Erro ao renovar token OAuth')
    }

    const tokenData = await response.json()

    // Atualizar tokens no Supabase
    if (typeof window === 'undefined') {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const tokens = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || refreshToken,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type,
        expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
      }

      await supabase
        .from('site_settings')
        .update({
          value: tokens,
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'bling_tokens')
    }

    this.tokenCache = {
      token: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
    }

    return tokenData.access_token
  }

  /**
   * Fazer requisição autenticada
   * 
   * Bling API v3 aceita:
   * - OAuth Token: header "Authorization: Bearer <token>" (PREFERIDO)
   * - API Key: query parameter "apikey" (fallback)
   */
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken()
    const url = new URL(`${this.baseUrl}${endpoint}`)

    // Bling API v3 REQUER Bearer token no header (mesmo para API Key)
    // NÃO aceita query parameter apikey
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`, // Sempre usar Bearer, mesmo para API Key
      ...(options.headers as Record<string, string> || {}),
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: headers as HeadersInit,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: any
      
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Erro desconhecido' }
      }
      
      const errorMessage = errorData.error?.message || errorData.message || `Erro ${response.status}`
      throw new Error(errorMessage)
    }

    return response.json()
  }

  /**
   * Obter pedidos
   * 
   * Endpoint Bling API v3: GET /pedidos/vendas
   */
  async getOrders(params?: { dataInicial?: string; dataFinal?: string; limit?: number }): Promise<BlingOrder[]> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.dataInicial) queryParams.append('dataInicial', params.dataInicial)
      if (params?.dataFinal) queryParams.append('dataFinal', params.dataFinal)
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      // Construir endpoint (apikey será adicionado automaticamente no método request)
      const endpoint = `/pedidos/vendas${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const data = await this.request(endpoint)
      
      // Adaptar resposta do Bling para nosso formato
      if (data.data && Array.isArray(data.data)) {
        return data.data.map((order: any) => {
          // Extrair o valor total do pedido
          // Bling pode retornar em diferentes campos
          const totalValue = 
            parseFloat(order.total) || 
            parseFloat(order.valor) || 
            parseFloat(order.totalPedido) || 
            parseFloat(order.valorTotal) || 
            0
          
          // Se não encontrar total direto, calcular somando os itens
          let calculatedTotal = totalValue
          if (calculatedTotal === 0 && order.itens && Array.isArray(order.itens)) {
            calculatedTotal = order.itens.reduce((sum: number, item: any) => {
              const itemValue = parseFloat(item.valor) || parseFloat(item.valorUnitario) || 0
              const itemQty = parseFloat(item.quantidade) || 0
              return sum + (itemValue * itemQty)
            }, 0)
          }
          
          // Normalizar data para ISO string
          let orderData = order.data || order.dataCriacao || order.createdAt || new Date().toISOString()
          // Se a data não for ISO, converter
          if (typeof orderData === 'string' && !orderData.includes('T')) {
            // Adicionar T se não tiver (formato YYYY-:MM:SS)
            orderData = orderData.replace(' ', 'T')
          }
          
          return {
            numero: order.numero || order.id?.toString() || '',
            data: orderData,
            situacao: order.situacao?.nome || order.situacao || order.status || '',
            total: calculatedTotal,
            cliente: {
              nome: order.cliente?.nome || order.nomeCliente || 'Cliente',
              email: order.cliente?.email || order.emailCliente,
            },
            itens: order.itens?.map((item: any) => ({
              produto: {
                nome: item.produto?.nome || item.descricao || 'Produto',
              },
              quantidade: parseInt(item.quantidade) || 0,
              valor: parseFloat(item.valor) || parseFloat(item.valorUnitario) || 0,
            })),
          }
        })
      }

      return []
    } catch (error: any) {
      console.error('Erro ao buscar pedidos do Bling:', error)
      // NÃO retornar mockados - retornar array vazio para indicar erro real
      return []
    }
  }

  /**
   * Obter vendas de hoje
   * Soma o valor total de TODOS os pedidos criados no dia atual
   */
  async getTodaySales(): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]
      
      // Buscar todos os pedidos de hoje (sem filtro de status)
      const orders = await this.getOrders({
        dataInicial: todayStr,
        dataFinal: todayStr,
      })

      // Se não encontrou pedidos com dataInicial/dataFinal, buscar últimos pedidos e filtrar por data
      let todayOrders = orders
      
      // Se não encontrou com filtro de data, buscar últimos e filtrar
      let finalOrders = orders
      if (orders.length === 0 || orders.length < 100) {
        // Buscar mais pedidos para garantir que pegamos todos de hoje
        const allRecentOrders = await this.getOrders({ limit: 1000 })
        
        // Filtrar apenas pedidos de hoje (comparando apenas dia/mês/ano)
        const todayDateStr = todayStr
        const filteredTodayOrders = allRecentOrders.filter(order => {
          try {
            const orderDate = new Date(order.data)
            const orderDateStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`
            return orderDateStr === todayDateStr
          } catch {
            return false
          }
        })
        
        // Combinar pedidos encontrados (sem duplicatas)
        const combinedOrders = [...orders, ...filteredTodayOrders]
        finalOrders = combinedOrders.filter((order, index, self) => 
          index === self.findIndex(o => o.numero === order.numero)
        )
      }

      // Somar TODOS os pedidos de hoje (independente do status)
      const total = finalOrders.reduce((sum, order) => {
        const orderTotal = parseFloat(order.total.toString()) || 0
        return sum + orderTotal
      }, 0)

      return total
    } catch (error) {
      console.error('Erro ao calcular vendas de hoje:', error)
      return 0
    }
  }

  /**
   * Obter novos pedidos (apenas de hoje)
   */
  async getNewOrders(): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]
      
      // Buscar pedidos de hoje
      const orders = await this.getOrders({
        dataInicial: todayStr,
        dataFinal: todayStr,
      })

      // Se não encontrou com filtro, buscar últimos e filtrar
      if (orders.length === 0) {
        const allOrders = await this.getOrders({ limit: 1000 })
        const filtered = allOrders.filter(order => {
          try {
            const orderDate = new Date(order.data)
            const orderDateStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`
            return orderDateStr === todayStr
          } catch {
            return false
          }
        })
        return filtered.length
      }

      return orders.length
    } catch (error) {
      console.error('Erro ao contar novos pedidos:', error)
      return 0
    }
  }

  /**
   * Obter produtos do Bling
   * 
   * Bling API v3 pode usar diferentes formatos:
   * - /produtos (retorna lista)
   * - Pode retornar em data.data ou direto em data
   */
  async getProducts(limit: number = 100): Promise<BlingProduct[]> {
    try {
      // Tentar diferentes formatos de endpoint
      let data: any
      try {
        data = await this.request(`/produtos?limite=${limit}`)
      } catch (error1) {
        // Tentar formato alternativo sem parâmetros
        data = await this.request(`/produtos`)
      }

      // Bling pode retornar em diferentes formatos
      let products: any[] = []
      
      if (data.data && Array.isArray(data.data)) {
        products = data.data
      } else if (Array.isArray(data)) {
        products = data
      } else if (data.produtos && Array.isArray(data.produtos)) {
        products = data.produtos
      }

      if (products.length === 0) {
        // Se não encontrou produtos, pode ser que não existam produtos ou formato diferente
        console.warn('Nenhum produto encontrado na resposta. Formato recebido:', JSON.stringify(data).substring(0, 200))
        return []
      }

      return products.slice(0, limit).map((product: any) => ({
        id: product.id?.toString() || product.idBling?.toString() || '',
        nome: product.nome || product.name || '',
        preco: parseFloat(product.preco || product.precoVenda || product.price || 0),
        estoqueAtual: product.estoque?.quantidade || 
                      product.estoque || 
                      product.estoqueAtual || 
                      product.stock || 
                      0,
        codigo: product.codigo || product.sku || '',
        descricao: product.descricao || product.description || '',
        categoria: product.categoria?.nome || product.categoria || '',
      }))
    } catch (error: any) {
      console.error('Erro ao buscar produtos do Bling:', error)
      console.error('Detalhes do erro:', {
        message: error.message,
        stack: error.stack,
      })
      return []
    }
  }

  /**
   * Atualizar estoque de um produto no Bling
   */
  async updateProductStock(productId: string, newStock: number): Promise<boolean> {
    try {
      const data = await this.request(`/produtos/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({
          estoque: {
            quantidade: newStock,
          },
        }),
      })

      return true
    } catch (error: any) {
      console.error('Erro ao atualizar estoque no Bling:', error)
      return false
    }
  }

  /**
   * Obter produto por ID
   */
  async getProductById(productId: string): Promise<BlingProduct | null> {
    try {
      const data = await this.request(`/produtos/${productId}`)
      
      if (data.data) {
        const product = data.data
        return {
          id: product.id?.toString() || '',
          nome: product.nome || '',
          preco: parseFloat(product.preco) || 0,
          estoqueAtual: product.estoque?.quantidade || 0,
          codigo: product.codigo || '',
          descricao: product.descricao || '',
          categoria: product.categoria?.nome || '',
        }
      }

      return null
    } catch (error: any) {
      console.error('Erro ao buscar produto do Bling:', error)
      return null
    }
  }

  /**
   * Obter pedidos recentes (últimos 10)
   */
  async getRecentOrders(limit: number = 10): Promise<BlingOrder[]> {
    try {
      const orders = await this.getOrders({ limit })
      return orders.slice(0, limit)
    } catch (error) {
      console.error('Erro ao buscar pedidos recentes:', error)
      // Retornar array vazio quando houver erro (não mockados)
      return []
    }
  }
}

export const blingClient = new BlingClient()
export type { BlingOrder, BlingProduct }


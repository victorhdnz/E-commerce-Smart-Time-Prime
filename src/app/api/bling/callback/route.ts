import { NextRequest, NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/utils/siteUrl'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Callback OAuth do Bling
 * Recebe o código de autorização e troca por access_token
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${getSiteUrl()}/dashboard/configuracoes?bling_error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${getSiteUrl()}/dashboard/configuracoes?bling_error=no_code`)
  }

  try {
    const clientId = process.env.BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET
    const redirectUri = process.env.BLING_REDIRECT_URI || `${getSiteUrl()}/api/bling/callback`

    if (!clientId || !clientSecret) {
      throw new Error('Bling OAuth não configurado')
    }

    // Trocar código por access_token
    const tokenUrl = 'https://developer.bling.com.br/api/bling/oauth/token'
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(errorData.error_description || errorData.error || 'Erro ao obter token')
    }

    const tokenData = await tokenResponse.json()

    // Salvar tokens no Supabase (em site_settings ou tabela específica)
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: existing } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'bling_tokens')
      .maybeSingle()

    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
    }

    if (existing) {
      await supabase
        .from('site_settings')
        .update({
          value: tokens,
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'bling_tokens')
    } else {
      await supabase
        .from('site_settings')
        .insert({
          key: 'bling_tokens',
          value: tokens,
          description: 'Tokens OAuth do Bling',
        })
    }

    return NextResponse.redirect(`${getSiteUrl()}/dashboard/configuracoes?bling_success=true`)
  } catch (error: any) {
    console.error('Erro no callback OAuth Bling:', error)
    return NextResponse.redirect(`${getSiteUrl()}/dashboard/configuracoes?bling_error=${encodeURIComponent(error.message)}`)
  }
}


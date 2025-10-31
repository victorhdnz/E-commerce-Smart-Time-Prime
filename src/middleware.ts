import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value,
            path: options?.path || '/',
            domain: options?.domain,
            maxAge: options?.maxAge,
            httpOnly: options?.httpOnly,
            secure: options?.secure,
            sameSite: options?.sameSite || 'lax',
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Usar getUser() em vez de getSession() para melhor compatibilidade com SSR/Vercel
  // O getUser() é mais confiável em ambientes de edge/serverless
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Proteger rotas do dashboard
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user || userError) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('returnUrl', encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search))
      return NextResponse.redirect(loginUrl)
    }

    // Verificar se é admin ou editor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Proteger rotas de checkout e minha conta
  if (
    req.nextUrl.pathname.startsWith('/checkout') ||
    req.nextUrl.pathname.startsWith('/minha-conta')
  ) {
    if (!user || userError) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('returnUrl', encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search))
      return NextResponse.redirect(loginUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/checkout/:path*', '/minha-conta/:path*'],
}


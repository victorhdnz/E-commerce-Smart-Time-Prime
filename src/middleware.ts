import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Proteger rotas do dashboard
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Verificar se é admin ou editor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
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
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/checkout/:path*', '/minha-conta/:path*'],
}


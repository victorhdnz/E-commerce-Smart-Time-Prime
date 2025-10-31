'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

/**
 * Componente para tratar redirecionamento após login bem-sucedido
 * Remove o parâmetro ?auth=success da URL e redireciona se necessário
 */
export function AuthRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    // Aguardar carregamento da autenticação
    if (loading) return

    const authSuccess = searchParams.get('auth')
    
    if (authSuccess === 'success' && isAuthenticated) {
      // Remover parâmetro da URL sem recarregar a página
      const returnUrl = localStorage.getItem('auth_return_url')
      
      // Limpar returnUrl do localStorage após usar
      if (returnUrl) {
        localStorage.removeItem('auth_return_url')
        
        // Redirecionar para a URL salva se não for /login
        if (returnUrl && returnUrl !== '/login') {
          try {
            router.replace(decodeURIComponent(returnUrl))
          } catch {
            router.replace('/')
          }
        } else {
          // Remover apenas o parâmetro da URL atual
          router.replace('/')
        }
      } else {
        // Remover apenas o parâmetro da URL atual
        router.replace('/')
      }
    }
  }, [searchParams, isAuthenticated, loading, router])

  return null
}


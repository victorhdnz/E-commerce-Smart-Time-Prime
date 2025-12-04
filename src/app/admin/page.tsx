'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, profile, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    // Redirecionar para login se não autenticado
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent('/admin')
      router.push(`/login?returnUrl=${returnUrl}`)
      return
    }

    // Verificar se é admin ou editor
    if (profile?.role !== 'admin' && profile?.role !== 'editor') {
      router.push('/')
      return
    }

    // Redirecionar para dashboard se autenticado e autorizado
    router.push('/dashboard')
  }, [isAuthenticated, profile, loading, router])

  // Mostrar loading enquanto verifica
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}


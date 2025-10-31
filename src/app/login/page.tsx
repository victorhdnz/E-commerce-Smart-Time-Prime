'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { FadeInSection } from '@/components/ui/FadeInSection'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const { signInWithGoogle, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Verificar se há um returnUrl nos parâmetros da URL
      const urlParams = new URLSearchParams(window.location.search)
      const returnUrl = urlParams.get('returnUrl')
      
      if (returnUrl) {
        // Decodificar e redirecionar para a URL original
        const decodedUrl = decodeURIComponent(returnUrl)
        console.log('🔄 Redirecionando pós-login para:', decodedUrl)
        router.push(decodedUrl)
      } else {
        // Redirecionar para home se não há returnUrl
        router.push('/')
      }
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <FadeInSection>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl p-8 md:p-12 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo!</h1>
          <p className="text-gray-600">
            Faça login para acessar sua conta e continuar suas compras
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Entre com sua conta
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={signInWithGoogle}
          variant="outline"
          size="lg"
          className="w-full mb-4"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar com Google
        </Button>

        <div className="text-center text-sm text-gray-600 mt-6">
          <p>
            Ao continuar, você concorda com nossos{' '}
            <a href="/termos-uso" className="text-black hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="/politica-privacidade" className="text-black hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <LogIn className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <strong>Por que fazer login?</strong>
              <ul className="mt-2 space-y-1">
                <li>✓ Ver preços personalizados</li>
                <li>✓ Acompanhar seus pedidos</li>
                <li>✓ Salvar endereços de entrega</li>
                <li>✓ Receber ofertas exclusivas</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
    </FadeInSection>
  )
}


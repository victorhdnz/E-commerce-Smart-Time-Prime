'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Shield, Truck, RotateCcw, Loader2 } from 'lucide-react'
import { FadeInSection } from '@/components/ui/FadeInSection'
import { createClient } from '@/lib/supabase/client'

interface Term {
  id: string
  key: string
  title: string
  description?: string
  icon: string
  href: string
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'shield':
      return Shield
    case 'file-text':
      return FileText
    case 'truck':
      return Truck
    case 'rotate-ccw':
      return RotateCcw
    default:
      return FileText
  }
}

const getColor = (index: number) => {
  const colors = ['bg-blue-500', 'bg-gray-700', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-red-500']
  return colors[index % colors.length]
}

export default function TermosPage() {
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const { data, error } = await supabase
          .from('site_terms')
          .select('id, key, title, icon')
          .order('title')

        if (error) {
          console.error('Erro ao carregar termos:', error)
          // Se não encontrar termos, usar os padrão
          setTerms([])
          return
        }

        if (data && data.length > 0) {
          // Mapear termos padrão para suas rotas estáticas, outros para rota dinâmica
          const defaultKeys = ['politica-privacidade', 'termos-uso', 'politica-entrega', 'trocas-devolucoes']
          
          const formattedTerms: Term[] = data.map((term: any, index: number) => {
            const isDefault = defaultKeys.includes(term.key)
            return {
              id: term.id,
              key: term.key,
              title: term.title,
              description: `Leia nossos ${term.title.toLowerCase()}`,
              icon: term.icon || 'file-text',
              href: isDefault ? `/${term.key}` : `/termos/${term.key}`,
            }
          })
          setTerms(formattedTerms)
        } else {
          setTerms([])
        }
      } catch (error) {
        console.error('Erro ao carregar termos:', error)
        setTerms([])
      } finally {
        setLoading(false)
      }
    }

    loadTerms()
  }, [])

  if (loading) {
    return (
      <FadeInSection>
        <div className="min-h-screen bg-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Carregando termos...</p>
            </div>
          </div>
        </div>
      </FadeInSection>
    )
  }

  if (terms.length === 0) {
    return (
      <FadeInSection>
        <div className="min-h-screen bg-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Termos e Políticas</h1>
              <div className="w-24 h-1 bg-black mx-auto mb-6" />
              <p className="text-gray-600 text-lg">
                Nenhum termo disponível no momento.
              </p>
            </div>
          </div>
        </div>
      </FadeInSection>
    )
  }

  return (
    <FadeInSection>
      <div className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Termos e Políticas</h1>
            <div className="w-24 h-1 bg-black mx-auto mb-6" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Acesse nossos termos, políticas e informações importantes sobre nossos serviços
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {terms.map((term, index) => {
              const Icon = getIcon(term.icon)
              const color = getColor(index)
              return (
                <Link
                  key={term.id}
                  href={term.href}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-black hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2 group-hover:text-black transition-colors">
                        {term.title}
                      </h2>
                      <p className="text-gray-600 text-sm mb-4">
                        {term.description}
                      </p>
                      <span className="text-sm font-medium text-black group-hover:underline">
                        Ler mais →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Ao utilizar nosso site, você concorda com nossos termos e políticas.
              Em caso de dúvidas, entre em contato conosco.
            </p>
          </div>
        </div>
      </div>
    </FadeInSection>
  )
}

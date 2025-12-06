'use client'

import { createClient } from '@/lib/supabase/client'
import { ProductSupportPage } from '@/types'
import { notFound, useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronRight, Book, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface StepItem {
  title: string
  description: string
  image?: string
  link?: string
}

export default function StepPage() {
  const params = useParams()
  const router = useRouter()
  const modeloSlug = params['modelo-slug'] as string
  const passoSlug = params['passo-slug'] as string
  
  const [supportPage, setSupportPage] = useState<(ProductSupportPage & { product: any }) | null>(null)
  const [stepItem, setStepItem] = useState<StepItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState<string>('5511999999999')
  
  const supabase = createClient()

  useEffect(() => {
    const loadPage = async () => {
      try {
        // Buscar número do WhatsApp das configurações
        const { data: settingsData } = await supabase
          .from('site_settings')
          .select('contact_whatsapp')
          .eq('key', 'site_settings')
          .single()
        
        if (settingsData?.contact_whatsapp) {
          setWhatsappNumber(settingsData.contact_whatsapp)
        }

        // Buscar página de suporte
        const { data, error } = await supabase
          .from('product_support_pages')
          .select(`
            *,
            product:products(*)
          `)
          .eq('model_slug', modeloSlug)
          .eq('is_active', true)
          .single()

        if (error || !data) {
          setSupportPage(null)
          return
        }

        setSupportPage(data as any)
        const content = (data.content as any) || {}
        const sections = content.sections || []
        
        // Encontrar o passo correspondente
        let foundStep: StepItem | null = null
        for (const section of sections) {
          if (section.type === 'steps' && section.items) {
            for (const item of section.items) {
              const itemSlug = item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ''
              if (itemSlug === passoSlug || item.link?.includes(passoSlug)) {
                foundStep = item
                break
              }
            }
            if (foundStep) break
          }
        }

        if (!foundStep) {
          setStepItem(null)
        } else {
          setStepItem(foundStep)
        }
      } catch (error) {
        console.error('Erro ao buscar página de passo:', error)
        setSupportPage(null)
        setStepItem(null)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [modeloSlug, passoSlug, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!supportPage || !stepItem) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header fixo estilo Apple */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book size={20} className="text-gray-600" />
            <span className="font-medium text-gray-900">{supportPage.title}</span>
          </div>
          <Link 
            href={`/suporte/${modeloSlug}`}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Imagem do Passo */}
          {stepItem.image && (
            <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden">
              <Image
                src={stepItem.image}
                alt={stepItem.title}
                width={1200}
                height={675}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          {/* Título e Descrição */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {stepItem.title}
            </h1>
            {stepItem.description && (
              <div 
                className="prose prose-lg max-w-none text-gray-600 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: stepItem.description.replace(/\n/g, '<br />') }}
              />
            )}
          </div>
        </div>
      </main>

      {/* WhatsApp no final */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quer saber mais?</h3>
          <div className="flex flex-wrap gap-3">
            <a 
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Fale conosco <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}


'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Home, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { motion } from 'framer-motion'
import { LandingLayout, LandingVersion } from '@/types'
import { AppleWatchContent, defaultAppleWatchContent } from '@/components/landing/layouts/AppleWatchLayout'
import { ArrayImageManager } from '@/components/ui/ArrayImageManager'

function AppleEditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const supabase = createClient()

  const layoutId = searchParams.get('layout')
  const versionId = searchParams.get('version')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentLayout, setCurrentLayout] = useState<LandingLayout | null>(null)
  const [currentVersion, setCurrentVersion] = useState<LandingVersion | null>(null)
  const [content, setContent] = useState<AppleWatchContent>(defaultAppleWatchContent)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !isEditor) {
      router.push('/dashboard')
      return
    }

    if (layoutId && versionId) {
      loadData()
    } else {
      router.push('/dashboard/layouts')
    }
  }, [isAuthenticated, isEditor, authLoading, layoutId, versionId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar layout
      const { data: layoutData } = await supabase
        .from('landing_layouts')
        .select('*')
        .eq('id', layoutId)
        .single()

      if (layoutData) setCurrentLayout(layoutData)

      // Carregar versão
      const { data: versionData } = await supabase
        .from('landing_versions')
        .select('*')
        .eq('id', versionId)
        .single()

      if (versionData) {
        setCurrentVersion(versionData)
        
        // Carregar conteúdo da versão
        if (versionData.sections_config && typeof versionData.sections_config === 'object') {
          const savedContent = (versionData.sections_config as any).appleWatchContent
          if (savedContent) {
            setContent({
              ...defaultAppleWatchContent,
              ...savedContent,
            })
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!versionId) return

    try {
      setSaving(true)

      const { error } = await supabase
        .from('landing_versions')
        .update({
          sections_config: { appleWatchContent: content },
          updated_at: new Date().toISOString(),
        })
        .eq('id', versionId)

      if (error) throw error

      toast.success('Alterações salvas!')
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error(`Erro ao salvar: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Funções de atualização do conteúdo
  const updateHero = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }))
  }

  const updateProduct = (index: number, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      products: prev.products.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }))
  }

  const addProduct = () => {
    setContent(prev => ({
      ...prev,
      products: [...prev.products, {
        id: Date.now().toString(),
        name: 'Novo Produto',
        description: 'Descrição do produto',
        price: 'R$ 0,00',
        image: '',
        colors: ['#000000'],
      }]
    }))
  }

  const removeProduct = (index: number) => {
    setContent(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }))
  }

  const updateSettings = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      settings: { ...prev.settings, [field]: value }
    }))
  }

  const updateCta = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      cta: { ...prev.cta, [field]: value }
    }))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/layouts"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Editar: {currentVersion?.name || 'Versão'}
              </h1>
              <p className="text-gray-600">
                Layout: {currentLayout?.name} • /lp/{currentLayout?.slug}/{currentVersion?.slug}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Home size={18} />
              Dashboard
            </Link>
            <Button onClick={handleSave} isLoading={saving}>
              <Save size={18} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">🎯 Hero Section</h2>
            
            <div className="space-y-4">
              <Input
                label="Título Principal"
                value={content.hero.title}
                onChange={(e) => updateHero('title', e.target.value)}
                placeholder="Smart Watch"
              />
              <Input
                label="Subtítulo"
                value={content.hero.subtitle}
                onChange={(e) => updateHero('subtitle', e.target.value)}
                placeholder="O mais poderoso de todos os tempos."
              />
              <Input
                label="Badge (opcional)"
                value={content.hero.badge || ''}
                onChange={(e) => updateHero('badge', e.target.value)}
                placeholder="Novo"
              />
            </div>
          </motion.div>

          {/* Produtos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">📦 Produtos em Destaque</h2>
              <button
                onClick={addProduct}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus size={18} />
                Adicionar Produto
              </button>
            </div>

            <div className="space-y-6">
              {content.products.map((product, index) => (
                <div key={product.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold">Produto {index + 1}</h3>
                    {content.products.length > 1 && (
                      <button
                        onClick={() => removeProduct(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Nome do Produto"
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    />
                    <Input
                      label="Preço"
                      value={product.price}
                      onChange={(e) => updateProduct(index, 'price', e.target.value)}
                      placeholder="R$ 0,00"
                    />
                    <Input
                      label="Preço Mensal (opcional)"
                      value={product.monthlyPrice || ''}
                      onChange={(e) => updateProduct(index, 'monthlyPrice', e.target.value)}
                      placeholder="R$ 458,25/mês"
                    />
                    <Input
                      label="Badge (opcional)"
                      value={product.badge || ''}
                      onChange={(e) => updateProduct(index, 'badge', e.target.value)}
                      placeholder="Novo"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <textarea
                      value={product.description}
                      onChange={(e) => updateProduct(index, 'description', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={2}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Imagem do Produto</label>
                    <Input
                      value={product.image}
                      onChange={(e) => updateProduct(index, 'image', e.target.value)}
                      placeholder="URL da imagem"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">🚀 CTA Final</h2>
            
            <div className="space-y-4">
              <Input
                label="Título do CTA"
                value={content.cta.title}
                onChange={(e) => updateCta('title', e.target.value)}
                placeholder="Compre agora"
              />
              <Input
                label="Texto do Botão"
                value={content.cta.buttonText}
                onChange={(e) => updateCta('buttonText', e.target.value)}
                placeholder="Comprar"
              />
              <Input
                label="Link do Botão"
                value={content.cta.buttonLink}
                onChange={(e) => updateCta('buttonLink', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </motion.div>

          {/* Configurações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">⚙️ Configurações</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cor Primária</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={content.settings.primaryColor}
                    onChange={(e) => updateSettings('primaryColor', e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={content.settings.primaryColor}
                    onChange={(e) => updateSettings('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cor de Destaque</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={content.settings.accentColor}
                    onChange={(e) => updateSettings('accentColor', e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={content.settings.accentColor}
                    onChange={(e) => updateSettings('accentColor', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cor de Fundo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={content.settings.backgroundColor}
                    onChange={(e) => updateSettings('backgroundColor', e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={content.settings.backgroundColor}
                    onChange={(e) => updateSettings('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <Input
                label="WhatsApp"
                value={content.settings.whatsappNumber || ''}
                onChange={(e) => updateSettings('whatsappNumber', e.target.value)}
                placeholder="5534999999999"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function AppleEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    }>
      <AppleEditorContent />
    </Suspense>
  )
}


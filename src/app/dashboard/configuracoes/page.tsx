'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation'

interface SiteConfig {
  site_name: string
  site_logo: string
  site_description: string
  footer_text: string
  copyright_text: string
  contact_email: string
  contact_whatsapp: string
  contact_maps_link: string
  instagram_url: string
  facebook_url: string
  address_street: string
  address_city: string
  address_state: string
  address_zip: string
}

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<SiteConfig>({
    site_name: 'Smart Time Prime',
    site_logo: '',
    site_description: 'E-commerce de produtos premium',
    footer_text: 'Produtos de qualidade com design moderno e elegante.',
    copyright_text: 'Todos os direitos reservados.',
    contact_email: 'contato@smarttimeprime.com.br',
    contact_whatsapp: '+55 34 8413-6291',
    contact_maps_link: 'https://maps.app.goo.gl/sj7F35h9fJ86T7By6',
    instagram_url: 'https://www.instagram.com/smarttimeprime',
    facebook_url: 'https://www.facebook.com/smarttimeprime/',
    address_street: 'Av. Imbaúba, 1676 - Loja 1046',
    address_city: 'Uberlândia',
    address_state: 'MG',
    address_zip: '38413-108',
  })

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/')
    }

    if (isAuthenticated && isAdmin) {
      loadConfig()
    }
  }, [isAuthenticated, isAdmin, authLoading, router])

  const loadConfig = async () => {
    try {
      // Buscar primeiro registro que tenha site_name ou site_logo (configurações gerais)
      // Ou buscar qualquer registro se não houver um específico
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar configurações:', error)
        // Se não encontrar, tentar buscar qualquer registro
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle()

        if (fallbackError && fallbackError.code !== 'PGRST116') {
          throw fallbackError
        }

        if (fallbackData) {
          setConfig({
            site_name: fallbackData.site_name || config.site_name,
            site_logo: fallbackData.site_logo || config.site_logo,
            site_description: fallbackData.site_description || config.site_description,
            footer_text: fallbackData.footer_text || config.footer_text,
            copyright_text: fallbackData.copyright_text || config.copyright_text,
            contact_email: fallbackData.contact_email || config.contact_email,
            contact_whatsapp: fallbackData.contact_whatsapp || config.contact_whatsapp,
            contact_maps_link: fallbackData.contact_maps_link || config.contact_maps_link,
            instagram_url: fallbackData.instagram_url || config.instagram_url,
            facebook_url: fallbackData.facebook_url || config.facebook_url,
            address_street: fallbackData.address_street || config.address_street,
            address_city: fallbackData.address_city || config.address_city,
            address_state: fallbackData.address_state || config.address_state,
            address_zip: fallbackData.address_zip || config.address_zip,
          })
        }
        return
      }

      if (data) {
        setConfig({
          site_name: data.site_name || config.site_name,
          site_logo: data.site_logo || config.site_logo,
          site_description: data.site_description || config.site_description,
          footer_text: data.footer_text || config.footer_text,
          copyright_text: data.copyright_text || config.copyright_text,
          contact_email: data.contact_email || config.contact_email,
          contact_whatsapp: data.contact_whatsapp || config.contact_whatsapp,
          contact_maps_link: data.contact_maps_link || config.contact_maps_link,
          instagram_url: data.instagram_url || config.instagram_url,
          facebook_url: data.facebook_url || config.facebook_url,
          address_street: data.address_street || config.address_street,
          address_city: data.address_city || config.address_city,
          address_state: data.address_state || config.address_state,
          address_zip: data.address_zip || config.address_zip,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log('Iniciando salvamento...', config)
      
      // Buscar primeiro registro existente
      const { data: existingData, error: checkError } = await supabase
        .from('site_settings')
        .select('id, key')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Se não encontrar, tentar buscar qualquer registro
      let finalExistingData = existingData
      if (!existingData && checkError?.code === 'PGRST116') {
        const { data: fallbackData } = await supabase
          .from('site_settings')
          .select('id, key')
          .limit(1)
          .maybeSingle()
        finalExistingData = fallbackData || null
      }

      console.log('Dados existentes encontrados:', finalExistingData)
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar dados existentes:', checkError)
        // Não lançar erro aqui, tentar criar novo registro
      }

      const updateData: any = {
        site_name: config.site_name,
        site_logo: config.site_logo || null,
        site_description: config.site_description,
        footer_text: config.footer_text,
        copyright_text: config.copyright_text,
        contact_email: config.contact_email,
        contact_whatsapp: config.contact_whatsapp,
        contact_maps_link: config.contact_maps_link,
        instagram_url: config.instagram_url,
        facebook_url: config.facebook_url,
        address_street: config.address_street,
        address_city: config.address_city,
        address_state: config.address_state,
        address_zip: config.address_zip,
        updated_at: new Date().toISOString(),
      }

      // Remover apenas campos undefined (manter null para site_logo permitir limpar)
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      console.log('Dados a serem salvos:', updateData)

      if (finalExistingData) {
        // Atualizar registro existente usando o ID encontrado
        const { data, error } = await supabase
          .from('site_settings')
          .update(updateData)
          .eq('id', finalExistingData.id)
          .select()

        console.log('Resultado da atualização:', { data, error })

        if (error) {
          console.error('Erro detalhado na atualização:', error)
          console.error('Código do erro:', error.code)
          console.error('Mensagem:', error.message)
          console.error('Detalhes:', error.details)
          console.error('Hint:', error.hint)
          throw error
        }

        if (!data || data.length === 0) {
          throw new Error('Nenhum registro foi atualizado. Verifique as políticas RLS.')
        }

        console.log('✅ Configurações atualizadas com sucesso!')
      } else {
        // Criar novo registro com key obrigatória
        const insertData = {
          ...updateData,
          key: 'general', // Chave obrigatória para o formato key-value
          description: 'Configurações gerais do site',
        }

        const { data, error } = await supabase
          .from('site_settings')
          .insert(insertData)
          .select()

        console.log('Resultado da inserção:', { data, error })

        if (error) {
          console.error('Erro detalhado na inserção:', error)
          console.error('Código do erro:', error.code)
          console.error('Mensagem:', error.message)
          console.error('Detalhes:', error.details)
          console.error('Hint:', error.hint)
          throw error
        }

        if (!data || data.length === 0) {
          throw new Error('Nenhum registro foi criado. Verifique as políticas RLS.')
        }

        console.log('✅ Configurações criadas com sucesso!')
      }

      // Recarregar configurações após salvar
      await loadConfig()
      
      toast.success('Configurações salvas com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error)
      console.error('Detalhes completos do erro:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      toast.error(error.message || 'Erro ao salvar configurações. Verifique o console para mais detalhes.')
    } finally {
      setSaving(false)
    }
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
        {/* Navigation */}
        <DashboardNavigation
          title="Configurações"
          subtitle="Configure as informações gerais do site"
          backUrl="/dashboard"
          backLabel="Voltar ao Dashboard"
        />

        <div className="flex justify-end mb-8">
          <Button onClick={handleSave} isLoading={saving}>
            <Save size={18} className="mr-2" />
            Salvar Alterações
          </Button>
        </div>

        {/* Form */}
        <div className="max-w-4xl space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Informações Gerais</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Logo da Empresa
                </label>
                <ImageUploader
                  value={config.site_logo}
                  onChange={(url: string) => setConfig({ ...config, site_logo: url })}
                  placeholder="Clique para fazer upload da logo"
                  cropType="square"
                  aspectRatio={1}
                  targetSize={{ width: 200, height: 200 }}
                  recommendedDimensions="Recomendado: 200x200px (quadrado). A logo será redimensionada automaticamente."
                />
                <p className="text-xs text-gray-500 mt-2">
                  A logo aparecerá ao lado esquerdo do nome da empresa no navigation. Dimensões ideais: 200x200px (formato quadrado).
                </p>
              </div>

              <Input
                label="Nome da Empresa"
                value={config.site_name}
                onChange={(e) =>
                  setConfig({ ...config, site_name: e.target.value })
                }
                placeholder="Smart Time Prime"
              />
              <p className="text-xs text-gray-500 -mt-2">
                Este nome aparecerá no navigation, rodapé e seção "Nossa História"
              </p>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição do Site
                </label>
                <textarea
                  value={config.site_description}
                  onChange={(e) =>
                    setConfig({ ...config, site_description: e.target.value })
                  }
                  placeholder="Breve descrição"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Esta descrição aparecerá quando o link do site for compartilhado no WhatsApp, redes sociais e outros lugares. Use uma descrição atrativa e informativa.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Informações de Contato</h2>
            
            <div className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                value={config.contact_email}
                onChange={(e) =>
                  setConfig({ ...config, contact_email: e.target.value })
                }
                placeholder="contato@smarttimeprime.com.br"
              />

              <Input
                label="WhatsApp"
                value={config.contact_whatsapp}
                onChange={(e) =>
                  setConfig({ ...config, contact_whatsapp: e.target.value })
                }
                placeholder="+55 34 8413-6291"
              />
              <p className="text-xs text-gray-500 -mt-2">
                Este WhatsApp aparecerá no rodapé e na seção de Contato.
              </p>

              <Input
                label="Link do Google Maps"
                value={config.contact_maps_link}
                onChange={(e) =>
                  setConfig({ ...config, contact_maps_link: e.target.value })
                }
                placeholder="https://maps.google.com/..."
              />
              <p className="text-xs text-gray-500 -mt-2">
                Link do Google Maps para a localização da loja
              </p>
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Redes Sociais</h2>
            
            <div className="space-y-4">
              <Input
                label="Instagram"
                value={config.instagram_url}
                onChange={(e) =>
                  setConfig({ ...config, instagram_url: e.target.value })
                }
                placeholder="https://www.instagram.com/smarttimeprime"
              />

              <Input
                label="Facebook"
                value={config.facebook_url}
                onChange={(e) =>
                  setConfig({ ...config, facebook_url: e.target.value })
                }
                placeholder="https://www.facebook.com/smarttimeprime/"
              />
            </div>
          </motion.div>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Endereço</h2>
            
            <div className="space-y-4">
              <Input
                label="Endereço Completo"
                value={config.address_street}
                onChange={(e) =>
                  setConfig({ ...config, address_street: e.target.value })
                }
                placeholder="Av. Imbaúba, 1676 - Loja 1046"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Cidade"
                    value={config.address_city}
                    onChange={(e) =>
                      setConfig({ ...config, address_city: e.target.value })
                    }
                    placeholder="Uberlândia"
                  />
                </div>

                <Input
                  label="Estado"
                  value={config.address_state}
                  onChange={(e) =>
                    setConfig({ ...config, address_state: e.target.value })
                  }
                  placeholder="MG"
                  maxLength={2}
                />
              </div>

              <Input
                label="CEP"
                value={config.address_zip}
                onChange={(e) =>
                  setConfig({ ...config, address_zip: e.target.value })
                }
                placeholder="38413-108"
              />
            </div>
          </motion.div>

          {/* Footer Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Rodapé</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Texto do Rodapé
                </label>
                <textarea
                  value={config.footer_text}
                  onChange={(e) =>
                    setConfig({ ...config, footer_text: e.target.value })
                  }
                  placeholder="Produtos de qualidade com design moderno e elegante."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Texto que aparece abaixo do nome da empresa no rodapé
                </p>
              </div>

              <Input
                label="Texto de Copyright"
                value={config.copyright_text}
                onChange={(e) =>
                  setConfig({ ...config, copyright_text: e.target.value })
                }
                placeholder="Todos os direitos reservados."
              />
              <p className="text-xs text-gray-500 -mt-2">
                Será exibido como: &quot;© [ano] [Nome da Empresa]. [Texto de Copyright]&quot;
              </p>
            </div>
          </motion.div>

          {/* Save Button (Mobile) */}
          <div className="lg:hidden">
            <Button onClick={handleSave} isLoading={saving} className="w-full" size="lg">
              <Save size={18} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


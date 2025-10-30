'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Save, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface SiteConfig {
  site_name: string
  site_description: string
  contact_email: string
  contact_phone: string
  contact_whatsapp: string
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
  const [blingStatus, setBlingStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')
  const [config, setConfig] = useState<SiteConfig>({
    site_name: 'Smart Time Prime',
    site_description: 'E-commerce de produtos premium',
    contact_email: 'contato@smarttimeprime.com.br',
    contact_phone: '+55 34 8413-6291',
    contact_whatsapp: '+55 34 8413-6291',
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
      checkBlingStatus()
    }
  }, [isAuthenticated, isAdmin, authLoading, router])

  const checkBlingStatus = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'bling_tokens')
        .maybeSingle()

      if (data?.value) {
        const tokens = data.value as any
        if (tokens.access_token && tokens.expires_at && new Date(tokens.expires_at) > new Date()) {
          setBlingStatus('connected')
          return
        }
      }
      setBlingStatus('disconnected')
    } catch (error) {
      setBlingStatus('disconnected')
    }
  }


  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single()

      if (error) throw error

      if (data) {
        setConfig({
          site_name: data.site_name || config.site_name,
          site_description: data.site_description || config.site_description,
          contact_email: data.contact_email || config.contact_email,
          contact_phone: data.contact_phone || config.contact_phone,
          contact_whatsapp: data.contact_whatsapp || config.contact_whatsapp,
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
      const { error } = await supabase
        .from('site_settings')
        .update({
          ...config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)

      if (error) throw error

      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl font-bold">Configurações</h1>
              <p className="text-gray-600 mt-1">
                Configure as informações gerais do site
              </p>
            </div>
          </div>

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
              <Input
                label="Nome do Site"
                value={config.site_name}
                onChange={(e) =>
                  setConfig({ ...config, site_name: e.target.value })
                }
                placeholder="Smart Time Prime"
              />

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
                label="Telefone"
                value={config.contact_phone}
                onChange={(e) =>
                  setConfig({ ...config, contact_phone: e.target.value })
                }
                placeholder="+55 34 8413-6291"
              />

              <Input
                label="WhatsApp"
                value={config.contact_whatsapp}
                onChange={(e) =>
                  setConfig({ ...config, contact_whatsapp: e.target.value })
                }
                placeholder="+55 34 8413-6291"
              />
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

          {/* Integração Bling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Integração Bling</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {blingStatus === 'loading' && (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400"></div>
                  )}
                  {blingStatus === 'connected' && (
                    <CheckCircle size={24} className="text-green-500" />
                  )}
                  {blingStatus === 'disconnected' && (
                    <XCircle size={24} className="text-gray-400" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {blingStatus === 'connected' ? 'Conectado' : blingStatus === 'loading' ? 'Verificando...' : 'Desconectado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {blingStatus === 'connected'
                        ? 'Sincronização ativa com Bling'
                        : 'Configure o token OAuth via Postman'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">Configuração via Postman:</p>
                <ol className="list-decimal list-inside space-y-2 text-xs">
                  <li>Obtenha o <code className="bg-gray-200 px-1 rounded">access_token</code> e <code className="bg-gray-200 px-1 rounded">refresh_token</code> do Bling via Postman</li>
                  <li>Insira os tokens na tabela <code className="bg-gray-200 px-1 rounded">site_settings</code> do Supabase com:</li>
                  <li className="ml-6">
                    <code className="bg-gray-200 px-1 rounded">key: "bling_tokens"</code>
                  </li>
                  <li className="ml-6">
                    <code className="bg-gray-200 px-1 rounded">value: {"{ access_token, refresh_token, expires_in, expires_at }"}</code>
                  </li>
                </ol>
                <p className="mt-3 text-xs text-gray-500">
                  O sistema detectará automaticamente quando os tokens forem adicionados.
                </p>
              </div>

              {blingStatus === 'connected' && (
                <div className="text-sm text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="font-semibold mb-1">✓ Integração Ativa</p>
                  <p>O dashboard está recebendo dados do Bling em tempo real.</p>
                </div>
              )}
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


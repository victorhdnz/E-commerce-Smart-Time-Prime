'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Package, LogOut, Settings, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function MyAccountPage() {
  const router = useRouter()
  const { isAuthenticated, profile, signOut, refreshProfile, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAddresses: 0,
    loading: true
  })
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })

  // Função para carregar estatísticas
  const loadStats = async () => {
    if (!profile?.id) return

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Carregar total de pedidos
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      // Carregar total de endereços
      const { count: addressesCount } = await supabase
        .from('addresses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      setStats({
        totalOrders: ordersCount || 0,
        totalAddresses: addressesCount || 0,
        loading: false
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    let mounted = true

    // Aguardar o carregamento da autenticação completar
    if (authLoading) return

    // O middleware já protege essa rota, então só verificar se realmente não está autenticado
    // após o loading completar, para evitar race conditions
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent('/minha-conta')
      router.push(`/login?returnUrl=${returnUrl}`)
      return
    }

    if (profile && mounted) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      })
      loadStats()
    }

    return () => {
      mounted = false
    }
  }, [isAuthenticated, authLoading, profile?.id])

  const handleUpdateProfile = async () => {
    if (!profile?.id) return
    
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      // Atualizar o perfil no estado sem recarregar a página
      await refreshProfile()
      
      // Atualizar o formData com os novos dados
      setFormData({
        full_name: formData.full_name,
        phone: formData.phone,
      })

      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      toast.error('Erro ao sair')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-12 bg-gray-200 rounded w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Minha Conta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Avatar */}
            <div className="text-center mb-6">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  <User size={48} className="text-gray-500" />
                </div>
              )}
              <h2 className="text-xl font-bold">{profile?.full_name || 'Usuário'}</h2>
              <p className="text-gray-600">{profile?.email}</p>
            </div>

            {/* Menu */}
            <nav className="space-y-2">
              <Link
                href="/minha-conta"
                className="flex items-center p-3 rounded-lg bg-gray-100 font-medium"
              >
                <User size={20} className="mr-3" />
                Dados Pessoais
              </Link>
              <Link
                href="/minha-conta/pedidos"
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Package size={20} className="mr-3" />
                Meus Pedidos
              </Link>
              <Link
                href="/minha-conta/enderecos"
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MapPin size={20} className="mr-3" />
                Endereços
              </Link>
              {(profile?.role === 'admin' || profile?.role === 'editor') && (
                <Link
                  href="/dashboard"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut size={20} className="mr-3" />
                Sair
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Dados Pessoais</h2>

            <div className="space-y-4">
              <Input
                label="Nome Completo"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="Seu nome completo"
              />

              <Input
                label="E-mail"
                value={profile?.email || ''}
                disabled
                className="bg-gray-50"
              />

              <Input
                label="Telefone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />

              <Button
                onClick={handleUpdateProfile}
                isLoading={loading}
                size="lg"
                className="w-full"
              >
                Salvar Alterações
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Link href="/minha-conta/pedidos" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <Package size={32} className="mx-auto mb-2 text-accent" />
              {stats.loading ? (
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2 animate-pulse" />
              ) : (
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              )}
              <p className="text-gray-600">Pedidos Realizados</p>
            </Link>

            <Link href="/minha-conta/enderecos" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <MapPin size={32} className="mx-auto mb-2 text-accent" />
              {stats.loading ? (
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2 animate-pulse" />
              ) : (
                <p className="text-3xl font-bold">{stats.totalAddresses}</p>
              )}
              <p className="text-gray-600">Endereços Salvos</p>
            </Link>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <CreditCard size={32} className="mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-600">5%</p>
              <p className="text-gray-600">Desconto PIX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


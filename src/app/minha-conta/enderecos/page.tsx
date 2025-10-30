'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { Address } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, MapPin, User, Package, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function MyAddressesPage() {
  const router = useRouter()
  const { isAuthenticated, profile, loading: authLoading, signOut } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const hasLoadedRef = useRef(false)
  
  const [formData, setFormData] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    is_default: false,
  })

  const supabase = useMemo(() => createClient(), [])

  const loadAddresses = useCallback(async (userId: string) => {
    if (!userId) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })

      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      setAddresses(data as Address[] || [])
    } catch (error: any) {
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (profile?.id && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadAddresses(profile.id)
    }
  }, [authLoading, isAuthenticated, profile?.id])

  const handleOpenModal = useCallback((address?: Address) => {
    if (address) {
      setEditingAddress(address)
      setFormData({
        street: address.street,
        number: address.number,
        complement: address.complement || '',
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        cep: address.cep,
        is_default: address.is_default,
      })
    } else {
      setEditingAddress(null)
      setFormData({
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        cep: '',
        is_default: false,
      })
    }
    setIsModalOpen(true)
  }, [])

  const handleSaveAddress = useCallback(async () => {
    if (!profile?.id) return

    const requiredFields = ['street', 'number', 'neighborhood', 'city', 'state', 'cep']
    for (const field of requiredFields) {
      if (!(formData as any)[field]) {
        toast.error(`Preencha o campo obrigatório`)
        return
      }
    }

    setLoading(true)
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from('addresses')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingAddress.id)

        if (error) throw error
        toast.success('Endereço atualizado')
      } else {
        const { error } = await supabase.from('addresses').insert({
          ...formData,
          user_id: profile.id,
        })

        if (error) throw error
        toast.success('Endereço adicionado')
      }

      setIsModalOpen(false)
      loadAddresses(profile.id)
    } catch (error) {
      console.error('Erro ao salvar endereço:', error)
      toast.error('Erro ao salvar endereço')
    } finally {
      setLoading(false)
    }
  }, [profile?.id, formData, editingAddress, supabase, loadAddresses])

  const handleDeleteAddress = useCallback(async (addressId: string) => {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) return

    setLoading(true)
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', addressId)

      if (error) throw error
      toast.success('Endereço excluído')
      loadAddresses(profile!.id)
    } catch (error) {
      console.error('Erro ao excluir endereço:', error)
      toast.error('Erro ao excluir endereço')
    } finally {
      setLoading(false)
    }
  }, [supabase, profile?.id, loadAddresses])

  const handleSetDefaultAddress = useCallback(async (addressId: string) => {
    if (!profile?.id) return
    setLoading(true)
    try {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', profile.id)
        .neq('id', addressId)

      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq('id', addressId)

      if (error) throw error
      toast.success('Endereço padrão atualizado')
      loadAddresses(profile.id)
    } catch (error) {
      console.error('Erro ao definir endereço padrão:', error)
      toast.error('Erro ao definir endereço padrão')
    } finally {
      setLoading(false)
    }
  }, [supabase, profile?.id, loadAddresses])

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      toast.error('Erro ao sair')
    }
  }, [signOut, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
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
                <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4 text-3xl">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <h2 className="text-xl font-bold">{profile?.full_name || 'Usuário'}</h2>
              <p className="text-gray-600">{profile?.email}</p>
            </div>

            {/* Menu */}
            <nav className="space-y-2">
              <Link
                href="/minha-conta"
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
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
                className="flex items-center p-3 rounded-lg bg-gray-100 font-medium"
              >
                <MapPin size={20} className="mr-3" />
                Endereços
              </Link>
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Meus Endereços</h2>
                <p className="text-gray-600 text-sm">{addresses.length} endereços cadastrados</p>
              </div>
              {addresses.length > 0 && (
                <Button size="lg" onClick={() => handleOpenModal()}>
                  <Plus size={20} className="mr-2" />
                  Novo Endereço
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
          <div
            key={address.id}
            className={`bg-white rounded-lg shadow-md p-6 relative ${
              address.is_default ? 'border-2 border-black' : ''
            }`}
          >
            {address.is_default && (
              <span className="absolute top-3 right-3 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full">
                Padrão
              </span>
            )}
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <MapPin size={20} className="mr-2 text-gray-600" />
              {address.street}, {address.number}
            </h3>
            <p className="text-gray-700">
              {address.complement && `${address.complement} - `}
              {address.neighborhood}
            </p>
            <p className="text-gray-700">
              {address.city} - {address.state}, {address.cep}
            </p>
            <div className="mt-4 flex gap-2">
              {!address.is_default && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetDefaultAddress(address.id)}
                  isLoading={loading}
                >
                  Definir como Padrão
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenModal(address)}
                isLoading={loading}
              >
                <Edit size={16} className="mr-2" />
                Editar
              </Button>
              <button
                onClick={() => handleDeleteAddress(address.id)}
                disabled={loading}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Excluir
              </button>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="md:col-span-2 text-center py-20">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-semibold mb-2">Nenhum endereço cadastrado</h3>
            <p className="text-gray-600 mb-6">
              Adicione seu primeiro endereço para facilitar suas compras
            </p>
            <Button size="lg" onClick={() => handleOpenModal()}>
              <Plus size={20} className="mr-2" />
              Adicionar Endereço
            </Button>
          </div>
        )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'Editar Endereço' : 'Novo Endereço'}
      >
        <div className="space-y-4">
          <Input
            label="Rua"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            placeholder="Ex: Rua das Flores"
          />
          <Input
            label="Número"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            placeholder="Ex: 123"
          />
          <Input
            label="Complemento (opcional)"
            value={formData.complement}
            onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
            placeholder="Ex: Apartamento 401"
          />
          <Input
            label="Bairro"
            value={formData.neighborhood}
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
            placeholder="Ex: Centro"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cidade"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Ex: Uberlândia"
            />
            <Input
              label="Estado (UF)"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="Ex: MG"
              maxLength={2}
            />
          </div>
          <Input
            label="CEP"
            value={formData.cep}
            onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
            placeholder="Ex: 38400-000"
            maxLength={9}
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
              Definir como endereço padrão
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSaveAddress} className="flex-1" isLoading={loading}>
              Salvar Endereço
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

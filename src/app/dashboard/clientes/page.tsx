'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'
import { formatDateTime } from '@/lib/utils/format'
import { BackButton } from '@/components/ui/BackButton'
import { User, MapPin, Package, Mail, Phone, Search, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface ClientProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  addresses?: ClientAddress[]
  orders?: ClientOrder[]
}

interface ClientAddress {
  id: string
  recipient_name: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zipcode: string
  is_default: boolean
}

interface ClientOrder {
  id: string
  total: number
  status: string
  created_at: string
}

export default function DashboardClientsPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [filteredClients, setFilteredClients] = useState<ClientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isEditor)) {
      router.push('/')
    } else if (isAuthenticated && isEditor) {
      loadClients()
    }
  }, [isAuthenticated, isEditor, authLoading, router])

  const loadClients = async () => {
    try {
      setLoading(true)
      
      // Buscar todos os perfis de clientes
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Buscar endereços e pedidos para cada cliente
      const clientsWithDetails = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Buscar endereços
          const { data: addresses } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', profile.id)
            .order('is_default', { ascending: false })

          // Buscar pedidos
          const { data: orders } = await supabase
            .from('orders')
            .select('id, total, status, created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })

          return {
            ...profile,
            addresses: addresses || [],
            orders: orders || [],
          } as ClientProfile
        })
      )

      setClients(clientsWithDetails)
      setFilteredClients(clientsWithDetails)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!searchTerm) {
      setFilteredClients(clients)
      return
    }

    const filtered = clients.filter(
      (client) =>
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.addresses?.some((addr) =>
          addr.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          addr.state.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    setFilteredClients(filtered)
  }, [searchTerm, clients])

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
        <div className="mb-6">
          <BackButton href="/dashboard" />
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Clientes Registrados</h1>
            <p className="text-gray-600">
              Visualize informações de perfis, endereços e compras dos clientes
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Tente ajustar sua busca' : 'Nenhum cliente registrado ainda'}
              </p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {client.avatar_url ? (
                        <img
                          src={client.avatar_url}
                          alt={client.full_name || 'Cliente'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-gray-500" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1">
                        {client.full_name || 'Sem nome'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package size={14} />
                          {client.orders?.length || 0} pedido(s)
                        </div>
                      </div>

                      {/* Addresses */}
                      {client.addresses && client.addresses.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                            <MapPin size={14} />
                            Endereços:
                          </h4>
                          <div className="space-y-1">
                            {client.addresses.map((addr) => (
                              <div
                                key={addr.id}
                                className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                              >
                                {addr.recipient_name} - {addr.street}, {addr.number}
                                {addr.complement && `, ${addr.complement}`} - {addr.neighborhood}, {addr.city}/{addr.state} - CEP: {addr.zipcode}
                                {addr.is_default && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    Padrão
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Orders Summary */}
                      {client.orders && client.orders.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                            <Package size={14} />
                            Últimos Pedidos:
                          </h4>
                          <div className="space-y-1">
                            {client.orders.slice(0, 3).map((order) => (
                              <div
                                key={order.id}
                                className="text-sm text-gray-600 bg-gray-50 p-2 rounded flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-medium">{formatCurrency(order.total)}</span>
                                  {' - '}
                                  <span className="capitalize">{order.status}</span>
                                  {' - '}
                                  <span className="text-xs">
                                    {formatDateTime(order.created_at)}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {client.orders.length > 3 && (
                              <p className="text-xs text-gray-500 mt-1">
                                +{client.orders.length - 3} pedido(s) anterior(es)
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        Registrado em: {formatDateTime(client.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


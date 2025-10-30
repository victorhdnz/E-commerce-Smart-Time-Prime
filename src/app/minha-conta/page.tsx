'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Package, LogOut, Camera } from 'lucide-react'
import Link from 'next/link'

export default function MyAccountPage() {
  const router = useRouter()
  const { isAuthenticated, profile, signOut, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(false)
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })

  useEffect(() => {
    let mounted = true

    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (profile && mounted) {
        setFormData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
        })
      }
    }

    return () => {
      mounted = false
    }
  }, [isAuthenticated, authLoading, profile?.id])

  const handleAvatarUploaded = async (url: string) => {
    if (!profile?.id) return
    
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Foto atualizada com sucesso!')
      setShowAvatarUpload(false)
      window.location.reload()
    } catch (error) {
      console.error('Erro ao atualizar foto:', error)
      toast.error('Erro ao atualizar foto')
    }
  }

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

      toast.success('Perfil atualizado com sucesso!')
      // Recarregar a página para atualizar os dados
      window.location.reload()
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
              <div className="relative inline-block">
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
                <button
                  onClick={() => setShowAvatarUpload(!showAvatarUpload)}
                  className="absolute bottom-4 right-0 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                  title="Alterar foto"
                >
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="text-xl font-bold">{profile?.full_name || 'Usuário'}</h2>
              <p className="text-gray-600">{profile?.email}</p>
              
              {/* Upload de Avatar */}
              {showAvatarUpload && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <ImageUploader
                    currentImage={profile?.avatar_url || undefined}
                    onImageUploaded={handleAvatarUploaded}
                    folder="profiles/avatars"
                    aspectRatio={1}
                    maxSizeMB={2}
                  />
                </div>
              )}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
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
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 text-center"
            >
              <Package size={32} className="mx-auto mb-2 text-accent" />
              <p className="text-3xl font-bold">0</p>
              <p className="text-gray-600">Pedidos Realizados</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 text-center"
            >
              <MapPin size={32} className="mx-auto mb-2 text-accent" />
              <p className="text-3xl font-bold">0</p>
              <p className="text-gray-600">Endereços Salvos</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6 text-center"
            >
              <Mail size={32} className="mx-auto mb-2 text-accent" />
              <p className="text-3xl font-bold">5%</p>
              <p className="text-gray-600">Desconto PIX</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}


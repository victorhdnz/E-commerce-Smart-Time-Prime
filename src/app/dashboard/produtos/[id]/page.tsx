'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { Product, ProductColor } from '@/types'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowLeft, Save, Plus, Trash2, Upload, Star, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation'

interface EditProductPageProps {
  params: { id: string }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    local_price: '',
    national_price: '',
    stock: '',
    category: '',
    is_active: true,
    is_featured: false,
    images: [] as string[],
    colors: [] as ProductColor[]
  })

  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    if (!authLoading) {
      if (!isAuthenticated || !isEditor) {
        router.push('/')
      } else if (mounted) {
        loadProduct()
      }
    }

    return () => {
      mounted = false
    }
  }, [isAuthenticated, isEditor, authLoading, router, params.id])

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          colors:product_colors(*)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (data) {
        setProduct(data as Product)
        setFormData({
          name: data.name || '',
          description: data.description || '',
          local_price: data.local_price?.toString() || '',
          national_price: data.national_price?.toString() || '',
          stock: data.stock?.toString() || '',
          category: data.category || '',
          is_active: data.is_active ?? true,
          is_featured: data.is_featured ?? false,
          images: data.images || [],
          colors: data.colors || []
        })
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error)
      toast.error('Erro ao carregar produto')
      router.push('/dashboard/produtos')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome do produto é obrigatório')
      return
    }

    setSaving(true)
    try {
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        local_price: parseFloat(formData.local_price) || 0,
        national_price: parseFloat(formData.national_price) || 0,
        stock: parseInt(formData.stock) || 0,
        category: formData.category.trim(),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        images: formData.images,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', params.id)

      if (error) throw error

      toast.success('Produto atualizado com sucesso!')
      router.push('/dashboard/produtos')
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      toast.error('Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  const handleImageAdd = () => {
    const url = prompt('Digite a URL da imagem:')
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }))
    }
  }

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleColorAdd = () => {
    const name = prompt('Digite o nome da cor:')
    if (name && name.trim()) {
      const newColor: ProductColor = {
        id: Date.now().toString(),
        product_id: params.id,
        name: name.trim(),
        hex_code: '#000000',
        images: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }))
    }
  }

  const handleColorRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
          <Link href="/dashboard/produtos">
            <Button>Voltar aos Produtos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <DashboardNavigation
          title="Editar Produto"
          subtitle="Atualize as informações do produto"
          backUrl="/dashboard/produtos"
          backLabel="Voltar aos Produtos"
        />

        <div className="flex justify-end gap-3 mb-8">
            <Button
              variant="outline"
              onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={formData.is_active ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}
            >
              {formData.is_active ? <Eye size={18} className="mr-2" /> : <EyeOff size={18} className="mr-2" />}
              {formData.is_active ? 'Ativo' : 'Inativo'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
              className={formData.is_featured ? 'border-yellow-500 text-yellow-600' : ''}
            >
              <Star size={18} className="mr-2" />
              {formData.is_featured ? 'Em Destaque' : 'Destacar'}
            </Button>
            <Button onClick={handleSave} isLoading={saving} size="lg">
              <Save size={18} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Informações Básicas</h2>
              
              <div className="space-y-4">
                <Input
                  label="Nome do Produto *"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome do produto"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o produto..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <Input
                  label="Categoria"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Relógios, Acessórios"
                />
              </div>
            </div>

            {/* Preços e Estoque */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Preços e Estoque</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Preço Local (R$) *"
                  type="number"
                  step="0.01"
                  value={formData.local_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, local_price: e.target.value }))}
                  placeholder="0.00"
                />

                <Input
                  label="Preço Nacional (R$) *"
                  type="number"
                  step="0.01"
                  value={formData.national_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, national_price: e.target.value }))}
                  placeholder="0.00"
                />

                <Input
                  label="Estoque *"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Imagens */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Imagens</h2>
                <Button variant="outline" onClick={handleImageAdd}>
                  <Plus size={18} className="mr-2" />
                  Adicionar Imagem
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Produto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => handleImageRemove(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                {formData.images.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Nenhuma imagem adicionada
                  </div>
                )}
              </div>
            </div>

            {/* Cores */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Variações de Cor</h2>
                <Button variant="outline" onClick={handleColorAdd}>
                  <Plus size={18} className="mr-2" />
                  Adicionar Cor
                </Button>
              </div>

              <div className="space-y-3">
                {formData.colors.map((color, index) => (
                  <div key={color.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <span className="flex-1 font-medium">{color.name}</span>
                    <button
                      onClick={() => handleColorRemove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                {formData.colors.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Nenhuma variação de cor adicionada
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Preview</h3>
              
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                {formData.images[0] ? (
                  <img
                    src={formData.images[0]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    ⌚
                  </div>
                )}
              </div>

              <h4 className="font-bold text-lg mb-2">{formData.name || 'Nome do Produto'}</h4>
              <p className="text-gray-600 text-sm mb-4">{formData.description || 'Descrição do produto...'}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Preço Local:</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(formData.local_price) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Preço Nacional:</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(formData.national_price) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estoque:</span>
                  <span className={`font-semibold ${parseInt(formData.stock) === 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formData.stock || 0} unidades
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    formData.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {formData.is_active ? 'Ativo' : 'Inativo'}
                </span>
                {formData.is_featured && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Destaque
                  </span>
                )}
              </div>
            </div>

            {/* Informações do Sistema */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Informações do Sistema</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">ID:</span>
                  <span className="ml-2 font-mono">{product.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Slug:</span>
                  <span className="ml-2 font-mono">{product.slug}</span>
                </div>
                {product.bling_id && (
                  <div>
                    <span className="text-gray-600">Bling ID:</span>
                    <span className="ml-2 font-mono">{product.bling_id}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Criado em:</span>
                  <span className="ml-2">{new Date(product.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Atualizado em:</span>
                  <span className="ml-2">{new Date(product.updated_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
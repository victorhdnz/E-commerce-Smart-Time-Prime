'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation'

export default function NovoProduct() {
  const router = useRouter()
  const { isAuthenticated, isEditor } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    local_price: '',
    national_price: '',
    stock: '',
    category: '',
    slug: '',
    images: [] as string[],
    specifications: [] as { key: string; value: string }[],
    is_featured: false,
    is_active: true,
  })

  const [colors, setColors] = useState<{ name: string; hex: string; stock: number }[]>([])
  const [linkedGifts, setLinkedGifts] = useState<string[]>([])

  const handleAddImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url]
    }))
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleAddSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }))
  }

  const handleRemoveSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
  }

  const handleAddColor = () => {
    setColors([...colors, { name: '', hex: '#000000', stock: 0 }])
  }

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSave = async () => {
    if (!formData.name || !formData.local_price || !formData.national_price) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      // Criar produto
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          local_price: parseFloat(formData.local_price),
          national_price: parseFloat(formData.national_price),
          stock: parseInt(formData.stock) || 0,
          category: formData.category,
          slug: formData.slug,
          images: formData.images,
          specifications: formData.specifications,
          is_featured: formData.is_featured,
          is_active: formData.is_active,
        })
        .select()
        .single()

      if (productError) throw productError

      // Criar variações de cor
      if (colors.length > 0 && product) {
        const colorInserts = colors.map(color => ({
          product_id: product.id,
          name: color.name,
          hex_code: color.hex,
          stock: color.stock,
        }))

        const { error: colorError } = await supabase
          .from('product_colors')
          .insert(colorInserts)

        if (colorError) throw colorError
      }

      toast.success('Produto criado com sucesso!')
      router.push('/dashboard/produtos')
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      toast.error('Erro ao criar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <DashboardNavigation
          title="Novo Produto"
          subtitle="Preencha as informações do produto"
          backUrl="/dashboard/produtos"
          backLabel="Voltar aos Produtos"
        />

        <div className="flex justify-end mb-8">
          <Button onClick={handleSave} isLoading={loading} size="lg">
            <Save size={18} className="mr-2" />
            Salvar Produto
          </Button>
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
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Relógio Smartwatch Premium"
                />

                <Input
                  label="Slug (URL amigável)"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="relogio-smartwatch-premium"
                />

                <Input
                  label="Categoria"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Relógios, Acessórios"
                />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição detalhada do produto..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* Imagens */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Imagens do Produto</h2>
              
              {/* Imagens adicionadas */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Produto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <ImageUploader
                onImageUploaded={handleAddImage}
                bucket="products"
                folder="main"
                aspectRatio={1}
              />
            </div>

            {/* Especificações Técnicas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Especificações Técnicas</h2>
                <Button onClick={handleAddSpecification} size="sm">
                  <Plus size={16} className="mr-2" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder="Característica"
                      value={spec.key}
                      onChange={(e) => {
                        const newSpecs = [...formData.specifications]
                        newSpecs[index].key = e.target.value
                        setFormData({ ...formData, specifications: newSpecs })
                      }}
                    />
                    <Input
                      placeholder="Valor"
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...formData.specifications]
                        newSpecs[index].value = e.target.value
                        setFormData({ ...formData, specifications: newSpecs })
                      }}
                    />
                    <button
                      onClick={() => handleRemoveSpecification(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Variações de Cor */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Variações de Cor</h2>
                <Button onClick={handleAddColor} size="sm">
                  <Plus size={16} className="mr-2" />
                  Adicionar Cor
                </Button>
              </div>

              <div className="space-y-3">
                {colors.map((color, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <Input
                      label="Nome"
                      placeholder="Preto"
                      value={color.name}
                      onChange={(e) => {
                        const newColors = [...colors]
                        newColors[index].name = e.target.value
                        setColors(newColors)
                      }}
                    />
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium mb-2">Cor</label>
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => {
                          const newColors = [...colors]
                          newColors[index].hex = e.target.value
                          setColors(newColors)
                        }}
                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                    <Input
                      label="Estoque"
                      type="number"
                      value={color.stock}
                      onChange={(e) => {
                        const newColors = [...colors]
                        newColors[index].stock = parseInt(e.target.value) || 0
                        setColors(newColors)
                      }}
                      className="w-24"
                    />
                    <button
                      onClick={() => handleRemoveColor(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg mb-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preços e Estoque */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Preços e Estoque</h2>
              
              <div className="space-y-4">
                <Input
                  label="Preço Local (Uberlândia) *"
                  type="number"
                  step="0.01"
                  value={formData.local_price}
                  onChange={(e) => setFormData({ ...formData, local_price: e.target.value })}
                  placeholder="299.90"
                />

                <Input
                  label="Preço Nacional *"
                  type="number"
                  step="0.01"
                  value={formData.national_price}
                  onChange={(e) => setFormData({ ...formData, national_price: e.target.value })}
                  placeholder="349.90"
                />

                <Input
                  label="Estoque Geral"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>

            {/* Configurações */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Configurações</h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span>Produto em Destaque</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span>Produto Ativo</span>
                </label>
              </div>
            </div>

            {/* Botão Mobile */}
            <div className="lg:hidden">
              <Button onClick={handleSave} isLoading={loading} className="w-full" size="lg">
                <Save size={18} className="mr-2" />
                Salvar Produto
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


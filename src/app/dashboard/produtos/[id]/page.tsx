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
    product_code: '',
    is_active: true,
    is_featured: false,
    images: [] as string[],
    colors: [] as ProductColor[],
    benefits: {
      free_shipping: { enabled: true, text: 'Frete grátis para Uberlândia acima de R$ 200' },
      warranty: { enabled: true, text: 'Garantia de 1 ano' },
      returns: { enabled: true, text: 'Troca grátis em 7 dias' },
      gift: { enabled: false, text: '' },
    },
    specifications: [] as { key: string; value: string }[]
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
          product_code: (data as any).product_code || '',
          is_active: data.is_active ?? true,
          is_featured: data.is_featured ?? false,
          images: data.images || [],
          colors: data.colors || [],
          benefits: (data as any).benefits || {
            free_shipping: { enabled: true, text: 'Frete grátis para Uberlândia acima de R$ 200' },
            warranty: { enabled: true, text: 'Garantia de 1 ano' },
            returns: { enabled: true, text: 'Troca grátis em 7 dias' },
            gift: { enabled: false, text: '' },
          },
          specifications: (data as any).specifications || []
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
        product_code: formData.product_code.trim() || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        images: formData.images,
        benefits: formData.benefits,
        specifications: formData.specifications,
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
        color_name: name.trim(),
        color_hex: '#000000',
        images: [],
        stock: 0,
        is_active: true
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
                  label="Código do Produto (apenas no dashboard)"
                  value={formData.product_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_code: e.target.value }))}
                  placeholder="Código interno do produto (opcional)"
                />
                <p className="text-xs text-gray-500 -mt-2 mb-4">
                  Este código ficará visível apenas no dashboard para referência interna
                </p>

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

            {/* Benefícios Editáveis */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Benefícios do Produto</h2>
              
              <div className="space-y-4">
                {/* Frete Grátis */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 font-semibold">
                      <input
                        type="checkbox"
                        checked={formData.benefits.free_shipping.enabled}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            benefits: {
                              ...formData.benefits,
                              free_shipping: {
                                ...formData.benefits.free_shipping,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }}
                        className="w-4 h-4"
                      />
                      🚚 Frete Grátis
                    </label>
                  </div>
                  {formData.benefits.free_shipping.enabled && (
                    <Input
                      value={formData.benefits.free_shipping.text}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          benefits: {
                            ...formData.benefits,
                            free_shipping: {
                              ...formData.benefits.free_shipping,
                              text: e.target.value,
                            },
                          },
                        })
                      }}
                      placeholder="Ex: Frete grátis para Uberlândia acima de R$ 200"
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Garantia */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 font-semibold">
                      <input
                        type="checkbox"
                        checked={formData.benefits.warranty.enabled}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            benefits: {
                              ...formData.benefits,
                              warranty: {
                                ...formData.benefits.warranty,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }}
                        className="w-4 h-4"
                      />
                      🛡️ Garantia
                    </label>
                  </div>
                  {formData.benefits.warranty.enabled && (
                    <Input
                      value={formData.benefits.warranty.text}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          benefits: {
                            ...formData.benefits,
                            warranty: {
                              ...formData.benefits.warranty,
                              text: e.target.value,
                            },
                          },
                        })
                      }}
                      placeholder="Ex: Garantia de 1 ano"
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Troca */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 font-semibold">
                      <input
                        type="checkbox"
                        checked={formData.benefits.returns.enabled}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            benefits: {
                              ...formData.benefits,
                              returns: {
                                ...formData.benefits.returns,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }}
                        className="w-4 h-4"
                      />
                      🔄 Troca
                    </label>
                  </div>
                  {formData.benefits.returns.enabled && (
                    <Input
                      value={formData.benefits.returns.text}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          benefits: {
                            ...formData.benefits,
                            returns: {
                              ...formData.benefits.returns,
                              text: e.target.value,
                            },
                          },
                        })
                      }}
                      placeholder="Ex: Troca grátis em 7 dias"
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Brinde */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 font-semibold">
                      <input
                        type="checkbox"
                        checked={formData.benefits.gift.enabled}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            benefits: {
                              ...formData.benefits,
                              gift: {
                                ...formData.benefits.gift,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }}
                        className="w-4 h-4"
                      />
                      🎁 Brinde
                    </label>
                  </div>
                  {formData.benefits.gift.enabled && (
                    <Input
                      value={formData.benefits.gift.text}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          benefits: {
                            ...formData.benefits,
                            gift: {
                              ...formData.benefits.gift,
                              text: e.target.value,
                            },
                          },
                        })
                      }}
                      placeholder="Ex: Brinde exclusivo incluído"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Especificações Técnicas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Especificações Técnicas</h2>
                <Button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      specifications: [...formData.specifications, { key: '', value: '' }],
                    })
                  }}
                  size="sm"
                >
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
                      onClick={() => {
                        setFormData({
                          ...formData,
                          specifications: formData.specifications.filter((_, i) => i !== index),
                        })
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {formData.specifications.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Nenhuma especificação adicionada</p>
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
                      style={{ backgroundColor: color.color_hex }}
                    />
                    <span className="flex-1 font-medium">{color.color_name}</span>
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
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold px-3 py-1.5 rounded-lg ${
                      parseInt(formData.stock) === 0 
                        ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                        : parseInt(formData.stock) < 10
                        ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                        : 'bg-green-100 text-green-700 border-2 border-green-300'
                    }`}>
                      {formData.stock || 0} unidades
                    </span>
                    {parseInt(formData.stock) === 0 && (
                      <span className="text-xs text-red-600 font-semibold">ESGOTADO</span>
                    )}
                    {parseInt(formData.stock) > 0 && parseInt(formData.stock) < 10 && (
                      <span className="text-xs text-yellow-600 font-semibold">ESTOQUE BAIXO</span>
                    )}
                    {parseInt(formData.stock) >= 10 && (
                      <span className="text-xs text-green-600 font-semibold">✓ EM ESTOQUE</span>
                    )}
                  </div>
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
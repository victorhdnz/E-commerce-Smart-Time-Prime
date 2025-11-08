'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrayImageManager } from '@/components/ui/ArrayImageManager'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation'
import { StarRating } from '@/components/ui/StarRating'

export default function NovoProduct() {
  const router = useRouter()
  const { isAuthenticated, isEditor } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [showCategoryList, setShowCategoryList] = useState(false)
  const [loadingSpecs, setLoadingSpecs] = useState(false)
  const [categoryTopics, setCategoryTopics] = useState<Array<{ topic_key: string; topic_label: string; topic_type: 'rating' | 'text' }>>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    local_price: '',
    national_price: '',
    stock: '',
    category: '',
    slug: '',
    product_code: '',
    images: [] as string[],
    specifications: [] as { key: string; value: string }[],
    benefits: {
      free_shipping: { enabled: true, text: 'Frete grátis para Uberlândia acima de R$ 200' },
      warranty: { enabled: true, text: 'Garantia de 1 ano' },
      returns: { enabled: true, text: 'Troca grátis em 7 dias' },
      gift: { enabled: false, text: '' },
    },
    is_featured: false,
    is_active: true,
  })

  const [colors, setColors] = useState<{ name: string; hex: string; stock: number }[]>([])
  const [linkedGifts, setLinkedGifts] = useState<string[]>([])

  // Carregar categorias existentes
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Carregar categorias dos produtos
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('category')
          .not('category', 'is', null)
          .neq('category', '')

        // Carregar categorias dos tópicos (mesmo que não existam produtos ainda)
        const { data: topicsData, error: topicsError } = await supabase
          .from('category_topics')
          .select('category_name')

        if (!productsError && productsData) {
          const productCategories = [...new Set(productsData.map((p: any) => p.category).filter(Boolean))] as string[]
          const topicCategories = topicsData ? [...new Set(topicsData.map((t: any) => t.category_name).filter(Boolean))] as string[] : []
          
          // Unir e remover duplicatas
          const allCategories = [...new Set([...productCategories, ...topicCategories])]
          setExistingCategories(allCategories.sort())
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }
    loadCategories()
  }, [])

  // Carregar tópicos pré-definidos da categoria quando categoria mudar
  useEffect(() => {
    const loadCategoryTopics = async () => {
      if (!formData.category) {
        setFormData(prev => ({ ...prev, specifications: [] }))
        return
      }

      setLoadingSpecs(true)
      try {
        // Carregar tópicos pré-definidos da categoria
        const { data: topicsData, error: topicsError } = await supabase
          .from('category_topics')
          .select('*')
          .eq('category_name', formData.category)
          .order('display_order', { ascending: true })

        if (!topicsError && topicsData && topicsData.length > 0) {
          // Armazenar tópicos da categoria
          setCategoryTopics(topicsData.map(topic => ({
            topic_key: topic.topic_key,
            topic_label: topic.topic_label,
            topic_type: topic.topic_type
          })))

          // Criar especificações baseadas nos tópicos pré-definidos
          const newSpecs = topicsData.map(topic => ({
            key: topic.topic_key,
            value: topic.topic_type === 'rating' ? '0' : ''
          }))

          // Manter valores existentes se já houver especificações
          const existingSpecs = formData.specifications.filter(s => s.key && s.value)
          const existingKeys = new Set(existingSpecs.map(s => s.key))

          // Adicionar apenas novos tópicos que não existem
          const specsToAdd = newSpecs.filter(spec => !existingKeys.has(spec.key))
          const finalSpecs = [...existingSpecs, ...specsToAdd]

          setFormData(prev => ({
            ...prev,
            specifications: finalSpecs
          }))
        } else {
          // Se não houver tópicos pré-definidos, limpar lista de tópicos
          setCategoryTopics([])
          // Se não houver tópicos pré-definidos, manter especificações existentes ou limpar
          if (formData.specifications.length === 0 || 
              formData.specifications.every(s => !s.key && !s.value)) {
            setFormData(prev => ({ ...prev, specifications: [] }))
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tópicos da categoria:', error)
      } finally {
        setLoadingSpecs(false)
      }
    }

    loadCategoryTopics()
  }, [formData.category])

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: images
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
      // Garantir que o slug não está vazio
      const finalSlug = formData.slug || generateSlug(formData.name) || `produto-${Date.now()}`
      
      // Criar produto
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description || null,
          short_description: formData.description ? formData.description.substring(0, 150) : null,
          local_price: parseFloat(formData.local_price),
          national_price: parseFloat(formData.national_price),
          stock: parseInt(formData.stock) || 0,
          category: formData.category || null,
          slug: finalSlug,
          product_code: formData.product_code || null,
          images: formData.images.length > 0 ? formData.images : [],
          specifications: formData.specifications.length > 0 ? formData.specifications : [],
          benefits: formData.benefits,
          is_featured: formData.is_featured,
          is_active: formData.is_active,
        })
        .select()
        .single()

      if (productError) {
        console.error('Erro detalhado ao criar produto:', productError)
        
        // Mensagem mais específica para erro de coluna ausente
        if (productError.code === 'PGRST204') {
          if (productError.message?.includes('images')) {
            toast.error('Erro: Coluna "images" não encontrada na tabela products. Execute o SQL script "supabase/add_missing_product_columns.sql" no Supabase.')
          } else if (productError.message?.includes('product_code')) {
            toast.error('Erro: Coluna "product_code" não encontrada na tabela products. Execute o SQL script "supabase/add_missing_product_columns.sql" no Supabase.')
          } else {
            toast.error(`Erro: ${productError.message}. Verifique o console para mais detalhes.`)
          }
        } else {
          toast.error(productError.message || 'Erro ao criar produto. Verifique o console para mais detalhes.')
        }
        
        throw productError
      }

      // Não salvar mais em category_specifications - sistema de tópicos fixos removido

      // Criar variações de cor
      if (colors.length > 0 && product) {
        const colorInserts = colors.map(color => ({
          product_id: product.id,
          color_name: color.name, // Schema usa 'color_name', não 'name'
          color_hex: color.hex,    // Schema usa 'color_hex', não 'hex_code'
          stock: color.stock,
        }))

        const { error: colorError } = await supabase
          .from('product_colors')
          .insert(colorInserts)

        if (colorError) {
          console.error('Erro ao criar variações de cor:', colorError)
          toast.error('Erro ao criar variações de cor. Verifique o console para mais detalhes.')
          throw colorError
        }
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
                  label="Código do Produto (apenas no dashboard)"
                  value={formData.product_code}
                  onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                  placeholder="Código interno do produto (opcional)"
                />
                <p className="text-xs text-gray-500 -mt-2">
                  Este código ficará visível apenas no dashboard para referência interna
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Categoria *
                  </label>
                  <div className="relative">
                    <div className="flex gap-2">
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({ ...formData, category: e.target.value })
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="">Selecione uma categoria</option>
                        {existingCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

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
              <ArrayImageManager
                value={formData.images}
                onChange={handleImagesChange}
                maxImages={10}
                label="Imagens"
                placeholder="Clique para fazer upload de uma imagem"
                cropType="square"
                aspectRatio={1}
                targetSize={{ width: 1080, height: 1080 }}
                recommendedDimensions="Imagens: 1080 x 1080px (Formato Quadrado)"
              />
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


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

export default function NovoProduct() {
  const router = useRouter()
  const { isAuthenticated, isEditor } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [showCategoryList, setShowCategoryList] = useState(false)
  const [categorySpecs, setCategorySpecs] = useState<{ key: string; label: string }[]>([])
  const [loadingSpecs, setLoadingSpecs] = useState(false)
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
        const { data, error } = await supabase
          .from('products')
          .select('category')
          .not('category', 'is', null)

        if (!error && data) {
          const uniqueCategories = [...new Set(data.map((p: any) => p.category).filter(Boolean))] as string[]
          setExistingCategories(uniqueCategories.sort())
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }
    loadCategories()
  }, [])

  // Carregar especificações padrão da categoria quando categoria mudar
  useEffect(() => {
    const loadCategorySpecs = async () => {
      if (!formData.category) {
        setCategorySpecs([])
        return
      }

      setLoadingSpecs(true)
      try {
        // Tentar carregar especificações padrão da categoria
        const { data: categorySpecsData, error: categoryError } = await supabase
          .from('category_specifications')
          .select('spec_key, spec_label')
          .eq('category_name', formData.category)
          .order('display_order')

        if (!categoryError && categorySpecsData && categorySpecsData.length > 0) {
          // Se existem especificações padrão, carregá-las
          const specs = categorySpecsData.map((s: any) => ({
            key: s.spec_key,
            label: s.spec_label
          }))
          setCategorySpecs(specs)

          // Carregar valores do último produto dessa categoria
          const { data: lastProduct, error: productError } = await supabase
            .from('products')
            .select('specifications')
            .eq('category', formData.category)
            .not('specifications', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single()

          if (!productError && lastProduct && (lastProduct as any).specifications) {
            const lastSpecs = (lastProduct as any).specifications as { key: string; value: string }[]
            // Mapear especificações padrão com valores do último produto
            const specsWithValues = specs.map(spec => {
              const lastSpec = lastSpecs.find(ls => ls.key === spec.key)
              return {
                key: spec.key,
                value: lastSpec?.value || ''
              }
            })
            setFormData(prev => ({
              ...prev,
              specifications: specsWithValues
            }))
          } else {
            // Se não há produto anterior, criar especificações vazias
            setFormData(prev => ({
              ...prev,
              specifications: specs.map(spec => ({ key: spec.key, value: '' }))
            }))
          }
        } else {
          // Se não existem especificações padrão, manter como está
          setCategorySpecs([])
        }
      } catch (error) {
        console.error('Erro ao carregar especificações da categoria:', error)
        setCategorySpecs([])
      } finally {
        setLoadingSpecs(false)
      }
    }

    loadCategorySpecs()
  }, [formData.category])

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: images
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

      // Salvar/atualizar especificações padrão da categoria
      if (formData.category && formData.specifications.length > 0) {
        try {
          // Primeiro, remover especificações antigas da categoria
          await supabase
            .from('category_specifications')
            .delete()
            .eq('category_name', formData.category)

          // Inserir novas especificações padrão
          const categorySpecsToInsert = formData.specifications.map((spec, index) => ({
            category_name: formData.category,
            spec_key: spec.key,
            spec_label: spec.key, // Usar a key como label por padrão
            display_order: index
          }))

          if (categorySpecsToInsert.length > 0) {
            const { error: categorySpecsError } = await supabase
              .from('category_specifications')
              .insert(categorySpecsToInsert)

            if (categorySpecsError) {
              console.error('Erro ao salvar especificações da categoria:', categorySpecsError)
              // Não falhar o save do produto por causa disso
            }
          }
        } catch (error) {
          console.error('Erro ao salvar especificações da categoria:', error)
          // Não falhar o save do produto por causa disso
        }
      }

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
                          const selectedCategory = e.target.value
                          if (selectedCategory === '__new__') {
                            const newCategory = prompt('Digite o nome da nova categoria:')
                            if (newCategory && newCategory.trim()) {
                              setFormData({ ...formData, category: newCategory.trim() })
                            }
                          } else {
                            setFormData({ ...formData, category: selectedCategory })
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="">Selecione ou crie uma categoria</option>
                        {existingCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__new__">+ Criar nova categoria</option>
                      </select>
                    </div>
                    {loadingSpecs && (
                      <p className="text-xs text-gray-500 mt-1">Carregando especificações da categoria...</p>
                    )}
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
                {formData.specifications.map((spec, index) => {
                  const categorySpec = categorySpecs.find(cs => cs.key === spec.key)
                  const isFixed = !!categorySpec
                  
                  return (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="flex-1">
                        {isFixed ? (
                          <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                            <span className="text-sm font-medium">{categorySpec.label}</span>
                            <span className="ml-2 text-xs text-gray-500">(fixo)</span>
                          </div>
                        ) : (
                          <Input
                            placeholder="Característica"
                            value={spec.key}
                            onChange={(e) => {
                              const newSpecs = [...formData.specifications]
                              newSpecs[index].key = e.target.value
                              setFormData({ ...formData, specifications: newSpecs })
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Valor"
                          value={spec.value}
                          onChange={(e) => {
                            const newSpecs = [...formData.specifications]
                            newSpecs[index].value = e.target.value
                            setFormData({ ...formData, specifications: newSpecs })
                          }}
                        />
                      </div>
                      {!isFixed && (
                        <button
                          onClick={() => handleRemoveSpecification(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  )
                })}
                {categorySpecs.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Adicione especificações para criar os campos padrão desta categoria
                  </p>
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


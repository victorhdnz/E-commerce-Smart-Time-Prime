'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'
import { Plus, Edit, Trash2, Eye, EyeOff, Tag, Calendar, Percent, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase_amount: number
  usage_limit?: number
  used_count: number
  is_active: boolean
  valid_from: string
  valid_until?: string
  created_at: string
}

export default function CouponsPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [couponForm, setCouponForm] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_purchase_amount: 0,
    usage_limit: 0,
    is_active: true,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: ''
  })

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isEditor) {
        router.push('/')
      } else {
        loadCoupons()
      }
    }
  }, [isAuthenticated, isEditor, authLoading, router])

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCoupons(data as Coupon[] || [])
    } catch (error) {
      console.error('Erro ao carregar cupons:', error)
      toast.error('Erro ao carregar cupons')
    } finally {
      setLoading(false)
    }
  }

  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_purchase_amount: 0,
      usage_limit: 0,
      is_active: true,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: ''
    })
    setEditingCoupon(null)
  }

  const handleSaveCoupon = async () => {
    if (!couponForm.code || !couponForm.name || couponForm.discount_value <= 0) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (couponForm.discount_type === 'percentage' && couponForm.discount_value > 100) {
      toast.error('Desconto percentual não pode ser maior que 100%')
      return
    }

    try {
      setLoading(true)
      const couponData: any = {
        code: couponForm.code.toUpperCase().trim(),
        name: couponForm.name,
        description: couponForm.description || null,
        discount_type: couponForm.discount_type,
        discount_value: Number(couponForm.discount_value),
        min_purchase_amount: Number(couponForm.min_purchase_amount) || 0,
        usage_limit: couponForm.usage_limit > 0 ? Number(couponForm.usage_limit) : null,
        is_active: couponForm.is_active,
        valid_from: new Date(couponForm.valid_from).toISOString(),
        valid_until: couponForm.valid_until ? new Date(couponForm.valid_until).toISOString() : null
      }

      if (editingCoupon) {
        const { data, error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id)
          .select()

        if (error) {
          console.error('Erro detalhado ao atualizar cupom:', {
            error,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          throw new Error(error.message || `Erro ao atualizar cupom: ${error.code || 'Desconhecido'}`)
        }
        
        if (!data || data.length === 0) {
          throw new Error('Nenhum registro foi atualizado. Verifique as políticas RLS.')
        }
        
        toast.success('Cupom atualizado!')
      } else {
        const { data, error } = await supabase
          .from('coupons')
          .insert(couponData)
          .select()

        if (error) {
          console.error('Erro detalhado ao criar cupom:', {
            error,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            couponData
          })
          if (error.code === '23505') {
            toast.error('Código do cupom já existe')
            return
          } else if (error.code === '42501') {
            toast.error('Sem permissão para criar cupom. Verifique as políticas RLS.')
            return
          } else {
            throw new Error(error.message || `Erro ao criar cupom: ${error.code || 'Desconhecido'}`)
          }
        }
        
        if (!data || data.length === 0) {
          throw new Error('Cupom não foi criado. Verifique as políticas RLS.')
        }
        
        toast.success('Cupom criado!')
      }

      setShowModal(false)
      resetCouponForm()
      loadCoupons()
    } catch (error: any) {
      console.error('Erro ao salvar cupom:', error)
      const errorMessage = error.message || error.toString() || 'Erro ao salvar cupom'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setCouponForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase_amount: coupon.min_purchase_amount,
      usage_limit: coupon.usage_limit || 0,
      is_active: coupon.is_active,
      valid_from: new Date(coupon.valid_from).toISOString().split('T')[0],
      valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split('T')[0] : ''
    })
    setShowModal(true)
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Deseja excluir este cupom?')) return

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId)

      if (error) throw error
      toast.success('Cupom excluído')
      loadCoupons()
    } catch (error) {
      console.error('Erro ao excluir cupom:', error)
      toast.error('Erro ao excluir cupom')
    }
  }

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', couponId)

      if (error) throw error
      toast.success(currentStatus ? 'Cupom desativado' : 'Cupom ativado')
      loadCoupons()
    } catch (error) {
      toast.error('Erro ao alterar status')
    }
  }

  const isCouponValid = (coupon: Coupon) => {
    if (!coupon.is_active) return false
    const now = new Date()
    const validFrom = new Date(coupon.valid_from)
    if (now < validFrom) return false
    if (coupon.valid_until) {
      const validUntil = new Date(coupon.valid_until)
      if (now > validUntil) return false
    }
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return false
    return true
  }

  if (loading && coupons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DashboardNavigation
          title="Cupons de Desconto"
          subtitle="Gerencie cupons promocionais"
          backUrl="/dashboard"
          backLabel="Voltar ao Dashboard"
        />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Cupons</h2>
            <p className="text-gray-600">Crie e gerencie cupons de desconto para seus clientes</p>
          </div>
          <Button onClick={() => {
            resetCouponForm()
            setShowModal(true)
          }}>
            <Plus size={18} className="mr-2" />
            Novo Cupom
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const isValid = isCouponValid(coupon)
            return (
              <div key={coupon.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={20} className="text-blue-600" />
                      <h3 className="text-lg font-bold">{coupon.code}</h3>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{coupon.name}</p>
                    {coupon.description && (
                      <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        coupon.is_active && isValid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {coupon.is_active && isValid ? 'Válido' : 'Inválido'}
                      </span>
                      {!coupon.is_active && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inativo
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {coupon.discount_type === 'percentage' ? (
                          <Percent size={16} className="text-green-600" />
                        ) : (
                          <DollarSign size={16} className="text-green-600" />
                        )}
                        <span className="text-lg font-bold text-green-600">
                          {coupon.discount_type === 'percentage'
                            ? `${coupon.discount_value}% OFF`
                            : formatCurrency(coupon.discount_value)
                          }
                        </span>
                      </div>
                      {coupon.min_purchase_amount > 0 && (
                        <p className="text-xs text-gray-600">
                          Mínimo: {formatCurrency(coupon.min_purchase_amount)}
                        </p>
                      )}
                      {coupon.usage_limit && (
                        <p className="text-xs text-gray-600">
                          Usos: {coupon.used_count} / {coupon.usage_limit}
                        </p>
                      )}
                      {coupon.valid_until && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar size={12} />
                          <span>Válido até {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    title={coupon.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {coupon.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => handleEditCoupon(coupon)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Editar cupom"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Excluir cupom"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {coupons.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Tag size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum cupom criado</h3>
            <p className="text-sm mb-6">
              Crie seu primeiro cupom de desconto para começar
            </p>
            <Button onClick={() => {
              resetCouponForm()
              setShowModal(true)
            }}>
              <Plus size={18} className="mr-2" />
              Criar Primeiro Cupom
            </Button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            resetCouponForm()
          }}
          title={editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Código do Cupom <span className="text-red-500">*</span>
              </label>
              <Input
                value={couponForm.code}
                onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="EXEMPLO10"
                disabled={!!editingCoupon}
              />
              <p className="text-xs text-gray-500 mt-1">
                O código que o cliente usará para aplicar o desconto
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nome <span className="text-red-500">*</span>
              </label>
              <Input
                value={couponForm.name}
                onChange={(e) => setCouponForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Desconto de 10%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Input
                value={couponForm.description}
                onChange={(e) => setCouponForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do cupom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Desconto <span className="text-red-500">*</span>
              </label>
              <select
                value={couponForm.discount_type}
                onChange={(e) => setCouponForm(prev => ({ ...prev, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Valor do Desconto <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                max={couponForm.discount_type === 'percentage' ? 100 : undefined}
                step={couponForm.discount_type === 'percentage' ? 1 : 0.01}
                value={couponForm.discount_value}
                onChange={(e) => setCouponForm(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                placeholder={couponForm.discount_type === 'percentage' ? '10' : '50.00'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Valor Mínimo de Compra (R$)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={couponForm.min_purchase_amount}
                onChange={(e) => setCouponForm(prev => ({ ...prev, min_purchase_amount: Number(e.target.value) }))}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor mínimo que o cliente precisa gastar para usar este cupom
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Limite de Usos
              </label>
              <Input
                type="number"
                min="0"
                value={couponForm.usage_limit}
                onChange={(e) => setCouponForm(prev => ({ ...prev, usage_limit: Number(e.target.value) }))}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número máximo de vezes que este cupom pode ser usado (deixe 0 para ilimitado)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Válido a partir de
                </label>
                <Input
                  type="date"
                  value={couponForm.valid_from}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, valid_from: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Válido até
                </label>
                <Input
                  type="date"
                  value={couponForm.valid_until}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, valid_until: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe vazio para não expirar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={couponForm.is_active}
                onChange={(e) => setCouponForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Cupom ativo
              </label>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveCoupon} className="flex-1">
                {editingCoupon ? 'Atualizar Cupom' : 'Criar Cupom'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false)
                  resetCouponForm()
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}


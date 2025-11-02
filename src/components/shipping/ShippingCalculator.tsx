'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils/format'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Loader2, Truck, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShippingOption {
  id: string
  name: string
  price: number
  currency: string
  delivery_time: number
  delivery_range?: {
    min: number
    max: number
  }
  company: string
  is_local?: boolean
  description?: string
}

interface ShippingCalculatorProps {
  onShippingSelected?: (shipping: ShippingOption | null) => void
  selectedShipping?: ShippingOption | null
}

export function ShippingCalculator({
  onShippingSelected,
  selectedShipping,
}: ShippingCalculatorProps) {
  const { items } = useCart()
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [selected, setSelected] = useState<ShippingOption | null>(
    selectedShipping || null
  )

  const calculateShipping = async () => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      toast.error('CEP inválido')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep: cep.replace(/\D/g, ''),
          items: items,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao calcular frete')
      }

      const data = await response.json()
      setOptions(data.options || [])
      
      if (data.options && data.options.length > 0 && !selected) {
        // Auto-selecionar primeira opção
        setSelected(data.options[0])
        onShippingSelected?.(data.options[0])
      }
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error)
      toast.error(error.message || 'Erro ao calcular frete')
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleCepChange = (value: string) => {
    // Formatar CEP (xxxxx-xxx)
    const formatted = value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2')
    setCep(formatted)
    // Não calcular automaticamente - apenas quando clicar no botão
  }

  const handleSelectOption = (option: ShippingOption) => {
    setSelected(option)
    onShippingSelected?.(option)
  }

  useEffect(() => {
    if (selectedShipping) {
      setSelected(selectedShipping)
    }
  }, [selectedShipping])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          <MapPin className="inline mr-2" size={16} />
          Calcular Frete
        </label>
        <div className="flex gap-2">
          <Input
            value={cep}
            onChange={(e) => handleCepChange(e.target.value)}
            placeholder="00000-000"
            maxLength={9}
            className="flex-1"
          />
          <Button
            onClick={calculateShipping}
            disabled={loading || cep.replace(/\D/g, '').length !== 8}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              'Calcular'
            )}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="animate-spin text-gray-400" size={24} />
          <span className="ml-2 text-sm text-gray-600">
            Calculando opções de frete...
          </span>
        </div>
      )}

      {!loading && options.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Opções de Entrega:
          </p>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {options
              .filter(option => option.price && !isNaN(option.price) && option.price > 0)
              .map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selected?.id === option.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck size={16} className="text-gray-600" />
                      <span className="font-semibold">{option.name}</span>
                      {option.is_local && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Uberlândia
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{option.company}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {option.is_local && option.description ? (
                        <span className="font-semibold text-green-700">
                          {option.description}
                        </span>
                      ) : option.delivery_range ? (
                        `Entre ${option.delivery_range.min} e ${option.delivery_range.max} dias úteis`
                      ) : (
                        `Até ${option.delivery_time} dias úteis`
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatCurrency(option.price || 0)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && options.length === 0 && cep && (
        <div className="text-center py-4 text-sm text-gray-500">
          <p>Nenhuma opção de frete encontrada para este CEP.</p>
          <p className="text-xs mt-1">
            Verifique o CEP ou tente novamente mais tarde.
          </p>
        </div>
      )}
    </div>
  )
}


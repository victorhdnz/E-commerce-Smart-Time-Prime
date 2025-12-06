'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, ProductColor } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, color?: ProductColor, quantity?: number) => Promise<void>
  removeItem: (productId: string, colorId?: string) => void
  updateQuantity: (productId: string, quantity: number, colorId?: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: async (product, color, quantity = 1) => {
        // Verificar estoque disponível (apenas por cor, se disponível)
        const availableStock = color?.stock !== undefined ? color.stock : undefined
        const existingItem = get().items.find(
          (item) =>
            item.product.id === product.id &&
            item.color?.id === color?.id &&
            !item.is_gift
        )
        
        const currentQuantity = existingItem ? existingItem.quantity : 0
        const requestedQuantity = currentQuantity + quantity
        
        // Limitar quantidade ao estoque disponível
        if (requestedQuantity > availableStock) {
          const maxAllowed = availableStock - currentQuantity
          if (maxAllowed <= 0) {
            throw new Error(`Estoque insuficiente. Disponível: ${availableStock} unidade(s)`)
          }
          quantity = maxAllowed
        }

        // Adicionar produto principal
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.product.id === product.id &&
              item.color?.id === color?.id &&
              !item.is_gift
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id &&
                item.color?.id === color?.id &&
                !item.is_gift
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { product, color, quantity, is_gift: false }],
          }
        })

        // Buscar e adicionar brindes automaticamente
        try {
          const supabase = createClient()
          const { data: gifts } = await supabase
            .from('product_gifts')
            .select(`
              gift_product_id,
              gift_product:products!product_gifts_gift_product_id_fkey(*)
            `)
            .eq('product_id', product.id)
            .eq('is_active', true)

          if (gifts && gifts.length > 0) {
            set((state) => {
              const newGifts = gifts.map((gift: any) => ({
                product: gift.gift_product,
                quantity: quantity, // Mesma quantidade do produto principal
                is_gift: true,
                parent_product_id: product.id, // Rastrear qual produto gerou o brinde
              }))

              // Remover brindes antigos deste produto
              const itemsWithoutOldGifts = state.items.filter(
                (item) => !(item.is_gift && item.parent_product_id === product.id)
              )

              return {
                items: [...itemsWithoutOldGifts, ...newGifts],
              }
            })
          }
        } catch (error) {
          console.error('Erro ao buscar brindes:', error)
        }
      },

      removeItem: (productId, colorId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.product.id === productId && item.color?.id === colorId)
          ),
        }))
      },

      updateQuantity: (productId, quantity, colorId) => {
        if (quantity <= 0) {
          get().removeItem(productId, colorId)
          return
        }

        // Verificar estoque disponível
        const item = get().items.find(
          (item) => item.product.id === productId && item.color?.id === colorId
        )
        
        if (item) {
          const availableStock = item.color?.stock !== undefined 
            ? item.color.stock 
            : undefined
          
          // Limitar quantidade ao estoque disponível (apenas se houver estoque definido)
          if (availableStock !== undefined && quantity > availableStock) {
            throw new Error(`Estoque insuficiente. Disponível: ${availableStock} unidade(s)`)
          }
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.color?.id === colorId
              ? { ...item, quantity }
              : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        const items = get().items
        return items.reduce((total, item) => {
          if (item.is_gift) return total
          return total + item.product.local_price * item.quantity
        }, 0)
      },

      getItemCount: () => {
        const items = get().items
        return items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)


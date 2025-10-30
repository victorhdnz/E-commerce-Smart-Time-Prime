'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils/format'
import { ShoppingCart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ProductCardProps {
  product: Product
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const mainImage = product.images?.[0] || product.colors?.[0]?.images[0]

  return (
    <Card hover className="group">
      <Link href={`/produtos/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden">
          {/* Image */}
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-6xl">⌚</span>
            </div>
          )}

          {/* Featured Badge */}
          {product.is_featured && (
            <div className="absolute top-4 left-4 bg-accent text-black px-3 py-1 rounded-full text-sm font-semibold">
              Destaque
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button variant="secondary" size="sm" className="mr-2">
              <Eye size={16} className="mr-2" />
              Ver Detalhes
            </Button>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/produtos/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.short_description}
          </p>
        )}

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-2 mb-3">
            {product.colors.slice(0, 5).map((color) => (
              <div
                key={color.id}
                className="w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color.color_hex }}
                title={color.color_name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-sm text-gray-500">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {product.bling_price && product.bling_price > product.local_price && (
              <span className="text-sm text-gray-500 line-through mr-2">
                {formatCurrency(product.bling_price)}
              </span>
            )}
            <span className="text-xl font-bold">
              {formatCurrency(product.local_price)}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            <ShoppingCart size={20} />
          </motion.button>
        </div>

        {/* Stock Status */}
        {product.stock === 0 ? (
          <p className="text-sm text-red-600 mt-2">Esgotado</p>
        ) : product.stock < 5 ? (
          <p className="text-sm text-orange-600 mt-2">
            Apenas {product.stock} em estoque
          </p>
        ) : null}
      </div>
    </Card>
  )
}


'use client'

import { ReactNode } from 'react'

interface SectionTransitionProps {
  children: ReactNode
  backgroundColor?: string
  className?: string
  isFirst?: boolean
  isLast?: boolean
  previousBgColor?: string
  nextBgColor?: string
}

export function SectionTransition({
  children,
  backgroundColor = '#ffffff',
  className = '',
  isFirst = false,
  isLast = false,
  previousBgColor,
  nextBgColor,
}: SectionTransitionProps) {

  // Converter RGB/RGBA para hex para comparação
  const rgbToHex = (rgb: string): string => {
    if (!rgb) return '#ffffff'
    if (rgb.startsWith('#')) return rgb.toLowerCase()
    
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/)
    if (!match) return '#ffffff'
    
    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])
    
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  // Normalizar cor para hex
  const normalizeColor = (color: string | undefined): string => {
    if (!color) return '#ffffff'
    return rgbToHex(color)
  }

  // Verificar se as cores são diferentes o suficiente para aplicar transição
  const shouldApplyTransition = (color1: string | undefined, color2: string | undefined): boolean => {
    if (!color1 || !color2) return false
    
    const hex1 = normalizeColor(color1)
    const hex2 = normalizeColor(color2)
    
    // Se as cores são iguais, não aplicar transição
    if (hex1 === hex2) return false
    
    // Calcular diferença de luminosidade
    const getLuminance = (hex: string): number => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      
      const [rs, gs, bs] = [r, g, b].map(val => {
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    
    const lum1 = getLuminance(hex1)
    const lum2 = getLuminance(hex2)
    const contrast = Math.abs(lum1 - lum2)
    
    // Aplicar transição se houver contraste significativo (mais de 0.1)
    return contrast > 0.1
  }

  const needsTopTransition = !isFirst && shouldApplyTransition(previousBgColor, backgroundColor)
  const needsBottomTransition = !isLast && shouldApplyTransition(backgroundColor, nextBgColor)

  // Criar sombra 3D baseada no contraste - efeito de relevo
  const create3DShadow = (fromColor: string, toColor: string, position: 'top' | 'bottom'): string => {
    const fromHex = normalizeColor(fromColor)
    const toHex = normalizeColor(toColor)
    
    // Determinar se é transição de claro para escuro ou vice-versa
    const getLuminance = (hex: string): number => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      const [rs, gs, bs] = [r, g, b].map(val => {
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    
    const lum1 = getLuminance(fromHex)
    const lum2 = getLuminance(toHex)
    
    // Efeito de relevo 3D: sombra superior para criar profundidade
    if (position === 'top') {
      // Sombra superior - cria efeito de elevação da seção atual
      if (lum1 > lum2) {
        // De claro para escuro: sombra mais forte embaixo (seção atual parece elevada)
        return `0 8px 16px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)`
      } else {
        // De escuro para claro: sombra mais sutil
        return `0 6px 12px -4px rgba(0,0,0,0.1), 0 3px 6px -2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.05)`
      }
    } else {
      // Sombra inferior - cria efeito de profundidade
      if (lum1 > lum2) {
        // De claro para escuro: sombra mais forte embaixo
        return `0 -4px 12px -2px rgba(0,0,0,0.1), 0 -2px 6px -1px rgba(0,0,0,0.06)`
      } else {
        // De escuro para claro: sombra mais sutil
        return `0 -3px 8px -2px rgba(0,0,0,0.08), 0 -1px 4px -1px rgba(0,0,0,0.04)`
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Sombra superior - efeito de relevo 3D */}
      {needsTopTransition && previousBgColor && backgroundColor && (
        <div
          className="absolute top-0 left-0 right-0 h-2 pointer-events-none z-10"
          style={{
            boxShadow: create3DShadow(previousBgColor, backgroundColor, 'top'),
          }}
        />
      )}

      {/* Conteúdo da seção */}
      <div className="relative z-0">
        {children}
      </div>

      {/* Sombra inferior - efeito de relevo 3D */}
      {needsBottomTransition && backgroundColor && nextBgColor && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2 pointer-events-none z-10"
          style={{
            boxShadow: create3DShadow(backgroundColor, nextBgColor, 'bottom'),
          }}
        />
      )}
    </div>
  )
}


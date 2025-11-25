'use client'

import { motion } from 'framer-motion'

interface AnimatedGradientBackgroundProps {
  color: string
  className?: string
  children?: React.ReactNode
}

export const AnimatedGradientBackground = ({
  color,
  className = '',
  children
}: AnimatedGradientBackgroundProps) => {
  // Converter cor hex para RGB para criar gradientes
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return [255, 255, 255]
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ]
  }

  const rgb = hexToRgb(color)
  
  // Criar variações da cor para o gradiente animado
  const createGradientVariations = (r: number, g: number, b: number) => {
    // Variação 1: cor original
    const base = `rgb(${r}, ${g}, ${b})`
    
    // Variação 2: mais clara (adicionar 20% de branco)
    const light = `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`
    
    // Variação 3: mais escura (reduzir 20%)
    const dark = `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`
    
    // Variação 4: com leve saturação diferente
    const saturated = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 10)})`
    
    return [base, light, dark, saturated, base]
  }

  const gradients = createGradientVariations(rgb[0], rgb[1], rgb[2])

  // Verificar se a cor é branca ou muito clara
  const isWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff'
  const isLightColor = rgb[0] > 200 && rgb[1] > 200 && rgb[2] > 200

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: color }}>
      {/* Gradiente animado de fundo - apenas para cores não brancas */}
      {!isWhite && !isLightColor && (
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              `radial-gradient(circle at 0% 50%, ${gradients[0]}, transparent 60%)`,
              `radial-gradient(circle at 100% 50%, ${gradients[1]}, transparent 60%)`,
              `radial-gradient(circle at 50% 0%, ${gradients[2]}, transparent 60%)`,
              `radial-gradient(circle at 50% 100%, ${gradients[3]}, transparent 60%)`,
              `radial-gradient(circle at 0% 50%, ${gradients[0]}, transparent 60%)`,
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Para cores brancas, usar um gradiente sutil cinza */}
      {(isWhite || isLightColor) && (
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            background: [
              `radial-gradient(circle at 0% 50%, rgba(0,0,0,0.1), transparent 70%)`,
              `radial-gradient(circle at 100% 50%, rgba(0,0,0,0.1), transparent 70%)`,
              `radial-gradient(circle at 50% 0%, rgba(0,0,0,0.1), transparent 70%)`,
              `radial-gradient(circle at 50% 100%, rgba(0,0,0,0.1), transparent 70%)`,
              `radial-gradient(circle at 0% 50%, rgba(0,0,0,0.1), transparent 70%)`,
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Conteúdo */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}


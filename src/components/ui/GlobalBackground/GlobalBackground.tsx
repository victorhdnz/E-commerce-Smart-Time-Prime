'use client'

import { useEffect, useState } from 'react'
import ColorBends from '@/components/ui/ColorBends/ColorBends'

export const GlobalBackground = () => {
  const [height, setHeight] = useState('100vh')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Aguardar o DOM estar pronto e garantir que o container tenha dimensões
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        setMounted(true)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Calcular altura até o footer (excluindo o footer)
    const updateHeight = () => {
      const footer = document.querySelector('footer')
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top + window.scrollY
        // Usar a posição do footer como altura máxima
        setHeight(`${footerTop}px`)
      } else {
        // Se não encontrar o footer, usar altura da viewport
        setHeight('100vh')
      }
    }

    // Aguardar o DOM estar pronto
    const timeoutId = setTimeout(updateHeight, 500)
    updateHeight()
    
    window.addEventListener('resize', updateHeight)
    window.addEventListener('scroll', updateHeight)

    // Observar mudanças no DOM
    const observer = new MutationObserver(() => {
      setTimeout(updateHeight, 100)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('scroll', updateHeight)
      observer.disconnect()
    }
  }, [mounted])

  if (!mounted) {
    return (
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ 
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          overflow: 'hidden',
          backgroundColor: '#000000',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0
        }}
      />
    )
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ 
        width: '100vw',
        height: height,
        zIndex: 0,
        overflow: 'hidden',
        backgroundColor: '#000000',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: '100vh',
          minWidth: '100vw'
        }}
      >
        <ColorBends
          colors={['#ff5c7a', '#8a5cff', '#00ffd1']}
          rotation={30}
          speed={0.3}
          scale={1.2}
          frequency={1.4}
          warpStrength={1.2}
          mouseInfluence={0.8}
          parallax={0.6}
          noise={0.08}
          transparent={false}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            minHeight: '100vh',
            minWidth: '100vw'
          }}
        />
      </div>
    </div>
  )
}


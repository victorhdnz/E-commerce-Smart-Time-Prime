'use client'

import { useEffect, useState } from 'react'
import ColorBends from '@/components/ui/ColorBends/ColorBends'

export const GlobalBackground = () => {
  const [height, setHeight] = useState('100vh')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Aguardar um pouco para garantir que o DOM está pronto
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
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
    const timeoutId = setTimeout(updateHeight, 200)
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
  }, [])

  return (
    <>
      {/* ColorBends com fundo próprio */}
      {mounted && (
        <div 
          className="fixed pointer-events-none" 
          style={{ 
            backgroundColor: 'transparent',
            width: '100vw',
            height: height,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 0,
            overflow: 'hidden'
          }}
        >
          <ColorBends
            colors={['#ffffff', '#d4af37', '#f5f5f5', '#ffd700']}
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
              bottom: 0
            }}
          />
        </div>
      )}
    </>
  )
}


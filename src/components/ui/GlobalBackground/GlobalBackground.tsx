'use client'

import { useEffect, useState } from 'react'
import Orb from '@/components/ui/Orb/Orb'

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
      {/* Fundo preto fixo */}
      <div 
        className="fixed pointer-events-none" 
        style={{ 
          backgroundColor: '#000000',
          width: '100vw',
          height: height,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 0,
          overflow: 'hidden'
        }}
      />
      {/* Orb sobre o fundo preto */}
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
            zIndex: 1,
            overflow: 'hidden'
          }}
        >
          <div style={{ 
            width: '100%', 
            height: '100%', 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            minWidth: '100%',
            minHeight: '100%'
          }}>
            <Orb
              hue={0}
              hoverIntensity={0.5}
              rotateOnHover={true}
              forceHoverState={false}
            />
          </div>
        </div>
      )}
    </>
  )
}


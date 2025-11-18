'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Lazy load do Orb para melhor performance
const Orb = dynamic(() => import('@/components/ui/Orb/Orb'), {
  ssr: false,
  loading: () => null
})

export const GlobalBackground = () => {
  const [height, setHeight] = useState('100vh')

  useEffect(() => {
    // Calcular altura até o footer (excluindo o footer)
    const updateHeight = () => {
      const footer = document.querySelector('footer')
      const main = document.querySelector('main')
      if (footer && main) {
        const mainTop = main.getBoundingClientRect().top + window.scrollY
        const footerTop = footer.getBoundingClientRect().top + window.scrollY
        const calculatedHeight = footerTop - mainTop
        setHeight(`${calculatedHeight}px`)
      } else {
        setHeight('100vh')
      }
    }

    // Aguardar o DOM estar pronto
    const timeoutId = setTimeout(updateHeight, 100)
    updateHeight()
    
    window.addEventListener('resize', updateHeight)
    window.addEventListener('scroll', updateHeight)

    // Observar mudanças no DOM
    const observer = new MutationObserver(() => {
      setTimeout(updateHeight, 50)
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
  )
}

